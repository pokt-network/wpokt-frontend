import React, { createContext, useState, useCallback, useContext } from "react";
import WebHIDTransport from "@ledgerhq/hw-transport-webhid";
import WebUSBTransport from "@ledgerhq/hw-transport-webusb";
import AppPokt from "hw-app-pokt";
import { LEDGER_CONFIG } from "../utils/ledger";
import { Config } from "../utils/config";
import { getDataSource } from "../utils/datasource";
import { typeGuard } from "@pokt-network/pocket-js";
import { GlobalContext } from "./Globals";

const dataSource = getDataSource();
const PUBLIC_KEY_TYPE = "crypto/ed25519_public_key";

const DEFAULT_TRANSPORT_STATE = {
  pocketApp: undefined,
  setPocketApp: () => {},
  onSelectDevice: async () => [],
  removeTransport: async () => {},
  sendTransaction: async () => {},
  isUsingHardwareWallet: false,
  isHardwareWalletLoading: false,
  setIsHardwareWalletLoading: () => {},
};

export interface TransportContextProps {
  pocketApp: any,
  setPocketApp: (value: any) => void,
  onSelectDevice: () => Promise<any[]>,
  removeTransport: () => Promise<void>,
  sendTransaction: (
    toAddress: string,
    amount: bigint,
    memo: any
  ) => Promise<any>,
  isUsingHardwareWallet: boolean,
  isHardwareWalletLoading: boolean,
  setIsHardwareWalletLoading: (value: boolean) => void,
}

declare global { 
  interface Window {
    USB: any;
  }
}

export const TransportContext = createContext<TransportContextProps>(DEFAULT_TRANSPORT_STATE);

export function TransportProvider({ children }: any) {
  const { poktAddress } = useContext(GlobalContext);
  const [pocketApp, setPocketApp] = useState<any>();
  const [isHardwareWalletLoading, setIsHardwareWalletLoading] = useState<boolean>(false);
  const isUsingHardwareWallet = pocketApp?.transport ? true : false;

  const initializePocketApp = useCallback((transport: any) => {
    const pocket = new AppPokt(transport);
    return pocket;
  }, []);

  const onSelectDevice = useCallback(async () => {
    if (pocketApp?.transport) {
      return [true, initializePocketApp(pocketApp.transport)];
    }

    let transport;
    let error;

    try {
      transport = await WebHIDTransport.request();
      return [true, initializePocketApp(transport)];
    } catch (e) {
      console.error(`HID Transport is not supported: ${e}`);
      error = e;
    }

    if (window.USB) {
      try {
        transport = await WebUSBTransport.request();
        return [true, initializePocketApp(transport)];
      } catch (e) {
        console.error(`WebUSB Transport is not supported: ${e}`);
        error = e;
      }
    }

    return [false, error];
  }, [initializePocketApp, pocketApp]);

  const removeTransport = useCallback(async () => {
    try {
      await pocketApp.transport.close();
      setPocketApp(undefined);
    } catch (e) {
      console.error(`Error closing device: ${e}`);
    }
  }, [pocketApp]);

  const sendTransaction = async (
    toAddress: string,
    amount: bigint,
    memo: any
  ) => {
    setIsHardwareWalletLoading(true);
    /* global BigInt */
    const entropy = Number(
      BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString()
    ).toString();

    const tx = {
      chain_id: Config.CHAIN_ID,
      entropy: entropy.toString(),
      fee: [
        {
          amount: Config.TX_FEE || "10000",
          denom: "upokt",
        },
      ],
      memo: memo || "",
      msg: {
        type: "pos/Send",
        value: {
          amount: amount.toString(),
          from_address: poktAddress,
          to_address: toAddress,
        },
      },
    };

    try {
      const stringifiedTx = JSON.stringify(tx);
      const hexTx = Buffer.from(stringifiedTx, "utf-8").toString("hex");
      const sig = await pocketApp.signTransaction(
        LEDGER_CONFIG.derivationPath,
        hexTx
      );

      const ledgerTxResponse = await dataSource.sendTransactionFromLedger(
        await pocketApp.getPublicKey(LEDGER_CONFIG.derivationPath), // publicKey,
        sig.signature,
        tx
      );
      if (typeGuard(ledgerTxResponse, Error)) {
        setIsHardwareWalletLoading(false);
        return ledgerTxResponse;
      }

      setIsHardwareWalletLoading(false);
      return ledgerTxResponse;
    } catch (e) {
      console.error("error: ", e);
      setIsHardwareWalletLoading(false);
      return e;
    }
  };

  return (
    <TransportContext.Provider
      value={{
        onSelectDevice,
        pocketApp,
        setPocketApp,
        removeTransport,
        isUsingHardwareWallet,
        sendTransaction,
        isHardwareWalletLoading,
        setIsHardwareWalletLoading,
      }}
    >
      {children}
    </TransportContext.Provider>
  );
}