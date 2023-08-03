import { Box, Button, Center, Container, Flex, HStack, Input, Link, Text, VStack, useDisclosure } from "@chakra-ui/react";
import { EthIcon } from "./icons/eth";
import { PoktIcon } from "./icons/pokt";
import { useEffect, useState } from "react";
import { ProgressModal } from "./modal/ProgressModal";
import { CloseIcon, InfoIcon } from "./icons/misc";
import { useGlobalContext } from "@/context/Globals";
import { TimeInfoModal } from "./modal/TimeInfoModal";
import { useAccount, useBalance, useContractWrite, useFeeData, usePrepareContractWrite } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatPokt, parsePokt } from "@/utils/pokt";
import { MINT_CONTROLLER_ADDRESS, WPOKT_ADDRESS } from "@/utils/constants";
import { MINT_CONTROLLER_ABI, WRAPPED_POCKET_ABI } from "@/utils/abis";
import { createPublicClient, formatEther, getAddress, http, parseUnits } from "viem";
import { goerli } from "wagmi/chains";
import { ResumeWrapModal } from "./modal/ResumeWrapModal";


export function Bridge() {
    const [poktAmountInput, setPoktAmountInput] = useState<string>("")
    const [wPoktAmountInput, setWPoktAmountInput] = useState<string>("")
    const [estGasCost, setEstGasCost] = useState<string>("")
    const {
        poktAddress,
        destination,
        setDestination,
        connectSendWallet,
        poktBalance,
        bridgePoktToEthereum,
        poktTxOngoing,
        setEthTxHash,
        poktAmount,
        wPoktAmount,
        setPoktAmount,
        setWPoktAmount,
        burnFunc,
        allPendingMints
    } = useGlobalContext()

    const { address } = useAccount()
    const { openConnectModal } = useConnectModal()
    const { data: balanceData } = useBalance({
        address,
        token: WPOKT_ADDRESS,
    })
    const { data: feeData } = useFeeData({ chainId: goerli.id })

    const { isOpen: isProgressOpen, onOpen: onProgressOpen, onClose: onProgressClose } = useDisclosure()
    const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure()
    const { isOpen: isResumeMintOpen, onOpen: onResumeMintOpen, onClose: onResumeMintClose } = useDisclosure()


    useEffect(() => {
        if (poktTxOngoing) {
            onProgressOpen()
        }
    }, [poktTxOngoing])

    useEffect(() => {
        if (address && poktAddress && destination) {
            getGasCost(destination)
        }
    },[address, poktAddress, destination])

    useEffect(() => {
        if (allPendingMints.length > 0) onResumeMintOpen()
    }, [allPendingMints])


    // const { config } = usePrepareContractWrite({
    //     address: WPOKT_ADDRESS,
    //     abi: WRAPPED_POCKET_ABI,
    //     functionName: 'burnAndBridge',
    //     args: [wPoktAmount, poktAddress ? getAddress(`0x${poktAddress}`) : ''],
    // })
    // const burnFunc = useContractWrite(config)
    
    async function burn() {
        console.log("Burn Func:", burnFunc)
        if (burnFunc.writeAsync) {
            try {
                const tx = await burnFunc.writeAsync()
                console.log("Burn Data:", burnFunc.data)
                console.log("Burn Tx:", tx)
                setEthTxHash(tx.hash)
                onProgressOpen()
            } catch (error) {
                console.error(error)
            }
        }
    }

    async function getGasCost(dest: string): Promise<void> {
        let gas: bigint
        const pubClient = createPublicClient({
            chain: goerli,
            transport: http()
        })
        if (dest === "pokt") {
            gas = await pubClient.estimateContractGas({
                address: WPOKT_ADDRESS,
                abi: WRAPPED_POCKET_ABI,
                functionName: 'burnAndBridge',
                args: [wPoktAmount, getAddress(`0x${poktAddress}`)],
                account: getAddress(address ?? '')
            })
        } else {
            gas = await pubClient.estimateContractGas({
                address: MINT_CONTROLLER_ADDRESS,
                abi: MINT_CONTROLLER_ABI,
                functionName: 'mintWrappedPocket',
                args: [poktAmount, getAddress(address ?? '')],
                account: getAddress(address ?? '')
            })
        }
        setEstGasCost(formatEther(gas * (feeData?.maxFeePerGas ?? BigInt(0))))
    }

    return (
        <VStack minWidth="580px">
            <Button bg="poktLime" color="darkBlue" onClick={() => setDestination(destination === "pokt" ? "eth" : "pokt")}>
                {destination === "eth" ? "POKT" : "wPOKT"} &rarr; {destination === "eth" ? "wPOKT" : "POKT"}
            </Button>
            <ResumeWrapModal
                isOpen={isResumeMintOpen}
                onClose={onResumeMintClose}
                mintInfo={allPendingMints.length > 0 ? allPendingMints[0] : undefined}
                openProgressModal={onProgressOpen}
            ><></>
            </ResumeWrapModal>
            {destination === "eth" ? (
                <Container bg="darkOverlay" paddingY={4}>
                    <Center>
                        <Box width={320}>
                            <HStack justify="space-between" mb={1}>
                                <Text>Amount to wrap</Text>
                                <Text>{poktAddress ? `${formatPokt(poktBalance)} POKT in wallet` : 'No wallet connected'}</Text>
                            </HStack>
                            {poktAddress ? (
                                <Box>
                                    <PoktIcon fill="white" position="fixed" ml={280} mt="6px" width="26px" height="26px" />
                                    <Input
                                        type="number"
                                        borderRadius={0}
                                        placeholder="Enter POKT amount"
                                        value={poktAmountInput}
                                        onChange={(e) => {
                                            const { value } = e.currentTarget
                                            setPoktAmountInput(value)
                                            setPoktAmount(parsePokt(value ?? 0))
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Center>
                                    <Button
                                        variant="outline"
                                        borderColor="poktLime"
                                        bg="transparent"
                                        color="white"
                                        leftIcon={<PoktIcon fill={"white"}/>}
                                        onClick={connectSendWallet}
                                    >
                                        Connect SendWallet
                                    </Button>
                                </Center>
                            )}
                        </Box>
                    </Center>
                    <Box>
                        <Center mt={6}>
                            <Box width={320}>
                                <Text mb={1} textAlign="left">Destination Wallet</Text>
                            </Box>
                        </Center>
                        {address ? (
                            <Flex align="center" justify="space-between" bg="darkBlue" paddingX={4} paddingY={2}>
                                <EthIcon fill="poktBlue" width="26px" height="26px" />
                                <Text>{address}</Text>
                                <CloseIcon width="22.63px" height="22.63px" fill="poktLime" />
                            </Flex>
                        ) : (
                            <Center>
                                <Button
                                    variant="outline"
                                    borderColor="poktLime"
                                    bg="transparent"
                                    color="white"
                                    leftIcon={<EthIcon fill={"white"}/>}
                                    onClick={openConnectModal}
                                >
                                    Connect Wallet
                                </Button>
                            </Center>
                        )}
                    </Box>
                    <Center my={6}>
                        <VStack width={320} spacing={4} align="flex-start">
                            <Box>
                                <Text>Estimated Gas Cost:</Text>
                                <Text>{0.01} POKT + {estGasCost ? (estGasCost.startsWith('0.0000') ? '<0.0001' : estGasCost) : '----'} ETH</Text>
                            </Box>
                            <Box>
                                <Text>Estimated wPOKT Received:</Text>
                                <Text>{poktAmountInput.length ? poktAmountInput : '----'} wPOKT</Text>
                            </Box>
                            <Box>
                                <Text>Estimated time for bridge:</Text>
                                <Flex align="center" gap={2}>
                                    <Text>~30 Minutes</Text>
                                    <InfoIcon _hover={{ cursor: "pointer" }} onClick={onInfoOpen} />
                                </Flex>
                            </Box>
                        </VStack>
                    </Center>
                    <Center>
                        <Button
                            bg="poktLime"
                            color="darkBlue"
                            onClick={async () => {
                                const recipient = address ?? ""
                                await bridgePoktToEthereum(recipient, poktAmount)
                                // onProgressOpen()
                            }}
                            isDisabled={!poktAddress||!address||!poktAmount}
                        >
                            Wrap
                        </Button>
                    </Center>
                    <ProgressModal isOpen={isProgressOpen} onClose={onProgressClose}><></></ProgressModal>
                </Container>
            ) : (
                <Container bg="darkOverlay" paddingY={4}>
                    <Center>
                        <Box width={320}>
                            <HStack justify="space-between" mb={1}>
                                <Text>Amount to unwrap</Text>
                                <Text>{address ? `${balanceData?.formatted ?? 0} wPOKT in wallet` : 'No wallet connected'}</Text>
                            </HStack>
                            {address ? (
                                <Box>
                                    <EthIcon fill="white" position="fixed" ml={280} mt="6px" width="26px" height="26px" />
                                    <Input
                                        type="number"
                                        borderRadius={0}
                                        placeholder="Enter wPOKT amount"
                                        value={wPoktAmountInput}
                                        onChange={(e) => {
                                            const { value } = e.currentTarget
                                            setWPoktAmountInput(value ?? '')
                                            setWPoktAmount(value ? parseUnits(value, 6) : BigInt(0))
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Center>
                                    <Button
                                        variant="outline"
                                        borderColor="poktLime"
                                        bg="transparent"
                                        color="white"
                                        leftIcon={<EthIcon fill={"white"}/>}
                                        onClick={openConnectModal}
                                    >
                                        Connect Wallet
                                    </Button>
                                </Center>
                            )}
                        </Box>
                    </Center>
                    <Center mt={6}>
                        <Box width={320}>
                            <Text mb={1}>Destination Wallet</Text>
                        </Box>
                    </Center>
                    {poktAddress ? (
                        <Flex align="center" justify="space-between" bg="darkBlue" paddingX={4} paddingY={2}>
                            <PoktIcon fill="poktBlue" width="26px" height="26px" />
                            <Text>{poktAddress}</Text>
                            <CloseIcon width="22.63px" height="22.63px" fill="poktLime" />
                        </Flex>
                    ) : (
                        <Center>
                            <Button
                                variant="outline"
                                borderColor="poktLime"
                                bg="transparent"
                                color="white"
                                leftIcon={<PoktIcon fill={"white"}/>}
                                onClick={connectSendWallet}
                            >
                                Connect SendWallet
                            </Button>
                        </Center>
                    )}
                    <Center my={6}>
                        <VStack width={320} spacing={4} align="flex-start">
                            <Box>
                                <Text>Estimated Gas Cost:</Text>
                                <Text>{estGasCost ? (estGasCost.startsWith('0.0000') ? '<0.0001' : estGasCost) : '----'} ETH</Text>
                            </Box>
                            <Box>
                                <Text>Estimated POKT Received:</Text>
                                <Text>{wPoktAmountInput.length ? wPoktAmountInput : '----'} POKT</Text>
                            </Box>
                            <Box>
                                <Text>Estimated time for bridge:</Text>
                                <Flex align="center" gap={2}>
                                    <Text>~30 Minutes</Text>
                                    <InfoIcon _hover={{ cursor: "pointer" }} onClick={onInfoOpen} />
                                </Flex>
                            </Box>
                        </VStack>
                    </Center>
                    <Center>
                        <Button
                            bg="poktLime"
                            color="darkBlue"
                            onClick={burn}
                            isDisabled={!poktAddress||!address||!wPoktAmount}
                        >
                            Unwrap
                        </Button>
                    </Center>
                    <ProgressModal isOpen={isProgressOpen} onClose={onProgressClose}><></></ProgressModal>
                </Container>
            )}
            <TimeInfoModal isOpen={isInfoOpen} onClose={onInfoClose}><></></TimeInfoModal>
        </VStack>
    )
}