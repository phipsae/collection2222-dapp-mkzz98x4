"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Link from "next/link";

const COLLECTION_ADDRESS = "0x..."; // Replace with deployed contract address
const COLLECTION_ABI = [
  "function totalSupply() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function MINT_PRICE() view returns (uint256)",
  "function getRemainingSupply() view returns (uint256)",
  "function isMintingAvailable() view returns (bool)"
];

export default function HomePage() {
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [maxSupply, setMaxSupply] = useState<number>(1000);
  const [mintPrice, setMintPrice] = useState<string>("0.11");
  const [remainingSupply, setRemainingSupply] = useState<number>(1000);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCollectionData();
  }, []);

  const fetchCollectionData = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(COLLECTION_ADDRESS, COLLECTION_ABI, provider);

        const [supply, maxSup, price, remaining] = await Promise.all([
          contract.totalSupply(),
          contract.MAX_SUPPLY(),
          contract.MINT_PRICE(),
          contract.getRemainingSupply()
        ]);

        setTotalSupply(Number(supply));
        setMaxSupply(Number(maxSup));
        setMintPrice(ethers.formatEther(price));
        setRemainingSupply(Number(remaining));
      }
    } catch (error) {
      console.error("Error fetching collection data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
            2222 Collection
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            An exclusive NFT collection of 1000 unique digital artworks. 
            Join the community and own a piece of digital history.
          </p>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">
              {isLoading ? "..." : totalSupply.toLocaleString()}
            </div>
            <div className="text-gray-300">Minted</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">
              {maxSupply.toLocaleString()}
            </div>
            <div className="text-gray-300">Max Supply</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">
              {mintPrice} ETH
            </div>
            <div className="text-gray-300">Mint Price</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex justify-between text-white mb-2">
            <span>Minting Progress</span>
            <span>{isLoading ? "..." : `${remainingSupply} remaining`}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-4 rounded-full transition-all duration-500"
              style={{ 
                width: isLoading ? "0%" : `${((totalSupply / maxSupply) * 100)}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Link 
            href="/mint"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105"
          >
            Mint Now
          </Link>
          
          <Link 
            href="/gallery"
            className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            View Gallery
          </Link>
          
          <Link 
            href="/my-nfts"
            className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            My Collection
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Limited Supply</h3>
            <p className="text-gray-300">Only 1000 unique NFTs will ever exist, making each one truly rare and valuable.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure Minting</h3>
            <p className="text-gray-300">Built with security best practices and audited smart contracts for safe transactions.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Community Driven</h3>
            <p className="text-gray-300">Join a vibrant community of collectors and artists building the future of digital art.</p>
          </div>
        </div>
      </div>
    </div>
  );
}