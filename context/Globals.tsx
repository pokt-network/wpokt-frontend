import { ProviderProps, createContext, useContext, useEffect, useState } from "react";

export const GlobalContext = createContext<any>(undefined)
export const useGlobalContext = () => useContext(GlobalContext)

export function GlobalContextProvider({ children }: any) {
    const [mobile, setMobile] = useState<boolean>(false)
    const [poktBalance, setPoktBalance] = useState<number>(0)
    const [poktAddress, setPoktAddress] = useState<string>("")
    const [ethAddress, setEthAddress] = useState<string>("")
    const [destination, setDestionation] = useState<string>("eth") // 0 = wPOKT, 1 = POKT

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
            setDestionation
        }}>
            {children}
        </GlobalContext.Provider>
    )
}