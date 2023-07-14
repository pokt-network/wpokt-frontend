import { ProviderProps, createContext, useContext, useEffect, useState } from "react";

export interface GlobalContextProps {
    mobile: boolean
    setMobile: (mobile: boolean) => void
    poktBalance: number
    setPoktBalance: (balance: number) => void
    poktAddress: string
    setPoktAddress: (address: string) => void
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

    function toggleMobile() {
        if (window && window.innerWidth < 700) {
            setMobile(true);
        } else {
            setMobile(false);
        }
    };

    return (
        <GlobalContext.Provider value={{
            mobile,
            setMobile,
            poktBalance,
            setPoktBalance,
            poktAddress,
            setPoktAddress,
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