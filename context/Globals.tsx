import { InfoIcon } from "@/components/icons/misc";
import { Burn, Mint } from "@/types";
import { WRAPPED_POCKET_ABI } from "@/utils/abis";
import { WPOKT_ADDRESS } from "@/utils/constants";
import { isValidEthAddress } from "@/utils/misc";
import { HStack, Text, useToast } from "@chakra-ui/react";
import { createContext, useContext, useEffect, useState } from "react";
import { getAddress } from "viem";
import { useAccount, useBalance, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";

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
    getPoktBalance: () => {}
})

export const useGlobalContext = () => useContext(GlobalContext)

export function GlobalContextProvider({ children }: any) {
    const [mobile, setMobile] = useState<boolean>(false)
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
                        <HStack mt={'140px'} spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="poktLime" borderBottomWidth={1}>
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
                const pending = mints.filter(mint => mint.status === "signed")
                setAllPendingMints(pending)
                const toastId = 'mint-in-progress'
                if (!toast.isActive(toastId)) toast({
                    id: toastId,
                    position: "top-right",
                    duration: 10000,
                    render: () => (
                        <HStack mt={'140px'} spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="poktLime" borderBottomWidth={1}>
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
        if (window && window.innerWidth < 700) {
            setMobile(true);
        } else {
            setMobile(false);
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
                // Get uPokt Balance
                let balance = await window.pocketNetwork
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
        hash: burnFunc.data?.hash
    })

    const mintTx = useWaitForTransaction({
        hash: mintTxHash
    })

    async function bridgePoktToEthereum(ethAddress: string, amount: number | bigint) {
        setPoktTxOngoing(false)
        setPoktTxSuccess(false)
        if (!poktAddress) return console.error("Please connect your POKT wallet first")
        if (!isValidEthAddress(ethAddress)) return console.error("Please enter a valid Ethereum address")
        // Send Transaction
        try {
            setPoktTxOngoing(true)
            setPoktTxSuccess(true)
            // const { hash } = await window.pocketNetwork.send("pokt_sendTransaction", [
            //     {
            //         amount: amount.toString(), // in uPOKT
            //         from: poktAddress,
            //         to: POKT_MULTISIG_ADDRESS,
            //         memo: `{"address":"${ethAddress}","chain_id":"${ETH_CHAIN_ID}"}`,
            //     },
            // ])
            // console.log("Sent POKT:", {
            //     txHash: hash,
            // });
            // setPoktTxHash(hash)
            // setPoktTxOngoing(true)
        } catch (error) {
            console.error("Failed sending POKT:", error);
        }
    }

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
            getPoktBalance
        }}>
            {children}
        </GlobalContext.Provider>
    )
}