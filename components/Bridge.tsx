import { Box, Button, ButtonGroup, Center, Container, Divider, Flex, HStack, Input, Link, Text, VStack, useDisclosure, useToast } from "@chakra-ui/react";
import { EthIcon } from "./icons/eth";
import { PoktIcon } from "./icons/pokt";
import { useEffect, useMemo, useState } from "react";
import { ProgressModal } from "./modal/ProgressModal";
import { CloseIcon, ErrorIcon, InfoIcon } from "./icons/misc";
import { useGlobalContext } from "@/context/Globals";
import { TimeInfoModal } from "./modal/TimeInfoModal";
import { useAccount, useBalance, useContractRead, useContractWrite, useFeeData, usePrepareContractWrite } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatPokt, parsePokt } from "@/utils/pokt";
import { CHAINLINK_ETH_USD_ADDRESS, MINT_CONTROLLER_ADDRESS, WPOKT_ADDRESS } from "@/utils/constants";
import { CHAINLINK_AGGREGATOR_V3_INTERFACE_ABI, MINT_CONTROLLER_ABI, WRAPPED_POCKET_ABI } from "@/utils/abis";
import { createPublicClient, formatEther, formatUnits, getAddress, http, parseUnits } from "viem";
import { goerli } from "wagmi/chains";
import { ResumeWrapModal } from "./modal/ResumeWrapModal";
import { GasInfoModal } from "./modal/GasInfoModal";


export function Bridge() {
    const [poktAmountInput, setPoktAmountInput] = useState<string>("")
    const [wPoktAmountInput, setWPoktAmountInput] = useState<string>("")
    const [estGasCost, setEstGasCost] = useState<string>("")
    const [ethPrice, setEthPrice] = useState<bigint|undefined>(undefined)
    const [insufficientPoktGas, setInsufficientPoktGas] = useState<boolean>(false)
    const [insufficientEthGas, setInsufficientEthGas] = useState<boolean>(false)
    const {
        screenWidth,
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
        burnTx,
        allPendingMints,
        currentBurn,
        currentMint,
        getPoktBalance
    } = useGlobalContext()

    const { address } = useAccount()
    const { openConnectModal } = useConnectModal()
    const { data: wPoktBalanceData, refetch: refetchWPoktBalance } = useBalance({
        address,
        token: WPOKT_ADDRESS,
    })
    const { data: ethBalanceData, isSuccess } = useBalance({
        address,
    })
    const { data: feeData } = useFeeData({ chainId: goerli.id })
    const { data: priceData, isSuccess: isPriceSuccess } = useContractRead({
        address: CHAINLINK_ETH_USD_ADDRESS,
        abi: CHAINLINK_AGGREGATOR_V3_INTERFACE_ABI,
        functionName: 'latestRoundData',
    })

    const { isOpen: isProgressOpen, onOpen: onProgressOpen, onClose: onProgressClose } = useDisclosure()
    const { isOpen: isTimeInfoOpen, onOpen: onTimeInfoOpen, onClose: onTimeInfoClose } = useDisclosure()
    const { isOpen: isGasInfoOpen, onOpen: onGasInfoOpen, onClose: onGasInfoClose } = useDisclosure()
    const { isOpen: isResumeMintOpen, onOpen: onResumeMintOpen, onClose: onResumeMintClose } = useDisclosure()

    const toast = useToast()

    const currentStep = useMemo(() => {
        if (destination === "eth") {
            if (!poktAddress) return 1
            if (!address) return 2
            if (poktAmount) return 3
        } else {
            if (!address) return 1
            if (!poktAddress) return 2
            if (wPoktAmount) return 3
        }
    }, [address, poktAddress, destination, poktAmount, wPoktAmount])

    useEffect(() => {
        console.log("Price Data:", priceData)
        if (priceData) {
            const data = priceData as bigint[]
            setEthPrice(data[1])
        }
    }, [isPriceSuccess])

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

    useEffect(() => {
        if (poktAmount || wPoktAmount) getGasCost(destination)
    }, [poktAmount, wPoktAmount, destination])

    useEffect(() => {
        if (isSuccess && ethBalanceData && estGasCost) {
            if (ethBalanceData?.value < parseUnits(estGasCost, 18)) {
                setInsufficientEthGas(true)
            } else {
                setInsufficientEthGas(false)
            }
        }
        if (BigInt(poktBalance) < poktAmount + parsePokt('0.01')) {
            setInsufficientPoktGas(true)
        } else {
            setInsufficientPoktGas(false)
        }
    }, [ethBalanceData?.value, poktBalance, estGasCost, poktAmount, wPoktAmount])

    useEffect(() => {
        if (burnTx?.isSuccess || currentMint?.status === "success" || currentBurn?.status === "confirmed" || !isProgressOpen) refetchWPoktBalance()
        if (currentBurn?.status === "success" || currentMint?.status === "confirmed" || !isProgressOpen) getPoktBalance()
    }, [burnTx?.isSuccess, currentMint?.status, currentBurn?.status, isProgressOpen])


    async function burn() {
        if (wPoktBalanceData && wPoktAmount > wPoktBalanceData?.value) {
            return displayInsufficientTokenBalanceToast()
        }
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
        try {
            const pubClient = createPublicClient({
                chain: goerli,
                transport: http()
            })
            if (dest === "pokt") {
                gas = await pubClient.estimateContractGas({
                    address: getAddress(WPOKT_ADDRESS),
                    abi: WRAPPED_POCKET_ABI,
                    functionName: 'burnAndBridge',
                    args: [wPoktAmount, getAddress(`0x${poktAddress}`)],
                    account: getAddress(address ?? '')
                })
            } else {
                console.log("estimating gas...")
                gas = await pubClient.estimateContractGas({
                    address: getAddress(MINT_CONTROLLER_ADDRESS),
                    abi: MINT_CONTROLLER_ABI,
                    functionName: 'mintWrappedPocket',
                    args: [poktAmount, getAddress(address ?? '')],
                    account: getAddress(address ?? '')
                })
            }
        } catch (error) {
            console.error(error)
            gas = BigInt(0)
            if (dest === "eth" && poktAmount > BigInt(0)) gas = BigInt(289000) // Default estimate for minting
        }
        setEstGasCost(gas > BigInt(0) ? formatEther(gas * (feeData?.maxFeePerGas ?? BigInt(0))) : "")
    }

    function displayInsufficientGasToast() {
        const toastId = 'insufficient-gas'
        if (!toast.isActive(toastId)) toast({
            id: toastId,
            position: "top-right",
            duration: 5000,
            render: () => (
                <HStack mt={'140px'} spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="error" borderBottomWidth={1}>
                    <ErrorIcon />
                    <Text color="error">You may not have enough gas in your wallet.</Text>
                </HStack>
            )
        })
    }

    function displayInsufficientTokenBalanceToast() {
        const toastId = 'insufficient-balance'
        if (!toast.isActive(toastId)) toast({
            id: toastId,
            position: "top-right",
            duration: 5000,
            render: () => (
                <HStack mt={'140px'} spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="error" borderBottomWidth={1}>
                    <ErrorIcon />
                    <Text color="error">Insufficient token balance.</Text>
                </HStack>
            )
        })
    }

    return (
        <VStack minWidth={screenWidth && screenWidth < 580 ? screenWidth : '580px'}>
            {/* <Button
                bg="poktLime"
                color="darkBlue"
                _hover={{ bg: "hover.poktLime" }}
                onClick={() => setDestination(destination === "pokt" ? "eth" : "pokt")}
            >
                {destination === "eth" ? "POKT" : "wPOKT"} &rarr; {destination === "eth" ? "wPOKT" : "POKT"}
            </Button> */}
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
                            <ButtonGroup spacing={0} mb={6}>
                                <Button
                                    bg="poktLime"
                                    color="darkBlue"
                                    mr={0}
                                    borderRightRadius={0}
                                    width='160px'
                                    height={8}
                                    _hover={{ bg: "poktLime" }}
                                    onClick={() => setDestination("eth")}
                                >
                                    Wrap POKT
                                </Button>
                                <Button
                                    variant="outline"
                                    borderColor="poktLime"
                                    bg="transparent"
                                    color="white"
                                    ml={0}
                                    width='160px'
                                    height={8}
                                    borderLeftRadius={0}
                                    _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                    onClick={() => setDestination("pokt")}
                                >
                                    Unwrap wPOKT
                                </Button>
                            </ButtonGroup>
                            <HStack justify="space-between" mb={1}>
                                <Text>Amount to wrap</Text>
                                <Text>{poktAddress ? `${formatPokt(poktBalance)} POKT in wallet` : 'No wallet connected'}</Text>
                            </HStack>
                            {poktAddress ? (
                                <Box>
                                    <PoktIcon fill="white" position="absolute" ml={270} mt="12px" width="21px" height="21px" />
                                    <Input
                                        type="number"
                                        borderRadius={0}
                                        fontWeight={700}
                                        fontSize={16}
                                        paddingY={6}
                                        paddingX={8}
                                        borderColor={poktAmount + parsePokt(0.01) > poktBalance && poktAmount !== BigInt(0) ? "error" : poktAmount === BigInt(0) ? 'poktLime' : 'none'}
                                        _focus={{ borderColor: poktAmount + parsePokt(0.01) > poktBalance && poktAmount !== BigInt(0) ? "error" : poktAmount === BigInt(0) ? 'poktLime' : 'none' }}
                                        _hover={{ borderColor: poktAmount === BigInt(0) ? 'poktLime' : 'none' }}
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
                                    {currentStep === 1 ? (
                                        <Button
                                            color="darkBlue"
                                            background="poktLime"
                                            borderWidth={2}
                                            borderColor="poktLime"
                                            height={8}
                                            minW={200}
                                            _hover={{ bg: "hover.poktLime" }}
                                            leftIcon={<PoktIcon />}
                                            onClick={connectSendWallet}
                                        >
                                            Connect POKT Wallet
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            borderColor="poktLime"
                                            bg="transparent"
                                            color="white"
                                            height={8}
                                            _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                            leftIcon={<PoktIcon fill={"white"}/>}
                                            onClick={connectSendWallet}
                                            minW={200}
                                        >
                                            Connect POKT Wallet
                                        </Button>
                                    )}
                                </Center>
                            )}
                        </Box>
                    </Center>
                    <Box>
                        <Center mt={6}>
                            <HStack width={320} justify="space-between" mb={1}>
                                <Text textAlign="left">Destination Wallet</Text>
                                <Text>{address ? `${wPoktBalanceData?.formatted ?? 0} wPOKT in wallet` : 'No wallet connected'}</Text>
                            </HStack>
                        </Center>
                        {address ? (
                            <Flex align="center" justify="space-between" bg="darkBlue" paddingX={4} paddingY={2}>
                                <EthIcon fill="poktBlue" width="21px" height="21px" />
                                <Text>{address}</Text>
                                <CloseIcon width="22.63px" height="22.63px" fill="none" />
                            </Flex>
                        ) : (
                            <Center>
                                {currentStep === 2 ? (
                                    <Button
                                        color="darkBlue"
                                        background="poktLime"
                                        borderWidth={2}
                                        borderColor="poktLime"
                                        height={8}
                                        minW={200}
                                        _hover={{ bg: "hover.poktLime" }}
                                        leftIcon={<EthIcon />}
                                        onClick={openConnectModal}
                                    >
                                        Connect ETH Wallet
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        borderColor="poktLime"
                                        bg="transparent"
                                        color="white"
                                        height={8}
                                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                        leftIcon={<EthIcon fill={"white"}/>}
                                        onClick={openConnectModal}
                                        minW={200}
                                    >
                                        Connect ETH Wallet
                                    </Button>
                                )}
                            </Center>
                        )}
                    </Box>
                    <Center mt={6}>
                        <Box width={320}>
                            <Text>Estimated wPOKT received</Text>
                            <HStack justify="space-between" paddingX={10} paddingY={4} bg="darkBlue" height="52px">
                                <Text
                                    fontWeight={700}
                                    fontSize={18}
                                >
                                    {poktAmountInput.length ? poktAmountInput : ' '}
                                </Text>
                                <EthIcon fill="white" width="21px" height="21px" />
                            </HStack>
                        </Box>
                    </Center>
                    <Center>
                        <Divider mt={6} borderColor={"poktLime"} maxW={360} />
                    </Center>
                    <Center my={6}>
                        <VStack width={320} spacing={4} align="flex-start">
                            <Box>
                                <Text>Estimated Gas Cost:</Text>
                                <Flex align="center" gap={2}>
                                    <Text>{0.01} POKT + {estGasCost ? (estGasCost.startsWith('0.0000') ? '<0.0001' : estGasCost.substring(0,7)) : '----'} ETH</Text>
                                    {(!!ethPrice && !!estGasCost) && <Text>(~${(parseFloat(estGasCost) * parseFloat(formatUnits(ethPrice, 8))).toFixed(2)})</Text>}
                                    <InfoIcon _hover={{ cursor: "pointer" }} onClick={onGasInfoOpen} />
                                    {((insufficientEthGas||insufficientPoktGas) && address && poktAddress) && <ErrorIcon _hover={{ cursor: 'pointer' }} onClick={displayInsufficientGasToast} />}
                                </Flex>
                            </Box>
                            <Box>
                                <Text>Estimated time for bridge:</Text>
                                <Flex align="center" gap={2}>
                                    <Text>~30 Minutes</Text>
                                    <InfoIcon _hover={{ cursor: "pointer" }} onClick={onTimeInfoOpen} />
                                </Flex>
                            </Box>
                        </VStack>
                    </Center>
                    <Center>
                        {currentStep === 3 ? (
                            <Button
                                bg="poktLime"
                                borderColor="poktLime"
                                borderWidth={2}
                                color="darkBlue"
                                width="100px"
                                paddingY={6}
                                _hover={{ bg: "hover.poktLime" }}
                                onClick={async () => {
                                    if (poktAmount + parsePokt(0.01) > poktBalance) return displayInsufficientTokenBalanceToast()
                                    const recipient = address ?? ""
                                    await bridgePoktToEthereum(recipient, poktAmount)
                                    // onProgressOpen()
                                }}
                                isDisabled={!poktAddress||!address||!poktAmount}
                            >
                                Wrap
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                borderColor="poktLime"
                                borderWidth={2}
                                bg="transparent"
                                color="white"
                                width="100px"
                                paddingY={6}
                                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                isDisabled={!poktAddress||!address||!poktAmount}
                            >
                                Wrap
                            </Button>
                        )}
                    </Center>
                    <ProgressModal isOpen={isProgressOpen} onClose={onProgressClose}><></></ProgressModal>
                </Container>
            ) : (
                <Container bg="darkOverlay" paddingY={4}>
                    <Center>
                        <Box width={320}>
                        <ButtonGroup spacing={0} mb={6}>
                                <Button
                                    variant="outline"
                                    borderColor="poktLime"
                                    bg="transparent"
                                    color="white"
                                    mr={0}
                                    borderRightRadius={0}
                                    width='160px'
                                    height={8}
                                    _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                    onClick={() => setDestination("eth")}
                                >
                                    Wrap POKT
                                </Button>
                                <Button
                                    bg="poktLime"
                                    color="darkBlue"
                                    ml={0}
                                    width='160px'
                                    height={8}
                                    borderLeftRadius={0}
                                    _hover={{ bg: "poktLime" }}
                                    onClick={() => setDestination("pokt")}
                                >
                                    Unwrap wPOKT
                                </Button>
                            </ButtonGroup>
                            <HStack justify="space-between" mb={1}>
                                <Text>Amount to unwrap</Text>
                                <Text>{address ? `${wPoktBalanceData?.formatted ?? 0} wPOKT in wallet` : 'No wallet connected'}</Text>
                            </HStack>
                            {address ? (
                                <Box>
                                    <EthIcon fill="white" position="absolute" ml={270} mt="12px" width="21px" height="21px" />
                                    <Input
                                        type="number"
                                        borderRadius={0}
                                        fontWeight={700}
                                        fontSize={16}
                                        paddingY={6}
                                        paddingX={8}
                                        borderColor={wPoktBalanceData && wPoktAmount > wPoktBalanceData?.value && wPoktAmount !== BigInt(0) ? "error" : wPoktAmount === BigInt(0) ? 'poktLime' : 'none'}
                                        _focus={{ borderColor: wPoktBalanceData && wPoktAmount > wPoktBalanceData?.value && wPoktAmount !== BigInt(0) ? "error" : wPoktAmount === BigInt(0) ? 'poktLime' : 'none' }}
                                        _hover={{ borderColor: wPoktAmount === BigInt(0) ? 'poktLime' : 'none' }}
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
                                    {currentStep === 1 ? (
                                        <Button
                                            color="darkBlue"
                                            background="poktLime"
                                            borderWidth={2}
                                            borderColor="poktLime"
                                            height={8}
                                            minW={200}
                                            _hover={{ bg: "hover.poktLime" }}
                                            leftIcon={<EthIcon />}
                                            onClick={openConnectModal}
                                        >
                                            Connect ETH Wallet
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            borderColor="poktLime"
                                            bg="transparent"
                                            color="white"
                                            height={8}
                                            _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                            leftIcon={<EthIcon fill={"white"}/>}
                                            onClick={openConnectModal}
                                            minW={200}
                                        >
                                            Connect ETH Wallet
                                        </Button>
                                    )}
                                </Center>
                            )}
                        </Box>
                    </Center>
                    <Center mt={6}>
                        <HStack width={320} mb={1} justify="space-between">
                            <Text>Destination Wallet</Text>
                            <Text>{poktAddress ? `${formatPokt(poktBalance)} POKT in wallet` : 'No wallet connected'}</Text>
                        </HStack>
                    </Center>
                    {poktAddress ? (
                        <Flex align="center" justify="space-between" bg="darkBlue" paddingX={4} paddingY={2} maxW={screenWidth}>
                            <PoktIcon fill="poktBlue" width="21px" height="21px" />
                            <Text>{screenWidth && screenWidth < 400 ? poktAddress.substring(0,6) + '...' + poktAddress.substring(poktAddress.length - 6, poktAddress.length - 1) : poktAddress}</Text>
                            <CloseIcon width="22.63px" height="22.63px" fill="none" />
                        </Flex>
                    ) : (
                        <Center>
                            {currentStep === 2 ? (
                                <Button
                                    color="darkBlue"
                                    background="poktLime"
                                    borderWidth={2}
                                    borderColor="poktLime"
                                    height={8}
                                    minW={200}
                                    _hover={{ bg: "hover.poktLime" }}
                                    leftIcon={<PoktIcon />}
                                    onClick={connectSendWallet}
                                >
                                    Connect POKT Wallet
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    borderColor="poktLime"
                                    bg="transparent"
                                    color="white"
                                    height={8}
                                    _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                    leftIcon={<PoktIcon fill={"white"}/>}
                                    onClick={connectSendWallet}
                                    minW={200}
                                >
                                    Connect POKT Wallet
                                </Button>
                            )}
                        </Center>
                    )}
                    <Center mt={6}>
                        <Box width={320}>
                            <Text>Estimated POKT received</Text>
                            <HStack justify="space-between" paddingX={10} paddingY={4} bg="darkBlue" height="52px">
                                <Text
                                    fontWeight={700}
                                    fontSize={18}
                                >
                                    {wPoktAmountInput.length ? wPoktAmountInput : ' '}
                                </Text>
                                <PoktIcon fill="white" width="21px" height="21px" />
                            </HStack>
                        </Box>
                    </Center>
                    <Center>
                        <Divider mt={6} borderColor={"poktLime"} maxW={360} />
                    </Center>
                    <Center my={6}>
                        <VStack width={320} spacing={4} align="flex-start">
                            <Box>
                                <Text>Estimated Gas Cost:</Text>
                                <Flex align="center" gap={2}>
                                    <Text>{estGasCost ? (estGasCost.startsWith('0.0000') ? '<0.0001' : estGasCost.substring(0,7)) : '----'} ETH</Text>
                                    {(!!ethPrice && !!estGasCost) && <Text>(~${(parseFloat(estGasCost) * parseFloat(formatUnits(ethPrice, 8))).toFixed(2)})</Text>}
                                    {(insufficientEthGas && address) && <ErrorIcon _hover={{ cursor: 'pointer' }} onClick={displayInsufficientGasToast} />}
                                </Flex>
                            </Box>
                            <Box>
                                <Text>Estimated time for bridge:</Text>
                                <Flex align="center" gap={2}>
                                    <Text>~30 Minutes</Text>
                                    <InfoIcon _hover={{ cursor: "pointer" }} onClick={onTimeInfoOpen} />
                                </Flex>
                            </Box>
                        </VStack>
                    </Center>
                    <Center>
                        {currentStep === 3 ? (
                            <Button
                                bg="poktLime"
                                borderColor="poktLime"
                                borderWidth={2}
                                color="darkBlue"
                                width="100px"
                                paddingY={6}
                                _hover={{ bg: "hover.poktLime" }}
                                onClick={burn}
                                isDisabled={!poktAddress||!address||!wPoktAmount}
                            >
                                Unwrap
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                borderColor="poktLime"
                                borderWidth={2}
                                bg="transparent"
                                color="white"
                                width="100px"
                                paddingY={6}
                                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                onClick={burn}
                                isDisabled={!poktAddress||!address||!wPoktAmount}
                            >
                                Unwrap
                            </Button>
                        )}
                    </Center>
                    <ProgressModal isOpen={isProgressOpen} onClose={onProgressClose}><></></ProgressModal>
                </Container>
            )}
            <GasInfoModal isOpen={isGasInfoOpen} onClose={onGasInfoClose}><></></GasInfoModal>
            <TimeInfoModal isOpen={isTimeInfoOpen} onClose={onTimeInfoClose}><></></TimeInfoModal>
        </VStack>
    )
}