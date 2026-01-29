"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Link from "next/link";

const COLLECTION_ADDRESS = "0x..."; // Replace with deployed contract address
const COLLECTION_ABI = [
  "function mint(uint256 quantity) payable",
  "function totalSupply() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function MINT_PRICE() view returns (uint256)",
  "function getRemainingSupply() view returns (uint256)",
  "function isMintingAvailable() view returns (bool)"
];

export default function MintPage() {
  const [account, setAccount] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [totalCost, setTotalCost] = useState<string>("0.11");
  const [mintPrice, setMintPrice] = useState<string>("0.11");
  const [remainingSupply, setRemainingSupply] = useState<number>(1000);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    checkConnection();
    fetchCollectionData();
  }, []);

  useEffect(() => {
    const cost = (parseFloat(mintPrice) * quantity).toFixed(3);
    setTotalCost(cost);
  }, [quantity, mintPrice]);

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
        setIsConnected(true);
        setError("");
      } catch (error: any) {
        setError("Failed to connect wallet");
        console.error("Error connecting wallet:", error);
      }
    } else {
      setError("Please install MetaMask to use this dApp");
    }
  };

  const fetchCollectionData = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(COLLECTION_ADDRESS, COLLECTION_ABI, provider);

        const [price, remaining, supply] = await Promise.all([
          contract.MINT_PRICE(),
          contract.getRemainingSupply(),
          contract.totalSupply()
        ]);

        setMintPrice(ethers.formatEther(price));
        setRemainingSupply(Number(remaining));
        setTotalSupply(Number(supply));
      }
    } catch (error) {
      console.error("Error fetching collection data:", error);
    }
  };

  const handleMint = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (quantity <= 0 || quantity > remainingSupply) {
      setError("Invalid quantity");
      return;
    }

    setIsMinting(true);
    setError("");
    setTxHash("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(COLLECTION_ADDRESS, COLLECTION_ABI, signer);

      const mintPriceWei = await contract.MINT_PRICE();
      const totalCostWei = mintPriceWei * BigInt(quantity);

      const tx = await contract.mint(quantity, {
        value: totalCostWei,
        gasLimit: 300000 * quantity
      });

      setTxHash(tx.hash);
      await tx.wait();

      // Refresh data after successful mint
      await fetchCollectionData();
      
      // Reset form
      setQuantity(1);
      
    } catch (error: any) {
      console.error("Minting error:", error);
      
      if (error.code === 4001) {
        setError("Transaction cancelled by user");
      } else if (error.message.includes("MaxSupplyExceeded")) {
        setError("Not enough NFTs remaining");
      } else if (error.message.includes("IncorrectPayment")) {
        setError("Incorrect payment amount");
      } else {
        setError("Minting failed. Please try again.");
      }
    } finally {
      setIsMinting(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= Math.min(10, remainingSupply)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-6 py-12">
        {/* Back Link */}
        <Link 
          href="/"
          className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Mint Your NFT</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Secure your spot in the 2222 collection. Each NFT is unique and stored permanently on the blockchain.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-12 border border-white/20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{totalSupply.toLocaleString()}</div>
              <div className="text-gray-300">Minted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{remainingSupply.toLocaleString()}</div>
              <div className="text-gray-300">Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{mintPrice} ETH</div>
              <div className="text-gray-300">Price Each</div>
            </div>
          </div>
        </div>

        {/* Minting Interface */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            
            {!isConnected ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Connect Your Wallet</h3>
                <p className="text-gray-300 mb-6">Connect your wallet to start minting NFTs</p>
                <button
                  onClick={connectWallet}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                {/* Connected Wallet */}
                <div className="mb-6">
                  <div className="text-sm text-gray-300 mb-1">Connected Wallet</div>
                  <div className="text-white font-mono text-sm bg-white/5 p-2 rounded border">
                    {`${account.slice(0, 6)}...${account.slice(-4)}`}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-3">Quantity</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 bg-white/10 text-white rounded-lg border border-white/20 disabled:opacity-50 hover:bg-white/20 transition-colors"
                    >
                      -
                    </button>
                    <div className="text-2xl font-bold text-white min-w-[3rem] text-center">
                      {quantity}
                    </div>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= Math.min(10, remainingSupply)}
                      className="w-10 h-10 bg-white/10 text-white rounded-lg border border-white/20 disabled:opacity-50 hover:bg-white/20 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm text-gray-300 mt-2">
                    Max 10 per transaction • {remainingSupply} remaining
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Cost</span>
                    <span className="text-2xl font-bold text-white">{totalCost} ETH</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {quantity} NFT{quantity > 1 ? 's' : ''} × {mintPrice} ETH
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                    <div className="text-red-300 text-sm">{error}</div>
                  </div>
                )}

                {/* Transaction Hash */}
                {txHash && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                    <div className="text-green-300 text-sm">
                      Transaction submitted! 
                      <a 
                        href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline ml-1 hover:text-green-200"
                      >
                        View on Etherscan
                      </a>
                    </div>
                  </div>
                )}

                {/* Mint Button */}
                <button
                  onClick={handleMint}
                  disabled={isMinting || remainingSupply === 0}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMinting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Minting...
                    </div>
                  ) : remainingSupply === 0 ? (
                    "Sold Out"
                  ) : (
                    `Mint ${quantity} NFT${quantity > 1 ? 's' : ''}`
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}