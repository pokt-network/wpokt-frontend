import { ErrorIcon, InfoIcon } from "@/components/icons/misc";
import { Burn, Mint } from "@/types";
import { WRAPPED_POCKET_ABI } from "@/utils/abis";
import { ETH_CHAIN_ID, POKT_CHAIN_ID, POKT_MULTISIG_ADDRESS, WPOKT_ADDRESS } from "@/utils/constants";
import { getDataSource } from "@/datasource";
import { isValidEthAddress } from "@/utils/misc";
import { HStack, Link, Text, useInterval, useToast } from "@chakra-ui/react";
import { typeGuard } from "@pokt-network/pocket-js";
import { createContext, useContext, useEffect, useState } from "react";
import { getAddress } from "viem";
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import AppPokt from "../hw-app/Pokt";
import { LEDGER_CONFIG } from "@/utils/ledger";
import { bech32ToHex, isPoktShannonAddress, PoktGatewayApi, STDX_MSG_TYPES } from "@/utils/pokt";

declare global {
  interface Window {
    pocketNetwork: any;
    pocketShannon: any;
  }
}

export async function fetchActiveMints(ethAddress: string): Promise<Mint[]> {
  const res = await fetch(`/api/mints/active?recipient=${ethAddress}`)
  const mints = await res.json()
  return mints as Mint[]
}

export async function fetchActiveBurns(ethAddress: string): Promise<Burn[]> {
  const res = await fetch(`/api/burns/active?sender=${ethAddress}`)
  const burns = await res.json()
  return burns as Burn[]
}

// pokt1jm6ww5ydcude4q7nj029y7usruzsksnqwwf96l
// pokt1cq4s6pf2kukh36a9h3npy6d6v9tpnjl5ph4aec
// 317bbb64a0dda24aa07284c64fbdf765ba1f0b50

export interface GlobalContextProps {
  mobile: boolean
  setMobile: (mobile: boolean) => void
  poktBalance: bigint
  setPoktBalance: (balance: bigint) => void
  poktAddress: string
  setPoktAddress: (address: string) => void
  setPoktShannonAddress: (address: string) => void
  connectSendWallet: () => void
  ethAddress: string
  setEthAddress: (address: string) => void
  destination: "eth" | "pokt"
  setDestination: (destination: "eth" | "pokt") => void,
  poktAmount: bigint
  setPoktAmount: (amount: bigint) => void
  wPoktAmount: bigint
  setWPoktAmount: (amount: bigint) => void
  poktAmountInput: string
  setPoktAmountInput: (amount: string) => void
  wPoktAmountInput: string
  setWPoktAmountInput: (amount: string) => void
  bridgePoktToEthereum: (ethAddress: string, amount: number | bigint) => Promise<void>
  poktTxHash: string
  setPoktTxHash: (hash: string) => void
  poktTxOngoing: boolean
  setPoktTxOngoing: (ongoing: boolean) => void
  poktTxSuccess: boolean
  setPoktTxSuccess: (success: boolean) => void
  poktTxError: boolean
  ethTxHash: string
  setEthTxHash: (hash: string) => void
  currentMint: Mint | undefined
  setCurrentMint: (mint: Mint | undefined) => void
  currentBurn: Burn | undefined
  setCurrentBurn: (burn: Burn | undefined) => void
  allPendingMints: Mint[]
  setAllPendingMints: (mints: Mint[]) => void
  allPendingBurns: Burn[]
  setAllPendingBurns: (burns: Burn[]) => void
  burnFunc: any
  burnTx: any
  mintTx: any
  mintTxHash: `0x${string}` | undefined
  setMintTxHash: (hash: `0x${string}` | undefined) => void
  getPoktBalance: () => void
  screenWidth?: number
  isUsingHardwareWallet: boolean
  setIsUsingHardwareWallet: (value: boolean) => void
  pocketApp?: AppPokt
  setPocketApp: (value: AppPokt | undefined) => void
  isSigningTx: boolean,
  setIsSigningTx: (value: boolean) => void
  resetProgress: () => void
}

export const GlobalContext = createContext<GlobalContextProps>({
  mobile: false,
  setMobile: () => { },
  poktBalance: BigInt(0),
  setPoktBalance: () => { },
  poktAddress: "",
  setPoktAddress: () => { },
  setPoktShannonAddress: () => { },
  connectSendWallet: () => { },
  ethAddress: "",
  setEthAddress: () => { },
  destination: "pokt",
  setDestination: () => { },
  poktAmount: BigInt(0),
  setPoktAmount: () => { },
  wPoktAmount: BigInt(0),
  setWPoktAmount: () => { },
  poktAmountInput: "",
  setPoktAmountInput: () => { },
  wPoktAmountInput: "",
  setWPoktAmountInput: () => { },
  bridgePoktToEthereum: async () => { },
  poktTxHash: "",
  setPoktTxHash: () => { },
  poktTxOngoing: false,
  setPoktTxOngoing: () => { },
  poktTxSuccess: false,
  setPoktTxSuccess: () => { },
  poktTxError: false,
  ethTxHash: "",
  setEthTxHash: () => { },
  currentMint: undefined,
  setCurrentMint: () => { },
  currentBurn: undefined,
  setCurrentBurn: () => { },
  allPendingMints: [],
  setAllPendingMints: () => { },
  allPendingBurns: [],
  setAllPendingBurns: () => { },
  burnFunc: () => { },
  burnTx: () => { },
  mintTx: () => { },
  mintTxHash: undefined,
  setMintTxHash: () => { },
  getPoktBalance: () => { },
  screenWidth: undefined,
  isUsingHardwareWallet: false,
  setIsUsingHardwareWallet: () => { },
  pocketApp: undefined,
  setPocketApp: () => { },
  isSigningTx: false,
  setIsSigningTx: () => { },
  resetProgress: () => { }
})


export const dataSource = getDataSource();
export const useGlobalContext = () => useContext(GlobalContext)

export function GlobalContextProvider({ children }: any) {
  const [mobile, setMobile] = useState<boolean>(false)
  const [screenWidth, setScreenWidth] = useState<number | undefined>(undefined)
  const [poktBalance, setPoktBalance] = useState<bigint>(BigInt(0))
  const [poktAddress, setPoktAddress] = useState<string>("")
  const [ethAddress, setEthAddress] = useState<string>("")
  const [destination, setDestination] = useState<"eth" | "pokt">("pokt") // eth = pokt -> wpokt, pokt = wpokt -> pokt
  const [poktAmount, setPoktAmount] = useState<bigint>(BigInt(0))
  const [wPoktAmount, setWPoktAmount] = useState<bigint>(BigInt(0))
  const [poktAmountInput, setPoktAmountInput] = useState<string>("")
  const [wPoktAmountInput, setWPoktAmountInput] = useState<string>("")
  const [poktTxHash, setPoktTxHash] = useState<string>("")
  const [ethTxHash, setEthTxHash] = useState<string>("")
  const [poktTxOngoing, setPoktTxOngoing] = useState<boolean>(false)
  const [poktTxSuccess, setPoktTxSuccess] = useState<boolean>(false)
  const [poktTxError, setPoktTxError] = useState<boolean>(false)
  const [currentMint, setCurrentMint] = useState<Mint | undefined>(undefined)
  const [currentBurn, setCurrentBurn] = useState<Burn | undefined>(undefined)
  const [allPendingMints, setAllPendingMints] = useState<Mint[]>([])
  const [allPendingBurns, setAllPendingBurns] = useState<Burn[]>([])
  const [isUsingHardwareWallet, setIsUsingHardwareWallet] = useState<boolean>(false)
  const [pocketApp, setPocketApp] = useState<AppPokt>();
  const [isSigningTx, setIsSigningTx] = useState<boolean>(false)

  const [mintTxHash, setMintTxHash] = useState<`0x${string}` | undefined>(undefined)

  const { address } = useAccount()

  const toast = useToast()

  useEffect(() => {
    toggleMobile();
    window.addEventListener('resize', toggleMobile);
  });

  useEffect(() => { getPoktBalance() }, [poktAddress])

  useEffect(() => {
    if (address) {
      getActiveBridgeRequests(address)
    }
  }, [address])

  useInterval(() => {
    if (poktAddress) {
      getPoktBalance()
    }
  }, 120000)

  function resetProgress() {
    setPoktTxHash("")
    setEthTxHash("")
    setPoktTxOngoing(false)
    setPoktTxSuccess(false)
    setPoktTxError(false)
    setCurrentMint(undefined)
    setCurrentBurn(undefined)
    setMintTxHash(undefined)
    setPoktAmount(BigInt(0))
    setWPoktAmount(BigInt(0))
    setPoktAmountInput("")
    setWPoktAmountInput("")
  }

  async function getActiveBridgeRequests(address: string) {
    await getActiveBurns(address)
    await getActiveMints(address)
  }

  async function getActiveBurns(address: string) {
    try {
      const burns = await fetchActiveBurns(address)
      console.log("Active burns:", burns)
      if (burns && burns.length > 0) {
        const toastId = 'burn-in-progress'
        if (!toast.isActive(toastId)) toast({
          id: toastId,
          position: "top-right",
          duration: 10000,
          render: () => (
            <HStack spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="poktLime" borderBottomWidth={1}>
              <InfoIcon fill="poktLime" />
              <Text>You have {burns.length} unwrap request{burns.length > 1 ? 's' : ''} in progress</Text>
            </HStack>
          )
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function getActiveMints(address: string) {
    try {
      const mints = await fetchActiveMints(address)
      if (mints && mints.length > 0) {
        console.log("Active mints:", mints)
        const pending = mints.filter(mint => mint.status === "signed")
        setAllPendingMints(pending)
        const toastId = 'mint-in-progress'
        if (!toast.isActive(toastId)) toast({
          id: toastId,
          position: "top-right",
          duration: 10000,
          render: () => (
            <HStack spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="poktLime" borderBottomWidth={1}>
              <InfoIcon fill="poktLime" />
              <Text>You have {mints.length} wrap request{mints.length > 1 ? 's' : ''} in progress</Text>
            </HStack>
          )
        })
      }
    } catch (error) {
      console.error("Error fetching mints:", error)
    }
  }

  function toggleMobile() {
    if (window) {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth < 700) {
        setMobile(true);
      } else {
        setMobile(false);
      }
    }
  };

  function displayWalletNotFoundToast() {
    const toastId = "pokt-wallet-not-found";
    if (!toast.isActive(toastId)) {
      toast({
        id: toastId,
        position: "top-right",
        duration: 5000,
        render: () => (
          <HStack spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="error" borderBottomWidth={1}>
            <ErrorIcon />
            <Text color="error">
              Invalid POKT address! It should start with "pokt" and be 43 characters long. If you do not have one, please install{" "}
              <Link href="https://trustsoothe.io/" textDecor="underline" isExternal>Soothe Vault</Link>
              {"."}
            </Text>
          </HStack>
        ),
      });
    }
  }

  function displayWalletNoAccountSelectedToast() {
    const toastId = "pokt-wallet-no-account-selected";
    if (!toast.isActive(toastId)) {
      toast({
        id: toastId,
        position: "top-right",
        duration: 5000,
        render: () => (
          <HStack spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="error" borderBottomWidth={1}>
            <ErrorIcon />
            <Text color="error">
              No account selected! Please select an account in your wallet.
            </Text>
          </HStack>
        ),
      });
    }
  }

  function setPoktShannonAddress(address: string) {
    const poktAddress = address.trim().toLowerCase()
    try {
      if (!isPoktShannonAddress(poktAddress)) {
        throw new Error("Invalid POKT address")
      }
      setPoktAddress(poktAddress)
    } catch (error) {
      console.error(error)
      displayWalletNotFoundToast()
    }
  }

  async function connectSendWallet() {
    if (window.pocketShannon === undefined) {
      displayWalletNotFoundToast();
      return;
    }
    try {
      // Connect Wallet
      let address = await window.pocketShannon
        .send("pokt_requestAccounts")
        .then(([address]: any[]) => {
          console.log("Connected POKT address:", address);
          return address;
        })
        .catch((e: any) => {
          console.error("Failed to connect POKT address:", e);
          if (e.message.includes("No account selected")) {
            displayWalletNoAccountSelectedToast();
          }
          return null;
        });
      setPoktAddress(address)
    } catch (error) {
      console.error(error)
    }
  }

  async function getPoktBalance() {
    if (poktAddress) {
      try {
        let balance = BigInt(0)
        let balanceResponse;
        try {
          balanceResponse = await PoktGatewayApi.getBalance(poktAddress)
          console.log("Balance Response:", balanceResponse)
        } catch (error) {
          console.log(error);
          return 0;
        }
        balance = balanceResponse?.balances?.[0]?.amount?.toString();
        console.log("POKT Balance: ", balance)
        setPoktBalance(BigInt(balance ?? "0"))
      } catch (error) {
        console.error(error)
      }
    }
  }

  const { config } = usePrepareContractWrite({
    address: WPOKT_ADDRESS,
    abi: WRAPPED_POCKET_ABI,
    functionName: 'burnAndBridge',
    args: [wPoktAmount, poktAddress ? getAddress(bech32ToHex(poktAddress)) : ''],
  })
  const burnFunc = useContractWrite(config)

  const burnTx = useWaitForTransaction({
    hash: burnFunc.data?.hash,
    confirmations: 4
  })

  const mintTx = useWaitForTransaction({
    hash: mintTxHash,
    confirmations: 2
  })

  async function bridgePoktToEthereum(ethAddress: string, amount: number | bigint) {
    setPoktTxOngoing(false)
    setPoktTxSuccess(false)
    if (!poktAddress) return console.error("Please connect your POKT wallet first")
    if (!isValidEthAddress(ethAddress)) return console.error("Please enter a valid Ethereum address")
    // Send Transaction
    setIsSigningTx(true)
    try {
      let txHash;
      if (isUsingHardwareWallet) {
        const toastId = 'tx-signing-in-progress'
        if (!toast.isActive(toastId)) toast({
          id: toastId,
          position: "top-right",
          duration: 10000,
          render: () => (
            <HStack spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="poktLime" borderBottomWidth={1}>
              <InfoIcon fill="poktLime" />
              <Text>Please confirm the transaction on your Ledger device.</Text>
            </HStack>
          )
        })
        const res = await sendTransactionFromLedger(
          POKT_MULTISIG_ADDRESS,
          BigInt(amount),
          `{"address":"${ethAddress}","chain_id":"${ETH_CHAIN_ID}"}`
        )
        if (typeGuard(res, Error)) throw res
        txHash = res?.txhash
      } else {
        // const client = await StargateClient.connect(POKT_RPC_URL!)
        // const signature = await window.pocketShannon.send("pokt_signTransaction", [
        //   {
        //     address: poktAddress,
        //     memo: `{"address":"${ethAddress}","chain_id":"${ETH_CHAIN_ID}"}`,
        //     gas: 'auto',
        //     gasPrice: undefined,
        //     gasAdjustment: undefined,
        //     id: "",
        //     messages: {
        //       typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        //       body: {
        //         toAddress: POKT_MULTISIG_ADDRESS,
        //         amount: amount.toString()
        //       }
        //     },
        //     protocol: "Cosmos"
        //   }
        // ]).then(result => console.log(reult)).catch(error => console.error(error))
        // console.log({signature})
        const { hash } = await window.pocketShannon.send("pokt_sendTransaction", [
          {
            amount: amount.toString(), // in uPOKT
            from: poktAddress,
            to: POKT_MULTISIG_ADDRESS,
            memo: `{"address":"${ethAddress}","chain_id":"${ETH_CHAIN_ID}"}`,
          },
        ])
        txHash = hash;
      }
      console.log("Sent POKT:", {
        txHash
      });
      setPoktTxHash(txHash)
      setPoktTxOngoing(true)
    } catch (error) {
      console.error("Failed sending POKT:", error);
    }
    setIsSigningTx(false)
  }

  async function sendTransactionFromLedger(
    toAddress: string,
    amount: bigint,
    memo: string
  ): Promise<Error | any> {
    /* global BigInt */
    const entropy = Number(
      BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString()
    ).toString();

    const tx = {
      chain_id: POKT_CHAIN_ID,
      entropy,
      fee: [
        {
          amount: "10000",
          denom: "upokt",
        },
      ],
      memo,
      msg: {
        type: STDX_MSG_TYPES.send,
        value: {
          amount: amount.toString(),
          from_address: poktAddress.toLowerCase(),
          to_address: toAddress.toLowerCase(),
        },
      },
    };

    const stringifiedTx = JSON.stringify(tx);
    const hexTx = Buffer.from(stringifiedTx, "utf-8").toString("hex");
    const sig = await pocketApp?.signTransaction(
      LEDGER_CONFIG.derivationPath,
      hexTx
    );

    const pk = await pocketApp?.getPublicKey(LEDGER_CONFIG.derivationPath)
    if (!pk || !sig) throw Error("No public key or signature found")
    const ledgerTxResponse = await dataSource.sendTransactionFromLedger(
      pk.publicKey,
      sig.signature,
      tx
    );
    if (typeGuard(ledgerTxResponse, Error)) {
      return ledgerTxResponse;
    }

    return ledgerTxResponse;
  };

  return (
    <GlobalContext.Provider value={{
      mobile,
      setMobile,
      poktBalance,
      setPoktBalance,
      poktAddress,
      setPoktAddress,
      setPoktShannonAddress,
      connectSendWallet,
      ethAddress,
      setEthAddress,
      destination,
      setDestination,
      poktAmount,
      setPoktAmount,
      wPoktAmount,
      setWPoktAmount,
      poktAmountInput,
      setPoktAmountInput,
      wPoktAmountInput,
      setWPoktAmountInput,
      bridgePoktToEthereum,
      poktTxHash,
      setPoktTxHash,
      poktTxOngoing,
      setPoktTxOngoing,
      poktTxSuccess,
      setPoktTxSuccess,
      poktTxError,
      ethTxHash,
      setEthTxHash,
      currentMint,
      setCurrentMint,
      currentBurn,
      setCurrentBurn,
      allPendingMints,
      setAllPendingMints,
      allPendingBurns,
      setAllPendingBurns,
      burnFunc,
      burnTx,
      mintTx,
      mintTxHash,
      setMintTxHash,
      getPoktBalance,
      screenWidth,
      isUsingHardwareWallet,
      setIsUsingHardwareWallet,
      pocketApp,
      setPocketApp,
      isSigningTx,
      setIsSigningTx,
      resetProgress
    }}>
      {children}
    </GlobalContext.Provider>
  )
}
