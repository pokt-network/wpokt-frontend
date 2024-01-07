import { Box, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, ModalProps, Link, Divider, useDisclosure, useTimeout, SkeletonCircle, Circle, useInterval, HStack, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { BlueEthIcon } from "../icons/eth";
import { BlueBridgeIcon } from "../icons/copper";
import { BluePoktIcon } from "../icons/pokt";
import { BlueCheckIcon, InfoIcon } from "../icons/misc";
import { fetchActiveMints, useGlobalContext } from "@/context/Globals";
import { MintModal } from "./MintModal";
import { TimeoutModal } from "./TimeoutModal";
import { InvalidMint, Status } from "@/types";
import { RefundModal } from "./RefundModal";
import { CHAIN, ETH_CHAIN_ID, POKT_CHAIN_ID, POKT_RPC_URL } from "@/utils/constants";
import { useAccount } from "wagmi";


export function ProgressModal(props: ModalProps) {
    const {
        destination,
        ethTxHash,
        setEthTxHash,
        poktTxHash,
        setPoktTxHash,
        poktTxOngoing,
        setPoktTxOngoing,
        poktTxSuccess,
        setPoktTxSuccess,
        poktTxError,
        burnFunc,
        burnTx,
        currentMint,
        setCurrentMint,
        mintTx,
        mintTxHash,
        currentBurn,
        setCurrentBurn,
        isUsingHardwareWallet,
        setAllPendingMints
    } = useGlobalContext()

    const [isBurnFetchError, setIsBurnFetchError] = useState<boolean>(false)
    const [isMintFetchError, setIsMintFetchError] = useState<boolean>(false)
    const [invalidMint, setInvalidMint] = useState<InvalidMint|undefined>(undefined)
    const [poktRefundTxHash, setPoktRefundTxHash] = useState<string>("")

    const { isOpen: isMintOpen, onOpen: onMintOpen, onClose: onMintClose } = useDisclosure()
    const { isOpen: isTimeoutOpen, onOpen: onTimeoutOpen, onClose: onTimeoutClose } = useDisclosure()
    const { isOpen: isRefundOpen, onOpen: onRefundOpen, onClose: onRefundClose } = useDisclosure()
    const { address } = useAccount()

    const step = useMemo(() => getCurrentStep(), [poktTxOngoing, poktTxSuccess, poktTxError, burnTx?.status, currentBurn?.status, currentBurn?.return_tx_hash, mintTx?.status, currentMint?.status])
    const timeInterval = useMemo(() => {
        if (destination === "eth") {
            if (step === 0) return 1000 * 60 * 5
            if (step === 1) {
                if (currentMint?.status === Status.CONFIRMED) return 1000 * 60
                else return 1000 * 60 * 3
            }
            if (step === 3) return 1000 * 60
            return 60000
        } else {
            if (step === 0) return 1000 * 15
            if (step === 1) return 1000 * 60
            if (step === 2) return 1000 * 60 * 3
            return 60000
        }
    }, [step])

    useEffect(() => { readyToMintWPokt() }, [step])
    
    useEffect(() => {
        if (destination === "eth" && currentMint?.status === Status.FAILED) getInvalidMintInfo()
    }, [currentMint?.status])

    useInterval(() => {
        if ((step >= 0 && destination === "pokt" && ethTxHash) || isBurnFetchError) getBurnInfo()
        if ((step >= 0 && destination === "eth" && poktTxHash) || isMintFetchError) {
            if (step !== 2) getMintInfo()
        }
    }, timeInterval)

    function isTakingTooLong() {
        let startTime;
        let currentTime = Date.now()
        if (destination === "pokt") {
            if (step === 1) {
                startTime = (new Date(currentBurn?.created_at as Date)).valueOf()
                if (startTime && currentTime - startTime > 1000 * 60 * 10) return onTimeoutOpen()
                return
            }
            if (step === 2) {
                startTime = (new Date(currentBurn?.updated_at as Date)).valueOf()
                if (startTime && currentTime - startTime > 1000 * 60 * 20) return onTimeoutOpen()
                return
            }
        } else {
            if (step === 0) {
                startTime = (new Date(currentMint?.created_at as Date)).valueOf()
                if (startTime && currentTime - startTime > 1000 * 60 * 20) return onTimeoutOpen()
                return
            }
            if (step === 1) {
                startTime = (new Date(currentMint?.updated_at as Date)).valueOf()
                if (startTime && currentTime - startTime > 1000 * 60 * 10) return onTimeoutOpen()
                return
            }
            if (step === 3) {
                startTime = (new Date(currentMint?.updated_at as Date)).valueOf()
                if (startTime && currentTime - startTime > 1000 * 60 * 12) return onTimeoutOpen()
                return
            }
        }
    }

    // STEPS
    // POKT => ETH
    // 0. Sending POKT to vault
    // 1. Vault is validating order
    // 2. Waiting for user to mint wPOKT
    // 3. Minting wPOKT
    // 4. wPOKT minted
    // ETH => POKT
    // 0. Burning wPOKT
    // 1. Vault is validating order
    // 2. Vault sends POKT to user
    // 3. POKT transaction confirmed
    function getCurrentStep(): number {
        if (destination === "pokt") {
            if (currentBurn?.status === Status.SUCCESS) {
                setPoktTxHash(currentBurn?.return_tx_hash)
                if (poktTxSuccess) return 3
                return 2
            }
            if (currentBurn?.status === Status.SIGNED || currentBurn?.status === Status.SUMBITTED) {
                if (!currentBurn?.return_tx_hash) return 1
                setPoktTxHash(currentBurn?.return_tx_hash)
                return 2
            }
            if (currentBurn?.status === Status.CONFIRMED || currentBurn?.status === Status.PENDING || burnTx?.isSuccess) return 1
            return 0
        } else {
            if (currentMint?.status === Status.SUCCESS || mintTx?.isSuccess) {
                setEthTxHash(mintTxHash || "")
                return 4
            }
            if ((currentMint?.status === Status.PENDING && currentMint?.mint_tx_hash) || mintTx?.isLoading) {
                setEthTxHash(mintTxHash || "")
                return 3
            }
            if (currentMint?.status === Status.SIGNED) return 2
            if (currentMint?.status === Status.CONFIRMED || currentMint?.status === Status.PENDING) return 1
            return 0
        }
    }

    async function getPoktTxStatus(txHash: string = poktTxHash) {
        try {
            if (isUsingHardwareWallet) {
                const poktGatewayUrl = POKT_RPC_URL;
                const res = await fetch(`${poktGatewayUrl}/v1/query/tx`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        hash: txHash,
                        prove: false
                    })
                })
                const tx = await res.json()
                console.log("Pokt Tx Status:", tx)
                if (!tx.hash) throw new Error("Tx hash is pending or invalid")
                setPoktTxSuccess(true)
                return tx
            } else {
                const tx = await window.pocketNetwork.send("pokt_tx", [{ hash: txHash }])
                console.log("Pokt Tx Status:", tx)
                if (!tx.hash) throw new Error("Tx hash is pending or invalid")
                setPoktTxSuccess(true)
                return tx
            }
        } catch (error) {
            console.error(error)
            return undefined
        }
    }

    async function checkOtherMints() {
        let otherMintsPending = false
        try {
            if (!address) throw new Error("No address")
            const mints = await fetchActiveMints(address)
            if (mints && mints.length > 0) {
                const allPending = mints.filter(mint => mint.status === "signed")
                const previous = allPending.filter(mint => mint.transaction_hash.toLowerCase() !== poktTxHash.toLowerCase())
                if (previous.length > 0) {
                    otherMintsPending = true
                    setAllPendingMints(allPending)
                }
            }
        } catch (error) {
            console.error(error)
        }
        return otherMintsPending
    }

    async function readyToMintWPokt() {
        if (step === 2 && destination !== "pokt") {
            const prevMintsReady = await checkOtherMints()
            if (prevMintsReady) {
                return props.onClose()
            }
            onMintOpen()
        }
    }

    async function getBurnInfo() {
        try {
            if (currentBurn?.status === "success") {
                if (!poktTxSuccess) return await getPoktTxStatus()
                else return
            }
            const res = await fetch(`/api/burns/hash/${ethTxHash}`)
            const burn = await res.json()
            console.log("Burn from DB:", burn)
            setCurrentBurn(burn)
            setIsBurnFetchError(false)
            if (burn.status === Status.SUCCESS) {
                if (!poktTxSuccess) await getPoktTxStatus()
            }
        } catch (error) {
            console.error(error)
            setIsBurnFetchError(true)
        }
        isTakingTooLong()
    }

    async function getMintInfo() {
        if (!currentMint || currentMint?.status !== Status.SUCCESS) {
            try {
                if (step === 0) await getPoktTxStatus()
                const res = await fetch(`/api/mints/hash/${poktTxHash}`)
                const mint = await res.json()
                console.log("Mint from DB:", mint)
                setCurrentMint(mint)
                setIsMintFetchError(false)
            } catch (error) {
                console.error(error)
                setIsMintFetchError(true)
            }
        }
        isTakingTooLong()
    }

    async function getInvalidMintInfo() {
        try {
            const res = await fetch(`/api/invalidMints/hash/${poktTxHash}`)
            const invalidMint = await res.json()
            console.log("Invalid Mint from DB:", invalidMint)
            setInvalidMint(invalidMint)
            setPoktRefundTxHash(invalidMint?.return_tx_hash || "")
            onRefundOpen()
            props.onClose()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktLime">{destination === 'pokt' && 'UN'}WRAPPING IN PROGRESS</ModalHeader>
                <ModalCloseButton color="poktLime" _hover={{ color: "hover.poktLime" }} />
                <ModalBody padding={0}>
                    {destination === "eth" && step < 3 ? (
                        <VStack paddingX={10} mb={8} gap={0}>
                            <HStack justify='center' gap={4} align='center'>
                                <InfoIcon fill='poktLime' />
                                <Text textColor='poktLime'>
                                    You still need to sign to mint wPOKT.
                                </Text>
                                <InfoIcon fill='poktLime' />
                            </HStack>
                            <Text textAlign="center">Keep an eye on this page, or check back later. We will let you know when we need your signature.</Text>
                        </VStack>
                    ) : (
                        <Text textAlign="center" paddingX={10} mb={8}>
                            You can close this window or refresh this page without interrupting the process.
                        </Text>
                    )}
                    
                    <Flex justify="center">
                        <Flex direction="column" align="center">
                            {step > 0 ? <BlueCheckIcon/> : 
                                <Circle>
                                    <SkeletonCircle position="absolute" size="20" bg="darkBlue" />
                                    {destination === "pokt" ? <BlueEthIcon zIndex={2} /> : <BluePoktIcon zIndex={2} />}
                                </Circle>
                            }
                            {step === 0 && <Divider borderColor="poktLime" orientation="vertical" height="40px" mt="10px" />}
                        </Flex>
                        <Divider borderColor="poktLime" height="25px" maxWidth={step <= 1 ? "40px" : "50px"} ml={step === 0 ? "10px" : 0} mr={step === 1 ? "10px" : 0} />
                        <Flex direction="column" align="center">
                            {step > 1 ? <BlueCheckIcon/> : step === 1 ? (
                                <Circle>
                                    <SkeletonCircle position="absolute" size="20" />
                                    <BlueBridgeIcon zIndex={2} />
                                </Circle>
                            ) : <BlueBridgeIcon/>}
                            {step === 1 && <Divider borderColor="poktLime" orientation="vertical" height="40px" mt="10px" />}
                        </Flex>
                        <Divider borderColor="poktLime" height="25px" maxWidth={step >= 1 && ((step <= 3 && destination === 'eth') || (step <= 2 && destination === 'pokt')) ? "40px" : "50px"} ml={step === 1 || (step === 2 && destination === "eth") ? "10px" : 0} mr={(step === 3 && destination === 'eth') || (step === 2 && destination === "pokt") ? "10px" : 0} />
                        <Flex direction="column" align="center">
                            {destination === "pokt" ? step > 2 ? <BlueCheckIcon/> : <>{step === 2 ? (
                                <Circle>
                                    <SkeletonCircle position="absolute" size="20" />
                                    <BluePoktIcon zIndex={2} />
                                </Circle>
                            ) : <BluePoktIcon />}</> : step > 3 ? <BlueCheckIcon/> : <>{step >= 2 ? (
                                <Circle>
                                    <SkeletonCircle position="absolute" size="20" />
                                    <BlueEthIcon zIndex={2} />
                                </Circle>
                            ): <BlueEthIcon />}</>}
                            {step >= 2 && <Divider borderColor="poktLime" orientation="vertical" height={(step === 2 && destination === 'pokt')||(step === 3 && destination === 'eth') ? "40px" : "50px"} mt={(step === 2 && destination === 'pokt')||(step === 3 && destination === 'eth') ? "10px" : "0px"} />}
                        </Flex>
                    </Flex>
                    <ProgressModalStatusDescription step={step} destination={destination} poktTxHash={poktTxHash} ethTxHash={ethTxHash} />
                    {(step === 2 && destination !== "pokt") && (
                        <MintModal isOpen={isMintOpen} onClose={onMintClose} mintInfo={currentMint}><></></MintModal>
                    )}
                    <TimeoutModal isOpen={isTimeoutOpen} onClose={onTimeoutClose}><></></TimeoutModal>
                    {(!!invalidMint||!!poktRefundTxHash) && (
                        <RefundModal isOpen={isRefundOpen} onClose={onRefundClose} refundTxHash={poktRefundTxHash ?? invalidMint?.return_tx_hash}><></></RefundModal>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}


export function ProgressModalStatusDescription({poktTxHash, ethTxHash, step, destination}: {poktTxHash?: string, ethTxHash?: string, step: number, destination: string}) {
    const ethTxUrl = Number(ETH_CHAIN_ID) !== 1 ? `https://${CHAIN.name}.etherscan.io/tx/${ethTxHash}` : `https://etherscan.io/tx/${ethTxHash}`
    const poktTxUrl = POKT_CHAIN_ID !== "mainnet" ? `https://poktscan.com/testnet/tx/${poktTxHash}` : `https://poktscan.com/tx/${poktTxHash}`

    return (
        <Flex
            direction="column"
            // bg="darkOverlay"
            borderTopColor="poktLime"
            borderTopWidth={1}
            justify="center"
            align="center"
            padding={3}
            paddingX={8}
            gap={2}
        >
            {destination === "pokt" ? (
                <>
                <Box textAlign="center">
                    <Text color="poktLime" fontSize={18} fontWeight={"bold"}>
                        {step === 0 && "Sending your wPOKT to the vault"}
                        {step === 1 && "Bridging your order"}
                        {step === 2 && "Unlocking POKT"}
                        {step > 2 && "Transaction Complete!"}
                    </Text>
                    {step === 0 && (
                        <>
                        <Text>It may take up to 32 blocks to arrive,</Text>
                        <Text>which is about 6 minutes.</Text>
                        </>
                    )}
                    {step === 1 && (
                        <>
                        <Text>We are reviewing and approving your order.</Text>
                        <Text>This process should take about 5-10 minutes.</Text>
                        </>
                    )}
                    {step === 2 && (
                        <>
                        <Text>Your POKT is on the way! It may take a few blocks to confirm. Pocket blocks complete every 15 minutes.</Text>
                        <Text></Text>
                        </>
                    )}
                    {step > 2 && (
                        <Text>Your POKT is in your destination wallet.</Text>
                    )}
                </Box>
                <Link textDecor="underline" color="poktLime" href={step < 2 ? ethTxUrl : poktTxUrl} isExternal>
                    {step === 0 && "View this transaction on Etherscan"}
                    {step === 1 && "View last transaction on Etherscan"}
                    {step === 2 && "View this transaction on PoktScan"}
                    {step > 2 && "View this transaction on PoktScan"}
                </Link>
                </>
            ) : (
                <>
                <Box textAlign="center">
                    <Text color="poktLime" fontSize={18} fontWeight={"bold"}>
                        {step === 0 && "Sending your POKT to the vault"}
                        {step === 1 && "Bridging your order"}
                        {(step === 2 || step === 3) && "Minting wPOKT"}
                        {step > 3 && "Transaction Complete!"}
                    </Text>
                    {step === 0 && (
                        <>
                        <Text>This may take several blocks to confirm.</Text>
                        <Text>Pocket blocks complete every 15 minutes.</Text>
                        </>
                    )}
                    {step === 1 && (
                        <>
                        <Text>We are reviewing and approving your order.</Text>
                        <Text>This process should take about 5-10 minutes.</Text>
                        </>
                    )}
                    {(step === 2 || step === 3) && (
                        <Text>Your wPOKT is on the way! It may take up to 32 blocks to arrive, which is about 6 minutes.</Text>
                    )}
                    {step > 3 && (
                        <Text>Your wPOKT is in your destination wallet.</Text>
                    )}
                </Box>
                <Link textDecor="underline" color="poktLime" href={step < 2 ? poktTxUrl : ethTxUrl} isExternal _hover={{ color: "hover.poktLime" }}>
                    {step === 0 && "View this transaction on PoktScan"}
                    {step === 1 && "View last transaction on PoktScan"}
                    {step === 2 && "View this transaction on Etherscan"}
                    {step > 2 && "View this transaction on Etherscan"}
                </Link>
                </>
            )}
        </Flex>
    )
}
