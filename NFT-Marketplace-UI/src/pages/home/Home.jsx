import React, { useEffect, useState } from 'react';
import {Bids, Header, Timer, Navbar } from '../../components'
import Web3 from 'web3';
import MetaMaskOnboarding from '@metamask/onboarding';
import {contractAddress, abi, chain} from '../../js/constants';


const ONBOARD_TEXT = 'Install MetaMask';
const CONNECT_TEXT = 'Connect with Metamask';
const CONNECTED_TEXT = 'Connected';
const web3 = new Web3(Web3.givenProvider || "ws://localhost:3000");
const onboarding = new MetaMaskOnboarding();
onboarding.startOnboarding();

const Home = () => {
  const maxNftLimit = 10;
  const [counter, setCounter] = useState(0);
  const [totalPriceText, setTotalPriceText] = useState('0');
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [isPublicMintActive, setIsPublicMintActive] = useState(false);
  const [isPreSaleMintActive, setIsPreSaleMintActive] = useState(false);
  const [isWhiteListed, setIsWhiteListed] = useState(false);

  // const onboarding = React.useRef();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts.length > 0) {
        setButtonText(CONNECTED_TEXT);
        setDisabled(true);
        onboarding.current.stopOnboarding();
        checkChain();
      } else {
        setButtonText(CONNECT_TEXT);
        setDisabled(false);
      }
    }
  }, [accounts]);

  useEffect(() => {
    function handleNewAccounts(newAccounts) {
      setAccounts(newAccounts);
    }
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(handleNewAccounts);
      window.ethereum.on('accountsChanged', handleNewAccounts);
      return () => {
        window.ethereum.off('accountsChanged', handleNewAccounts);
      };
    }
  }, []);

  const onClick = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((newAccounts) => setAccounts(newAccounts));
    } else {
      onboarding.current.startOnboarding();
    }
  };

  const metaMaskInit = async()=>{
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      checkChain();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
  
    if (window.web3) {
      // Check if User is already connected by retrieving the accounts
      await window.web3.eth.getAccounts().then(async (addr) => {
        accounts = addr;
      });
    }
  }


  const updateConnectStatus = async () => {
  // const onboarding = new MetaMaskOnboarding();
  // const onboardButton = document.getElementById("connectWallet");
  // const notConnected = document.querySelector('.not-connected');
  // const spinner = document.getElementById("spinner");
  // if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
  //   onboardButton.innerText = "Install MetaMask!";
  //   onboardButton.onclick = () => {
  //     onboardButton.innerText = "Connecting...";
  //     onboardButton.disabled = true;
  //     onboarding.startOnboarding();
  //     // HIDE SPINNER
  //     spinner.classList.add('hidden');
  //     notConnected.classList.remove('hidden');
  //     notConnected.classList.add('show-not-connected');
  //   };
  // } else 
  if (accounts && accounts.length > 0) {
    // onboardButton.innerText = `✔ ...${accounts[0].slice(-4)}`;
    window.address = accounts[0];
    // onboardButton.disabled = true;
    // onboarding.stopOnboarding();
    // notConnected.classList.remove('show-not-connected');
    // notConnected.classList.add('hidden');
    // SHOW SPINNER
    // spinner.classList.remove('hidden');
    window.contract = new web3.eth.Contract(abi, contractAddress);
    loadInfo();
  } else {
    // onboardButton.innerText = "Connect MetaMask!";
    // HIDE SPINNER
    // spinner.classList.add('hidden');
    // notConnected.classList.remove('hidden');
    // notConnected.classList.add('show-not-connected');
    // onboardButton.onclick = async () => {
    //   await window.ethereum
    //     .request({
    //       method: "eth_requestAccounts",
    //     })
    //     .then(function (accts) {
          // onboardButton.innerText = `✔ ...${accts[0].slice(-4)}`;
          // notConnected.classList.remove('show-not-connected');
          // notConnected.classList.add('hidden');
          // SHOW SPINNER
          // spinner.classList.remove('hidden');
          // onboardButton.disabled = true;
        //   window.address = accts[0];
        //   setAccounts(accts);
        //   window.contract = new web3.eth.Contract(abi, contractAddress);
        //   loadInfo();
        // });
    // };
  }
};

async function checkChain() {
  let chainId = 0;
  if(chain === 'rinkeby') {
    chainId = 4;
  } else if(chain === 'polygon') {
    chainId = 137;
  }
  if (window.ethereum.networkVersion !== chainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: web3.utils.toHex(chainId) }],
      });
      updateConnectStatus();
    } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask.
      if (err.code === 4902) {
        try {
          if(chain === 'rinkeby') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: 'Rinkeby Test Network',
                  chainId: web3.utils.toHex(chainId),
                  nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
                  rpcUrls: ['https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
                },
              ],
            });
          } else if(chain === 'polygon') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: 'Polygon Mainnet',
                  chainId: web3.utils.toHex(chainId),
                  nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                  rpcUrls: ['https://polygon-rpc.com/'],
                },
              ],
            });
          }
          updateConnectStatus();
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
}

async function loadInfo() {
  window.info = await window.contract.methods.getInfo().call();
  const publicMintActive = await window?.contract?.methods?.mintingActive().call();
  const presaleMintActive = await window?.contract?.methods?.presaleActive().call();

  console.log(publicMintActive, "publicMintActive");
  console.log(presaleMintActive, "presaleMintActive");
  // const mainHeading = document.getElementById("mainHeading");
  // const subHeading = document.getElementById("subHeading");
  // const mainText = document.getElementById("mainText");
  // const actionButton = document.getElementById("actionButton");
  // const mintContainer = document.getElementById("mintContainer");
  // const mintButton = document.getElementById("mintButton");
  // const spinner = document.getElementById("spinner");

  let startTime = "";
  if (publicMintActive) {
    setIsPublicMintActive(true)
    // mainHeading.innerText = h1_public_mint;
    // mainText.innerText = p_public_mint;
    // actionButton.classList.add('hidden');
    // mintButton.innerText = button_public_mint;
    // mintContainer.classList.remove('hidden');
    setTotalPrice();
  } else if (presaleMintActive) {
    setIsPreSaleMintActive(true)
    startTime = window.info.runtimeConfig.publicMintStart;
    // mainHeading.innerText = h1_presale_mint;
    // subHeading.innerText = h2_presale_mint;
    
    try {
      // CHECK IF WHITELISTED
      const merkleData = await fetch(
        `/.netlify/functions/merkleProof/?wallet=${window.address}&chain=${chain}&contract=${contractAddress}`
      );
      const merkleJson = await merkleData.json();
      const whitelisted = await window.contract.methods.isWhitelisted(window.address, merkleJson).call();
      console.log(whitelisted, "whiteListedddd======================")
      if(!whitelisted) {
        setIsWhiteListed(true);
        // mainText.innerText = p_presale_mint_not_whitelisted;
        // actionButton.innerText = button_presale_mint_not_whitelisted;
      } else {
        // mainText.innerText = p_presale_mint_whitelisted;
        // actionButton.classList.add('hidden');
        // mintButton.innerText = button_presale_mint_whitelisted;
        // mintContainer.classList.remove('hidden');
      }
    } catch(e) {
      setIsWhiteListed(false);
      // console.log(e);
      // mainText.innerText = p_presale_mint_already_minted;
      // actionButton.innerText = button_presale_already_minted;
    }
    setTotalPrice();
  } else {
    startTime = window.info.runtimeConfig.presaleMintStart;
    // mainHeading.innerText = h1_presale_coming_soon;
    // subHeading.innerText = h2_presale_coming_soon;
    // mainText.innerText = p_presale_coming_soon;
    // actionButton.innerText = button_presale_coming_soon;
  }

  // const clockdiv = document.getElementById("countdown");
  // clockdiv.setAttribute("data-date", startTime);
  // countdown();

  // HIDE SPINNER
  // spinner.classList.add('hidden');

  // SHOW CARD
  // setTimeout(() => {
  //   const countdownCard = document.querySelector('.countdown');
  //   countdownCard.classList.add('show-card');
  // }, 1000);

  let priceType = '';
  if(chain === 'rinkeby') {
    priceType = 'ETH';
  } else if (chain === 'polygon') {
    priceType = 'MATIC';
  }
  const price = web3.utils.fromWei(window.info.deploymentConfig.mintPrice, 'ether');
  // const pricePerMint = document.getElementById("pricePerMint");
  // const maxPerMint = document.getElementById("maxPerMint");
  // const totalSupply = document.getElementById("totalSupply");
  // const mintInput = document.getElementById("mintInput");
  
  // pricePerMint.innerText = `${price} ${priceType}`;
  // maxPerMint.innerText = `${window.info.deploymentConfig.tokensPerMint}`;
  // totalSupply.innerText = `${window.info.deploymentConfig.maxSupply}`;
  // mintInput.setAttribute("max", window.info.deploymentConfig.tokensPerMint);

  // MINT INPUT
  // const mintIncrement = document.getElementById("mintIncrement");
  // const mintDecrement = document.getElementById("mintDecrement");
  // const setQtyMax = document.getElementById("setQtyMax");
  // const min = mintInput.attributes.min.value || false;
  // const max = mintInput.attributes.max.value || false;
  // mintDecrement.onclick = () => {
  //   let value = parseInt(mintInput.value) - 1 || 1;
  //   if(!min || value >= min) {
  //     mintInput.value = value;
  //     setTotalPrice()
  //   }
  // };
  // mintIncrement.onclick = () => {
  //   let value = parseInt(mintInput.value) + 1 || 1;
  //   if(!max || value <= max) {
  //     mintInput.value = value;
  //     setTotalPrice()
  //   }
  // };
  // setQtyMax.onclick = () => {
  //   mintInput.value = max;
  //   setTotalPrice()
  // };
  // mintInput.onchange = () => {
  //   setTotalPrice()
  // };
  // mintInput.onkeyup = async (e) => {
  //   if (e.keyCode === 13) {
  //     mint();
  //   }
  // };
  // mintButton.onclick = mint;
}

function setTotalPrice() {
  const mintInput = document.getElementById("mintInput");
  const mintInputValue = parseInt(mintInput.value);
  const totalPrice = document.getElementById("totalPrice");
  const mintButton = document.getElementById("mintButton");
  if(counter < 1 || counter > window.info.deploymentConfig.tokensPerMint) {
    // totalPrice.innerText = 'INVALID QUANTITY';
    // mintButton.disabled = true;
    // mintInput.disabled = true;
    alert('Invalid Quantity')
  }
  const totalPriceWei = (window.info.deploymentConfig.mintPrice) * (counter);
  
  let priceType = '';
  if(chain === 'rinkeby') {
    priceType = 'ETH';
  } else if (chain === 'polygon') {
    priceType = 'MATIC';
  }
  const price = web3.utils.fromWei(totalPriceWei.toString(), 'ether');
  // totalPrice.innerText = `${price} ${priceType}`;
  setTotalPriceText(`${price} ${priceType}`)
  // mintButton.disabled = false;
  // mintInput.disabled = false;
}

async function mint() {
  const {contract} = window;
  // const mintButton = document.getElementById("mintButton");
  // mintButton.disabled = true;
  // const spinner = '<div class="dot-elastic"></div><span>Waiting for transaction...</span>';
  // mintButton.innerHTML = spinner;

  const amount = parseInt(document.getElementById("mintInput").value);
  const value = (window.info.deploymentConfig.mintPrice) * (amount);
  const publicMintActive = await contract.methods.mintingActive().call();
  const presaleMintActive = await contract.methods.presaleActive().call();

  console.log(publicMintActive, "publicMintActive3333");
  console.log(presaleMintActive, "presaleMintActive33333");

  if (publicMintActive) {
    // PUBLIC MINT
    try {
      const mintTransaction = await contract.methods
        .mint(amount)
        .send({ from: window.address, value: value.toString() });
      if(mintTransaction) {
        if(chain === 'rinkeby') {
          const url = `https://rinkeby.etherscan.io/tx/${mintTransaction.transactionHash}`;
          const mintedContainer = document.querySelector('.minted-container');
          const countdownContainer = document.querySelector('.countdown');
          const mintedTxnBtn = document.getElementById("mintedTxnBtn");
          mintedTxnBtn.href = url;
          countdownContainer.classList.add('hidden');
          mintedContainer.classList.remove('hidden');
        }
        console.log("Minuted successfully!", `Transaction Hash: ${mintTransaction.transactionHash}`);
      } else {
        // const mainText = document.getElementById("mainText");
        // mainText.innerText = mint_failed;
        // mintButton.innerText = button_public_mint;
        // mintButton.disabled = false;

        console.log("Failed to mint!");
      }
    } catch(e) {
      // const mainText = document.getElementById("mainText");
      // mainText.innerText = mint_failed;
      // mintButton.innerText = button_public_mint;
      // mintButton.disabled = false;

      console.log(e);
    }
  } else if (presaleMintActive) {
    // PRE-SALE MINTING
    try {
      const merkleData = await fetch(
        `/.netlify/functions/merkleProof/?wallet=${window.address}&chain=${chain}&contract=${contractAddress}`
      );
      const merkleJson = await merkleData.json();
      const presaleMintTransaction = await contract.methods
        .presaleMint(amount, merkleJson)
        .send({ from: window.address, value: value.toString() });
      if(presaleMintTransaction) {
        if(chain === 'rinkeby') {
          const url = `https://rinkeby.etherscan.io/tx/${presaleMintTransaction.transactionHash}`;
          const mintedContainer = document.querySelector('.minted-container');
          const countdownContainer = document.querySelector('.countdown');
          const mintedTxnBtn = document.getElementById("mintedTxnBtn");
          mintedTxnBtn.href = url;
          countdownContainer.classList.add('hidden');
          mintedContainer.classList.remove('hidden');
        }
        console.log("Minuted successfully!", `Transaction Hash: ${presaleMintTransaction.transactionHash}`);
      } else {
        // const mainText = document.getElementById("mainText");
        // mainText.innerText = mint_failed;
        // mintButton.innerText = button_presale_mint_whitelisted;
        // mintButton.disabled = false;

        console.log("Failed to mint!");
      }
    } catch(e) {
      // const mainText = document.getElementById("mainText");
      // mainText.innerText = mint_failed;
      // mintButton.innerText = button_presale_mint_whitelisted;
      // mintButton.disabled = false;

      // console.log(e);
    }
  }
}


  // useEffect(()=>{
  //   metaMaskInit();
  // },[]);



  return <div>
   <Navbar
    walletbuttonDisabled={isDisabled} 
    walletOnClick={()=>onClick()}
    walletButtonTitle={buttonText} 
   />
   <Header />
   {/* <Bids title="Hot Bids"  /> */}
   {
     accounts.length > 0 &&
    <div style={{color: '#fff', margin: '20% auto !important'}}>
      <h2>{JSON.stringify(accounts)}</h2>
      <Timer
        deadline={new Date("Mar 30, 2022 24:00:00").getTime()}
      />

      {
      isPreSaleMintActive && isWhiteListed ?
      <>
          <div style={{display: 'flex', justifyContent: 'space-around'}}>
            <div style={{display: 'flex'}}>
              <button type='button' onClick={()=>setCounter(counter == 0 ? 0 : counter-1)}>-</button>
              <h4 style={{margin: '0 20px'}}>{counter}</h4>
              <button type='button' onClick={()=>setCounter(counter == maxNftLimit ? maxNftLimit : counter+1)}>+</button>
            </div>

            <button type='button' onClick={()=>setCounter(maxNftLimit)}>Set Max</button>
            <p>{maxNftLimit}</p>
          </div>
            <button style={{margin: 'auto', width: 300}} type='button' onClick={()=>mint()}>Mint</button>
        </>
        :
        <div style={{textAlign: 'center', marginBottom: 30}}>
          You are not whitelisted for pre-sale
          <div style={{padding: 20, width: 200, backgroundColor: 'dodgerblue', margin: '20px auto'}}>
          <a target="_blank" href='https://google.com'>
            Get on the whitelist!
          </a>
          </div>
        </div>
      }
    </div>
   }
  </div>;
};

export default Home;
