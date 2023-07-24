import { ETH_CHAIN_ID, POKT_MULTISIG_ADDRESS } from "@/utils/constants";
import { isValidEthAddress } from "@/utils/misc";
import { ProviderProps, createContext, useContext, useEffect, useState } from "react";

export interface GlobalContextProps {
    mobile: boolean
    setMobile: (mobile: boolean) => void
    poktBalance: number
    setPoktBalance: (balance: number) => void
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
    customEthAddress: string
    setCustomEthAddress: (address: string) => void
    customPoktAddress: string
    setCustomPoktAddress: (address: string) => void
}

export const GlobalContext = createContext<GlobalContextProps>({
    mobile: false,
    setMobile: () => {},
    poktBalance: 0,
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
    customEthAddress: "",
    setCustomEthAddress: () => {},
    customPoktAddress: "",
    setCustomPoktAddress: () => {}
})

export const useGlobalContext = () => useContext(GlobalContext)

export function GlobalContextProvider({ children }: any) {
    const [mobile, setMobile] = useState<boolean>(false)
    const [poktBalance, setPoktBalance] = useState<number>(0)
    const [poktAddress, setPoktAddress] = useState<string>("")
    const [ethAddress, setEthAddress] = useState<string>("")
    const [destination, setDestination] = useState<string>("eth") // eth = pokt -> wpokt, pokt = wpokt -> pokt
    const [poktAmount, setPoktAmount] = useState<bigint>(BigInt(0))
    const [wPoktAmount, setWPoktAmount] = useState<bigint>(BigInt(0))
    const [customEthAddress, setCustomEthAddress] = useState<string>("")
    const [customPoktAddress, setCustomPoktAddress] = useState<string>("")
    const [poktTxHash, setPoktTxHash] = useState<string>("")
    const [ethTxHash, setEthTxHash] = useState<string>("")
    const [poktTxOngoing, setPoktTxOngoing] = useState<boolean>(false)
    const [poktTxSuccess, setPoktTxSuccess] = useState<boolean>(false)
    const [poktTxError, setPoktTxError] = useState<boolean>(false)

    useEffect(() => {
        toggleMobile();
        window.addEventListener('resize', toggleMobile);
    });

    useEffect(() => { getPoktBalance() }, [poktAddress])

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
    }

    async function getPoktBalance() {
        if (poktAddress) {
            // Get uPokt Balance
            let balance = await window.pocketNetwork
                .send("pokt_balance", [{ address: poktAddress }])
                .then(({ balance }) => {
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
            setPoktBalance(balance)
        }
    }

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
            customEthAddress,
            setCustomEthAddress,
            customPoktAddress,
            setCustomPoktAddress
        }}>
            {children}
        </GlobalContext.Provider>
    )
}