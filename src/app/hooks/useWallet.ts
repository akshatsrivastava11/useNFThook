'use client'
import * as React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getWalletFeature, useWallets } from "@wallet-standard/react";
import type { UiWallet, UiWalletAccount } from "@wallet-standard/ui";
import { isSolanaChain } from "@solana/wallet-standard-chains";
import {
  StandardConnect,
  StandardDisconnect,
} from "@wallet-standard/features";
import type { StandardConnectFeature,StandardConnectInput,StandardDisconnectFeature } from "@wallet-standard/features";
import {
  getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from "@wallet-standard/ui-registry";
import { persistentAtom } from "@nanostores/persistent";
import { useStore } from "@nanostores/react";

interface WalletContextValue {
  account: UiWalletAccount | undefined;
  connect: (uiWallet: UiWallet) => Promise<UiWalletAccount>;
  disconnect: (uiWallet: UiWallet) => Promise<void>;
  status: "idle" | "connecting" | "disconnecting";
  wallet: UiWallet | undefined;
  wallets: readonly UiWallet[];
}

export const WalletContext = createContext<WalletContextValue>({
  account: undefined,
  connect: async () => {
    throw new Error("Not implemented");
  },
  disconnect: async () => {
    throw new Error("Not implemented");
  },
  status: "idle",
  wallet: undefined,
  wallets: [],
});

export type WalletContextProviderProps = {
  children: ReactNode;
};

export const walletStore = persistentAtom<string>("gill:wallet", "");

export const WalletContextProvider: React.FC<WalletContextProviderProps>=({ children }: WalletContextProviderProps)=>{
  const storeValue = useStore(walletStore);
  const allWallets = useWallets();
  const wallets = useMemo(() => allWallets.filter((wallet) => wallet.chains.some(isSolanaChain)), [allWallets]);
  const [status, setStatus] = useState<"idle" | "connecting" | "disconnecting">("idle");

  const wallet = useMemo(() => {
    if (!storeValue) {
      return undefined;
    }
    console.log("the store value is ",storeValue)

    const [wallet] = storeValue.split(":");
    console.log("the wallet is ",wallet)
    return wallets.find((w) => w.name === wallet);
  }, [storeValue, wallets]);

  const account = useMemo(() => {
    if (!storeValue || !wallet) {
      return undefined;
    }

    const [, address] = storeValue.split(":");
    return wallet.accounts.find((a) => a.address === address);
  }, [storeValue, wallet]);

  const connect = async (uiWallet: UiWallet, input?: StandardConnectInput) => {
    if (status === "connecting") {
      throw new Error("Connect in progress");
    }

    try {
      setStatus("connecting");

      const connectFeature = getWalletFeature(
        uiWallet,
        StandardConnect,
      ) as StandardConnectFeature[typeof StandardConnect];
      const wallet = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(uiWallet);
      const result = await connectFeature.connect(input);
      const account = getOrCreateUiWalletAccountForStandardWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
        wallet,
        result.accounts[0],
      );

      walletStore.set(`${uiWallet.name}:${account.address}`);

      return account;
    } finally {
      setStatus("idle");
    }
  };

  const disconnect = async (uiWallet: UiWallet) => {
    if (status === "disconnecting") {
      throw new Error("Disconnect in progress");
    }

    try {
      setStatus("disconnecting");

      const disconnectFeature = getWalletFeature(
        uiWallet,
        StandardDisconnect,
      ) as StandardDisconnectFeature[typeof StandardDisconnect];
      const result = await disconnectFeature.disconnect();

      walletStore.set("");

      return result;
    } finally {
      setStatus("idle");
    }
  };

  const value = useMemo(
    () => ({ account, connect, disconnect, status, wallet, wallets }),
    [account, connect, disconnect, status, wallet, wallets],
  );
return React.createElement(WalletContext.Provider,{value},children)
}

export function useWallet() {
  return useContext(WalletContext);
}