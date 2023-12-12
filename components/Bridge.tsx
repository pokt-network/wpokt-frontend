import { Box, Button, ButtonGroup, Center, Container, Divider, Flex, HStack, Input, Link, Text, VStack, useDisclosure, useToast } from "@chakra-ui/react";
import { EthIcon } from "./icons/eth";
import { PoktIcon } from "./icons/pokt";
import { useEffect, useMemo, useState } from "react";
import { ProgressModal } from "./modal/ProgressModal";
import { CloseIcon, ErrorIcon, InfoIcon } from "./icons/misc";
import { useGlobalContext } from "@/context/Globals";
import { TimeInfoModal } from "./modal/TimeInfoModal";
import { useAccount, useBalance, useContractRead, useFeeData } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatPokt, parsePokt } from "@/utils/pokt";
import { CHAIN, CHAINLINK_ETH_USD_ADDRESS, WPOKT_ADDRESS } from "@/utils/constants";
import { CHAINLINK_AGGREGATOR_V3_INTERFACE_ABI, WRAPPED_POCKET_ABI } from "@/utils/abis";
import { createPublicClient, formatEther, formatUnits, getAddress, http, parseUnits } from "viem";
import { ResumeWrapModal } from "./modal/ResumeWrapModal";
import { GasInfoModal } from "./modal/GasInfoModal";
import { ConnectPoktModal } from "./modal/ConnectPoktModal";


export function Bridge() {
    const [estGasCost, setEstGasCost] = useState<string>("")
    const [ethPrice, setEthPrice] = useState<bigint|undefined>(undefined)
    const [insufficientEthGas, setInsufficientEthGas] = useState<boolean>(false)
    const {
        screenWidth,
        poktAddress,
        destination,
        setDestination,
        poktBalance,
        bridgePoktToEthereum,
        poktTxOngoing,
        setEthTxHash,
        poktAmount,
        wPoktAmount,
        setPoktAmount,
        setWPoktAmount,
        poktAmountInput,
        wPoktAmountInput,
        setPoktAmountInput,
        setWPoktAmountInput,
        burnFunc,
        burnTx,
        allPendingMints,
        currentBurn,
        currentMint,
        getPoktBalance,
        isSigningTx,
        setIsSigningTx,
        resetProgress,
    } = useGlobalContext()

    const { address } = useAccount()
    const { openConnectModal } = useConnectModal()
    const { data: wPoktBalanceData, refetch: refetchWPoktBalance } = useBalance({
        address,
        token: WPOKT_ADDRESS,
        watch: true,
        cacheTime: 30_000
    })
    const { data: ethBalanceData, isSuccess } = useBalance({
        address,
        watch: true,
        cacheTime: 30_000
    })
    const { data: feeData } = useFeeData({ chainId: CHAIN.id, watch: true, cacheTime: 30_000 })
    const { data: priceData, isSuccess: isPriceSuccess } = useContractRead({
        address: CHAINLINK_ETH_USD_ADDRESS,
        abi: CHAINLINK_AGGREGATOR_V3_INTERFACE_ABI,
        functionName: 'latestRoundData',
    })

    const { isOpen: isProgressOpen, onOpen: onProgressOpen, onClose: onProgressClose } = useDisclosure()
    const { isOpen: isTimeInfoOpen, onOpen: onTimeInfoOpen, onClose: onTimeInfoClose } = useDisclosure()
    const { isOpen: isGasInfoOpen, onOpen: onGasInfoOpen, onClose: onGasInfoClose } = useDisclosure()
    const { isOpen: isResumeMintOpen, onOpen: onResumeMintOpen, onClose: onResumeMintClose } = useDisclosure()
    const { isOpen: isConnectPoktModalOpen, onOpen: onConnectPoktModalOpen, onClose: onConnectPoktModalClose } = useDisclosure()

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

    const ethGas = useMemo(async () => {
        let gas = BigInt(0)
        if (address && poktAddress) {
            try {
                const pubClient = createPublicClient({
                    chain: CHAIN,
                    transport: http()
                })
                if (destination === "pokt") {
                    gas = await pubClient.estimateContractGas({
                        address: getAddress(WPOKT_ADDRESS),
                        abi: WRAPPED_POCKET_ABI,
                        functionName: 'burnAndBridge',
                        args: [wPoktAmount, getAddress(`0x${poktAddress}`)],
                        account: getAddress(address ?? '')
                    })
                } else {
                    gas = poktAmount > BigInt(0) ? BigInt(289000) : BigInt(0) // Default estimate for minting
                }
            } catch (error) {
                console.error(error)
                if (destination === "eth" && poktAmount > BigInt(0)) gas = BigInt(289000) // Default estimate for minting
            }
        }
        return gas
    }, [destination, address, poktAddress, poktAmount, wPoktAmount])

    useEffect(() => {
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
        getGasCost()
    }, [ethGas, feeData?.maxFeePerGas])

    useEffect(() => {
        if (allPendingMints.length > 0 && !isProgressOpen) onResumeMintOpen()
    }, [allPendingMints, isProgressOpen])

    useEffect(() => {
        if (isSuccess && ethBalanceData && estGasCost) {
            if (ethBalanceData?.value < parseUnits(estGasCost, 18)) {
                setInsufficientEthGas(true)
            } else {
                setInsufficientEthGas(false)
            }
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
            setIsSigningTx(true)
            try {
                const tx = await burnFunc.writeAsync()
                setEthTxHash(tx.hash)
                onProgressOpen()
            } catch (error) {
                console.error(error)
            }
            setIsSigningTx(false)
        }
    }

    async function getGasCost(): Promise<void> {
        const gas = await ethGas
        setEstGasCost(gas > BigInt(0) ? formatEther(gas * (feeData?.maxFeePerGas ?? BigInt(0))) : "")
    }

    function displayInsufficientGasToast() {
        const toastId = 'insufficient-gas'
        if (!toast.isActive(toastId)) toast({
            id: toastId,
            position: "top-right",
            duration: 5000,
            render: () => (
                <HStack spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="error" borderBottomWidth={1}>
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
                <HStack spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="error" borderBottomWidth={1}>
                    <ErrorIcon />
                    <Text color="error">Insufficient {destination === "eth" ? "POKT" : "token"} balance.</Text>
                </HStack>
            )
        })
    }

    function displayMissingInputsToast() {
        const toastId = 'missing-inputs'
        if (!toast.isActive(toastId)) toast({
            id: toastId,
            position: "top-right",
            duration: 5000,
            render: () => (
                <HStack spacing={4} padding={4} minW={330} bg="darkBlue" borderRadius={10} borderBottomColor="error" borderBottomWidth={1}>
                    <ErrorIcon />
                    <Text color="error">Select wallets and an amount to bridge first.</Text>
                </HStack>
            )
        })
    }

    return (
        <VStack minWidth={screenWidth && screenWidth < 580 ? screenWidth : '580px'}>
            {destination === "eth" ? (
                <Container bg="darkOverlay" paddingY={4} borderRadius={4}>
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
                                        fontWeight={700}
                                        fontSize={16}
                                        paddingY={6}
                                        paddingX={8}
                                        borderRadius={4}
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
                                            onClick={onConnectPoktModalOpen}
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
                                            onClick={onConnectPoktModalOpen}
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
                            <HStack justify="space-between" paddingX={10} paddingY={4} bg="darkBlue" height="52px" borderRadius={4}>
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
                                    <Text fontWeight={500} fontSize={16}>{0.01} POKT + {estGasCost ? (estGasCost.startsWith('0.0000') ? '<0.0001' : estGasCost.substring(0,7)) : '----'} ETH</Text>
                                    {(!!ethPrice && !!estGasCost) && <Text fontWeight={500} fontSize={16}>(~${(parseFloat(estGasCost) * parseFloat(formatUnits(ethPrice, 8))).toFixed(2)})</Text>}
                                    <InfoIcon _hover={{ cursor: "pointer" }} onClick={onGasInfoOpen} />
                                    {((insufficientEthGas) && address && poktAddress) && <ErrorIcon _hover={{ cursor: 'pointer' }} onClick={displayInsufficientGasToast} />}
                                </Flex>
                            </Box>
                            <Box>
                                <Text>Estimated time for bridge:</Text>
                                <Flex align="center" gap={2}>
                                    <Text fontWeight={500} fontSize={16}>~30 Minutes</Text>
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
                                }}
                                isDisabled={!poktAddress||!address||!poktAmount}
                                isLoading={isSigningTx}
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
                                onClick={displayMissingInputsToast}
                            >
                                Wrap
                            </Button>
                        )}
                    </Center>
                </Container>
            ) : (
                <Container bg="darkOverlay" paddingY={4} borderRadius={4}>
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
                                        fontWeight={700}
                                        fontSize={16}
                                        paddingY={6}
                                        paddingX={8}
                                        borderRadius={4}
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
                                    onClick={onConnectPoktModalOpen}
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
                                    onClick={onConnectPoktModalOpen}
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
                            <HStack justify="space-between" paddingX={10} paddingY={4} bg="darkBlue" height="52px" borderRadius={4}>
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
                                    <Text fontWeight={500} fontSize={16}>{estGasCost ? (estGasCost.startsWith('0.0000') ? '<0.0001' : estGasCost.substring(0,7)) : '----'} ETH</Text>
                                    {(!!ethPrice && !!estGasCost) && <Text fontWeight={500} fontSize={16}>(~${(parseFloat(estGasCost) * parseFloat(formatUnits(ethPrice, 8))).toFixed(2)})</Text>}
                                    {(insufficientEthGas && address) && <ErrorIcon _hover={{ cursor: 'pointer' }} onClick={displayInsufficientGasToast} />}
                                </Flex>
                            </Box>
                            <Box>
                                <Text>Estimated time for bridge:</Text>
                                <Flex align="center" gap={2}>
                                    <Text fontWeight={500} fontSize={16}>~30 Minutes</Text>
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
                                isLoading={isSigningTx}
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
                                onClick={displayMissingInputsToast}
                            >
                                Unwrap
                            </Button>
                        )}
                    </Center>
                </Container>
            )}
            <Container paddingY={4} borderRadius={4} fontSize={10} bg="darkOverlay">
                <Text textAlign="center">
                    If having trouble, please disable ad blockers and refresh this page. We don&apos;t serve ads but they may prevent the modals from popping up.
                </Text>
            </Container>
            <ResumeWrapModal
                isOpen={isResumeMintOpen}
                onClose={onResumeMintClose}
                mintInfo={allPendingMints.length > 0 ? allPendingMints[allPendingMints.length - 1] : undefined}
                openProgressModal={onProgressOpen}
            ><></></ResumeWrapModal>
            <ProgressModal isOpen={isProgressOpen} onClose={() => {
                onProgressClose()
                resetProgress()
            }}><></></ProgressModal>
            <GasInfoModal isOpen={isGasInfoOpen} onClose={onGasInfoClose}><></></GasInfoModal>
            <TimeInfoModal isOpen={isTimeInfoOpen} onClose={onTimeInfoClose}><></></TimeInfoModal>
            <ConnectPoktModal isOpen={isConnectPoktModalOpen} onClose={onConnectPoktModalClose}><></></ConnectPoktModal>
        </VStack>
    )
}