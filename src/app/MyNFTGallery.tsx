'use client';
import React from 'react';
// import { useWallet } from '../hooks/WalletContext';
import { useNFTsByOwner } from './hooks/useNFT';
import { useWallet } from './hooks/useWallet';

export const MyNFTGallery = () => {
  const { account, wallet,wallets,connect,disconnect } = useWallet();
  const { nfts, status, error, refetch } = useNFTsByOwner();

const handleConnect = async () => {
  console.log("Connecting wallet...");
  console.log("available wallets:", wallets);

  if (wallets.length > 0) {
    try {
      await connect(wallets[0]); // connect the first available wallet
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  } else {
    console.warn("No wallets detected. Please install Phantom, Solflare, etc.");
  }
};

  const handleDisconnect = async () => {
    
    if (wallet) {
      try {
        await disconnect(wallet);
      } catch (err) {
        console.error('Disconnect failed', err);
      }
    }
  };

  return (
    <div>
      <h2>My NFT Gallery</h2>
          <div>
      {account ? (
        <>
          <p>Connected: {account.address}</p>
          <button onClick={handleDisconnect}>
          disconnect
          </button>
        </>
      ) : (
        <button onClick={handleConnect}>
          Connect
        </button>
      )}
    </div>


      <button onClick={refetch} disabled={status === 'loading'}>
        {status === 'loading' ? 'Refreshing...' : 'Refresh NFTs'}
      </button>

      {status === 'error' && <p style={{ color: 'red' }}>Error: {error?.message}</p>}
      
      {nfts.length === 0 && status !== 'loading' && (
        <p>No NFTs found for this wallet.</p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {nfts.map((nft) => (
          <div key={nft.address.toString()} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <p><strong>{nft.mintAddress.toString()}</strong></p>
            {/* Note: You might need to fetch the image from nft.metadata.uri */}
            <p>URI: {nft.uri}</p>
          </div>
        ))}
      </div>
    </div>
  );
};