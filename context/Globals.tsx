import { InfoIcon } from "@/components/icons/misc";
import { Burn, Mint } from "@/types";
import { WRAPPED_POCKET_ABI } from "@/utils/abis";
import { ETH_CHAIN_ID, POKT_MULTISIG_ADDRESS, WPOKT_ADDRESS } from "@/utils/constants";
import { getDataSource } from "@/utils/datasource";
import { isValidEthAddress } from "@/utils/misc";
import { HStack, Text, useToast } from "@chakra-ui/react";
import { typeGuard } from "@pokt-network/pocket-js";
import { createContext, useContext, useEffect, useState } from "react";
import { getAddress } from "viem";
import { useAccount, useBalance, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import AppPokt from "../hw-app/Pokt";
import { LEDGER_CONFIG } from "@/utils/ledger";

declare global {
    interface Window {
        pocketNetwork: any;
    }
}

export async function fetchActiveMints(ethAddress: string): Promise<Mint[]> {
    const res =  await fetch(`/api/mints/active?recipient=${ethAddress}`)
    const mints = await res.json()
    return mints as Mint[]
}

export async function fetchActiveBurns(ethAddress: string): Promise<Burn[]> {
    const res =  await fetch(`/api/burns/active?sender=${ethAddress}`)
    const burns = await res.json()
    return burns as Burn[]
}

export interface GlobalContextProps {
    mobile: boolean
    setMobile: (mobile: boolean) => void
    poktBalance: bigint
    setPoktBalance: (balance: bigint) => void
    poktAddress: string
    setPoktAddress: (address: string) => void
    connectSendWallet: () => void
    ethAddress: string
    setEthAddress: (address: string) => void
    destination: string
    setDestination: (destination: string) => void,
    poktAmount: bigint
    setPoktAmount: (amount: bigint) => void
    wPoktAmount: bigint
    setWPoktAmount: (amount: bigint) => void
    bridgePoktToEthereum: (ethAddress: string, amount: number | bigint) => Promise<void>
    poktTxHash: string
    setPoktTxHash: (hash: string) => void
    poktTxOngoing: boolean
    poktTxSuccess: boolean
    poktTxError: boolean
    ethTxHash: string
    setEthTxHash: (hash: string) => void
    currentMint: Mint|undefined
    setCurrentMint: (mint: Mint|undefined) => void
    currentBurn: Burn|undefined
    setCurrentBurn: (burn: Burn|undefined) => void
    allPendingMints: Mint[]
    setAllPendingMints: (mints: Mint[]) => void
    allPendingBurns: Burn[]
    setAllPendingBurns: (burns: Burn[]) => void
    burnFunc: any
    burnTx: any
    mintTx: any
    mintTxHash: `0x${string}`|undefined
    setMintTxHash: (hash: `0x${string}`|undefined) => void
    getPoktBalance: () => void
    screenWidth?: number
    isUsingHardwareWallet: boolean
    setIsUsingHardwareWallet: (value: boolean) => void
    pocketApp?: AppPokt
    setPocketApp: (value: AppPokt|undefined) => void
    isSigningTx: boolean
}

export const GlobalContext = createContext<GlobalContextProps>({
    mobile: false,
    setMobile: () => {},
    poktBalance: BigInt(0),
    setPoktBalance: () => {},
    poktAddress: "",
    setPoktAddress: () => {},
    connectSendWallet: () => {},
    ethAddress: "",
    setEthAddress: () => {},
    destination: "eth",
    setDestination: () => {},
    poktAmount: BigInt(0),
    setPoktAmount: () => {},
    wPoktAmount: BigInt(0),
    setWPoktAmount: () => {},
    bridgePoktToEthereum: async () => {},
    poktTxHash: "",
    setPoktTxHash: () => {},
    poktTxOngoing: false,
    poktTxSuccess: false,
    poktTxError: false,
    ethTxHash: "",
    setEthTxHash: () => {},
    currentMint: undefined,
    setCurrentMint: () => {},
    currentBurn: undefined,
    setCurrentBurn: () => {},
    allPendingMints: [],
    setAllPendingMints: () => {},
    allPendingBurns: [],
    setAllPendingBurns: () => {},
    burnFunc: () => {},
    burnTx: () => {},
    mintTx: () => {},
    mintTxHash: undefined,
    setMintTxHash: () => {},
    getPoktBalance: () => {},
    screenWidth: undefined,
    isUsingHardwareWallet: false,
    setIsUsingHardwareWallet: () => {},
    pocketApp: undefined,
    setPocketApp: () => {},
    isSigningTx: false
})


export const dataSource = getDataSource();
export const useGlobalContext = () => useContext(GlobalContext)

export function GlobalContextProvider({ children }: any) {
    const [mobile, setMobile] = useState<boolean>(false)
    const [screenWidth, setScreenWidth] = useState<number|undefined>(undefined)
    const [poktBalance, setPoktBalance] = useState<bigint>(BigInt(0))
    const [poktAddress, setPoktAddress] = useState<string>("")
    const [ethAddress, setEthAddress] = useState<string>("")
    const [destination, setDestination] = useState<string>("eth") // eth = pokt -> wpokt, pokt = wpokt -> pokt
    const [poktAmount, setPoktAmount] = useState<bigint>(BigInt(0))
    const [wPoktAmount, setWPoktAmount] = useState<bigint>(BigInt(0))
    const [poktTxHash, setPoktTxHash] = useState<string>("")
    const [ethTxHash, setEthTxHash] = useState<string>("")
    const [poktTxOngoing, setPoktTxOngoing] = useState<boolean>(false)
    const [poktTxSuccess, setPoktTxSuccess] = useState<boolean>(false)
    const [poktTxError, setPoktTxError] = useState<boolean>(false)
    const [currentMint, setCurrentMint] = useState<Mint|undefined>(undefined)
    const [currentBurn, setCurrentBurn] = useState<Burn|undefined>(undefined)
    const [allPendingMints, setAllPendingMints] = useState<Mint[]>([])
    const [allPendingBurns, setAllPendingBurns] = useState<Burn[]>([])
    const [isUsingHardwareWallet, setIsUsingHardwareWallet] = useState<boolean>(false)
    const [pocketApp, setPocketApp] = useState<AppPokt>();
    const [isSigningTx, setIsSigningTx] = useState<boolean>(false)
    
    const [mintTxHash, setMintTxHash] = useState<`0x${string}`|undefined>(undefined)
    
    const {address} = useAccount()

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

    async function connectSendWallet() {
        if (window.pocketNetwork === undefined) {
            // uh oh no SendWallet found, request that the user install it first.
            return alert("SendWallet not found! Please visit https://sendwallet.net to install");
        }
        try {
            // Connect Wallet
            let address = await window.pocketNetwork
                .send("pokt_requestAccounts")
                .then(([address]: any[]) => {
                    console.log("Connected POKT address:", address);
                    return address;
                })
                .catch((e: any) => {
                    console.error("Failed to connect POKT address:", e);
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
                if (window.pocketNetwork === undefined) {
                    let balanceResponse;
                    try {
                        const poktGatewayUrl = `https://mainnet.gateway.pokt.network/v1/lb/${process.env.POKT_RPC_KEY}`
                        const res = await fetch(`${poktGatewayUrl}/v1/query/balance`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                address: poktAddress,
                                height: 0,
                            }),
                        })
                        balanceResponse = await res.json()
                    } catch (error) {
                        console.log(error);
                        return 0;
                    }
                    balance = balanceResponse?.balance?.toString();
                } else {
                    // Get uPokt Balance
                    balance = await window.pocketNetwork
                        .send("pokt_balance", [{ address: poktAddress }])
                        .then(({ balance }: any) => {
                            console.log("POKT Balance:", {
                                balanceInUpokt: balance,
                                balanceInPokt: balance / 1e6,
                            });
                            return balance;
                        })
                        .catch((e: any) => {
                            console.error("Error getting POKT balance:", e);
                            return null;
                        });
                }
                setPoktBalance(BigInt(balance))
            } catch (error) {
                console.error(error)
            }
        }
    }

    const { config } = usePrepareContractWrite({
        address: WPOKT_ADDRESS,
        abi: WRAPPED_POCKET_ABI,
        functionName: 'burnAndBridge',
        args: [wPoktAmount, poktAddress ? getAddress(`0x${poktAddress}`) : ''],
    })
    const burnFunc = useContractWrite(config)

    const burnTx = useWaitForTransaction({
        hash: burnFunc.data?.hash,
        confirmations: 8
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
        try {
            let txHash;
            setIsSigningTx(true)
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
                const response = await res.json()
                console.log("Ledger response:", response)
                txHash = response?.txHash
            } else {
                const { hash } = await window.pocketNetwork.send("pokt_sendTransaction", [
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

    const sendTransactionFromLedger = async (
        toAddress: string,
        amount: bigint,
        memo: any
    ) => {
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
    
        const stringifiedTx = JSON.stringify(tx);
        const hexTx = Buffer.from(stringifiedTx, "utf-8").toString("hex");
        const sig = await pocketApp?.signTransaction(
            LEDGER_CONFIG.derivationPath,
            hexTx
        );
    
        const pk = await pocketApp?.getPublicKey(LEDGER_CONFIG.derivationPath)
        if (!pk || !sig) throw Error("No public key or signature found")
        const ledgerTxResponse = await dataSource.sendTransactionFromLedger(
            Buffer.from(pk?.publicKey).toString("hex"),
            Buffer.from(sig?.signature).toString("hex"),
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
            connectSendWallet,
            ethAddress,
            setEthAddress,
            destination,
            setDestination,
            poktAmount,
            setPoktAmount,
            wPoktAmount,
            setWPoktAmount,
            bridgePoktToEthereum,
            poktTxHash,
            setPoktTxHash,
            poktTxOngoing,
            poktTxSuccess,
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
            isSigningTx
        }}>
            {children}
        </GlobalContext.Provider>
    )
}