
"use client"
import React from "react";
import {   mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import type { Umi } from "@metaplex-foundation/umi";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { isSolanaChain } from "@solana/wallet-standard-chains";
import { useWallets } from "@wallet-standard/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {Metaplex} from '@metaplex-foundation/js'
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
export type NFTByOwnerContextType={
    nfts:NFT[];
    status:"idle"|"loading"|"error";
    error:Error | null;
    refetch:()=>void
}
export type NFT = {
  address: PublicKey;               // Pda
  mintAddress: PublicKey;
  name: string;
  symbol: string;
  uri: string | null;
  isMutable: boolean;
  primarySaleHappened: boolean;
  sellerFeeBasisPoints: number;
  creators: Array<{
    address: PublicKey;
    verified: boolean;
    share: number;
  }>;
  collection: {
    key: PublicKey;
    verified: boolean;
  } | null;
  collectionDetails: any | null;
  editionNonce: number | null;
  updateAuthorityAddress: PublicKey;
  tokenStandard: number | null;
  programmableConfig: any | null;
  uses: any | null;
  model: string;   // "metadata"
  json: any | null;
  jsonLoaded: boolean;
};
export const NFTByOwnerContext=createContext<NFTByOwnerContextType>({
    nfts:[],
    status:"idle",
    error:null,
    refetch: () => {
        throw new Error("Not implemented");
      }
})

export type NFTByOwnerContextProviderProps={
    children:React.ReactNode;
    rpcEndpoint:string
}




export const NFTByOwnerContextProvider: React.FC<NFTByOwnerContextProviderProps>=({children,rpcEndpoint}:NFTByOwnerContextProviderProps)=>{
    if(!rpcEndpoint){
        throw new Error("rpcEndpoint is required")
    }
    const connection=new Connection(clusterApiUrl("devnet"))
    const mx=Metaplex.make(connection)

    const allWallets=useWallets();
    const wallets = useMemo(() => allWallets.filter((wallet) => wallet.chains.some(isSolanaChain)), [allWallets]);
    const [status,setStatus]=useState<"idle" | "loading" | "error">("idle");
    const [error, setError] = useState<Error | null>(null);
    const [nfts, setNfts] = useState<NFT[]>([]);
    const umi=useMemo(()=>{
        return createUmi(rpcEndpoint).use(mplTokenMetadata())
    },[rpcEndpoint])
    const fetchNfts=useCallback(async (walletOwner:string|undefined,umiInstance:Umi)=>{
        if (!walletOwner){
            setNfts([])
            console.log("thewalle towner is ",walletOwner)
            return
        }
        setStatus("loading")
        setError(null)
        try {
            console.log("the wallet owner is ",walletOwner)
            const assets=await mx.nfts().findAllByOwner({owner:new PublicKey(walletOwner)})
            console.log("the assets are",assets)
            console.log("the assets are ",assets)
            setNfts(assets as NFT[])
        } catch (error:any) {
            setError(error)
        }
        finally{
            setStatus("idle")
        }
    },[])
    
    useEffect(() => {
        const address = wallets?.[0]?.accounts?.[0]?.address;
        fetchNfts(address, umi);
        console.log("the nfts are ",nfts)
    }, [wallets, umi, fetchNfts]);
    
    const refetch = useCallback(() => {
        const address = wallets?.[0]?.accounts?.[0]?.address;
        fetchNfts(address, umi);
    }, [wallets, umi, fetchNfts]);
    
    return React.createElement(
        NFTByOwnerContext.Provider,
        { value: { nfts, status, error, refetch } },
        children
      );
}
export function useNFTsByOwner() {
    return useContext(NFTByOwnerContext);
  }