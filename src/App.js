import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./WavePortal.json";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import MM from './metamask-icon.png';

const getEthereumObject = () => window.ethereum;
const findMetamask = async() => {
    try {
      const ethereum = getEthereumObject();

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return null;
      }

      console.log("We have the ethereum object", ethereum);

      const accounts = await ethereum.request({
        method: "eth_accounts"
      });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        return account;
      } else {
        console.error("No authorized account found");
        return null;
      }
    } catch (error)
     {
      console.log(error);
      return null;
    }
}

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

  const contractAddress = "0x781C5b1B86b4d012dbcE38731E00fB95e687e913";
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        //  Call the getAllWaves method from your Smart Contract
        const waves = await wavePortalContract.getAllWaves();
        // We only need address, timestamp, and message in our UI so let's pick those out
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.unshift({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000).toLocaleString('en-US'),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
        console.log(allWaves[0].address);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getAllWaves();
    } catch (error) {
      console.error(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        //remember to set goerli network in metamask
        console.log("Retrieved total wave count...", count.toNumber());

        //const waveTxn = await wavePortalContract.wave();
        console.log(message);
        const waveTxn = await wavePortalContract.wave(message)
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setMessage("");
        getAllWaves();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    findMetamask().then((account) => {
      if (account !== null) {
        setCurrentAccount(account);
      }
    });
    getAllWaves();
  }, []);

  const handleMessage = (e) => {
    // console.log(e.target.value);
    setMessage(e.target.value);
  }
  // console.log(allWaves[0].address)
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <Stack direction="row" spacing={1} justifyContent="right" alignItems="flex-end">
          <Chip
            avatar=<Avatar alt="Natacha" src={MM}/>
            label={currentAccount ? currentAccount.slice(0,6)+"..." : "0x0000..."}
            variant="outlined"
            size = "medium"
          />
        </Stack>
  
        <div className="header">
        Hey there!
        </div>

        <div className="bio">
        Hello Myself Ayush, Connect your Ethereum wallet and tell me something I don't know!
        and you will be rewared 0.002 ETH
        <p>You can share your Spotify playlist too :)</p>
        </div>

        <div>
          <input className="textInput"  
          value={message} 
          onChange={handleMessage} 
          type="input" 
          placeholder="Write a message here."/>
        </div>

        <Stack spacing={2} direction="row">
          {message===""?
          <Button 
            className="waveButton" 
            color="primary" 
            variant="contained"
            disabled
            onClick={wave}
          >Wave at Me
          </Button>
          :
          <Button 
            className="waveButton" 
            color="primary" 
            variant="contained"
            onClick={wave}
          >Wave at Me
          </Button>}
          {!currentAccount && (
          <Button className="waveButton" variant="contained" onClick={connectWallet}>Connect Wallet</Button>
          )}
        </Stack>


        {allWaves.map((wave, index) => {
          return (
            // <div className="info" key={index}> //style={{ backgroundColor: "white", border: "0.5px solid black", borderRadius: "5px", padding: "10px", marginTop: "10px" }}>
            <div className="info" key={index}>
              Message: {wave.message}<br/>
              Address: {wave.address}<br/>
              Time: {wave.timestamp}
            </div>)
        })}
      </div>
    </div>
  );
}
export default App;
