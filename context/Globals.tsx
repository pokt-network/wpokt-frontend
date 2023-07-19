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
    setDestination: (destination: string) => void
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
    const [destination, setDestination] = useState<string>("eth") // 0 = wPOKT, 1 = POKT
    const [customEthAddress, setCustomEthAddress] = useState<string>("")
    const [customPoktAddress, setCustomPoktAddress] = useState<string>("")

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

    async function sendPokt(to: string, amount: number | bigint) {
        if (!poktAddress) return alert("Please connect your POKT wallet first")
        // Send Transaction
        let hash = await window.pocketNetwork
            .send("pokt_sendTransaction", [
                {
                    amount: amount.toString(), // in uPOKT
                    from: poktAddress,
                    to: to,
                    memo: "Sent with SendWallet.net",
                },
            ])
            .then(({ hash }: any) => {
                console.log("Successful POKT tx:", {
                    txHash: hash,
                });
                return hash;
            })
            .catch((e: any) => {
                console.error("Failed POKT tx:", e);
                return null;
            });
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
            customEthAddress,
            setCustomEthAddress,
            customPoktAddress,
            setCustomPoktAddress
        }}>
            {children}
        </GlobalContext.Provider>
    )
}