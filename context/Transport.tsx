import React, { createContext, useState, useCallback, useContext, useEffect } from "react";
import WebHIDTransport from "@ledgerhq/hw-transport-webhid";
import WebUSBTransport from "@ledgerhq/hw-transport-webusb";
import AppPokt from "../hw-app/Pokt";
import { LEDGER_CONFIG } from "../utils/ledger";
// import { Config } from "../utils/config";
// import { getDataSource } from "../utils/datasource";
import { typeGuard } from "@pokt-network/pocket-js";
import { useGlobalContext } from "./Globals";
// import { getGatewayClient } from "@/utils/gateway";
import { UPOKT } from "@/utils/pokt";

// const dataSource = getDataSource();
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
  getPoktAddressFromLedger: async () => {},
  connectLedgerDevice: async () => {},
  setPoktAddressToLedger: async () => {}
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
  getPoktAddressFromLedger: () => Promise<any>,
  connectLedgerDevice: () => Promise<any>,
  setPoktAddressToLedger: (pocketApp: AppPokt) => Promise<void>
}

declare global { 
  interface Window {
    USB: any;
  }
}

export const TransportContext = createContext<TransportContextProps>(DEFAULT_TRANSPORT_STATE);
export const useTransport = () => useContext(TransportContext)

export function TransportProvider({ children }: any) {
  const { poktAddress, setPoktAddress } = useGlobalContext();
  const [pocketApp, setPocketApp] = useState<AppPokt>();
  const [isHardwareWalletLoading, setIsHardwareWalletLoading] = useState<boolean>(false);
  const isUsingHardwareWallet = pocketApp?.transport ? true : false;

  const initializePocketApp = useCallback(async (transport: any) => {
    console.log("initializing pokt app..")
    const pocket = new AppPokt(transport);
    setPocketApp(pocket);
    await setPoktAddressToLedger(pocket)
    return pocket;
  }, []);

  async function setPoktAddressToLedger(app: AppPokt | undefined) {
    try {
      if (app?.transport) {
        const { address } = await app?.getPublicKey(LEDGER_CONFIG.generateDerivationPath(0));
        if (!address) throw Error("No address found")
        return setPoktAddress(address);
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function connectLedgerDevice() {
    if (pocketApp?.transport) {
      return await initializePocketApp(pocketApp.transport)
    }
    
    let transport;
    let error;

    try {
      transport = await WebHIDTransport.request();
      return await initializePocketApp(transport);
    } catch (e) {
      console.error(`HID Transport is not supported: ${e}`);
      error = e;
    }

    if (window.USB) {
      try {
        transport = await WebUSBTransport.request();
        return await initializePocketApp(transport);
      } catch (e) {
        console.error(`WebUSB Transport is not supported: ${e}`);
        error = e;
      }
    }

    return error;
  }

  const onSelectDevice = useCallback(async () => {
    if (pocketApp?.transport) {
      const pocket = await initializePocketApp(pocketApp.transport)
      return [true, pocket];
    }

    let transport;
    let error;

    try {
      transport = await WebHIDTransport.request();
      const pocket = await initializePocketApp(transport)
      return [true, pocket];
    } catch (e) {
      console.error(`HID Transport is not supported: ${e}`);
      error = e;
    }

    if (window.USB) {
      try {
        transport = await WebUSBTransport.request();
        const pocket = await initializePocketApp(transport)
        return [true, pocket];
      } catch (e) {
        console.error(`WebUSB Transport is not supported: ${e}`);
        error = e;
      }
    }

    return [false, error];
  }, [initializePocketApp, pocketApp]);

  const removeTransport = useCallback(async () => {
    try {
      await pocketApp?.transport.close();
      setPocketApp(undefined);
      setPoktAddress("")
    } catch (e) {
      console.error(`Error closing device: ${e}`);
    }
  }, [pocketApp]);

  async function getPoktAddressFromLedger() {
    try {
      if (!pocketApp?.transport) throw Error("No transport found")
      const { address } = await pocketApp?.getPublicKey(LEDGER_CONFIG.generateDerivationPath(0));
      return address
    } catch (error) {
      console.error(error)
    }
  }

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
      chain_id: 'mainnet',
      entropy: entropy.toString(),
      fee: [
        {
          amount: "10000",
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
      const sig = await pocketApp?.signTransaction(
        LEDGER_CONFIG.derivationPath,
        hexTx
      );

      // const ledgerTxResponse = await dataSource.sendTransactionFromLedger(
      //   await pocketApp.getPublicKey(LEDGER_CONFIG.derivationPath), // publicKey,
      //   sig.signature,
      //   tx
      // );
      // if (typeGuard(ledgerTxResponse, Error)) {
      //   setIsHardwareWalletLoading(false);
      //   return ledgerTxResponse;
      // }

      // setIsHardwareWalletLoading(false);
      // return ledgerTxResponse;
    } catch (e) {
      console.error("error: ", e);
      setIsHardwareWalletLoading(false);
      return e;
    }
  };

  const poktGatewayUrl = `https://mainnet.gateway.pokt.network/v1/lb/${process.env.POKT_RPC_KEY}`

  async function getPoktBalanceFromLedger(address: string): Promise<number> {
    let balanceResponse;
    try {
      const res = await fetch(`${poktGatewayUrl}/v1/query/balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          height: 0,
        }),
      })
      balanceResponse = await res.json()
    } catch (error) {
      console.log(error);
      return 0;
    }

    const uPOKT = Number(balanceResponse?.balance?.toString());
    return (uPOKT ? uPOKT : 0) / UPOKT;
  }

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
        getPoktAddressFromLedger,
        connectLedgerDevice,
        setPoktAddressToLedger
      }}
    >
      {children}
    </TransportContext.Provider>
  );
}