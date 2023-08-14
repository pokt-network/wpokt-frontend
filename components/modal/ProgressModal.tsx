import { Box, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, ModalProps, Link, Divider, useDisclosure, useTimeout, SkeletonCircle, Circle, useInterval } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { BlueEthIcon } from "../icons/eth";
import { BlueBridgeIcon } from "../icons/copper";
import { BluePoktIcon } from "../icons/pokt";
import { BlueCheckIcon } from "../icons/misc";
import { useGlobalContext } from "@/context/Globals";
import { MintModal } from "./MintModal";
import { TimeoutModal } from "./TimeoutModal";
import { InvalidMint, Status } from "@/types";
import { RefundModal } from "./RefundModal";


export function ProgressModal(props: ModalProps) {
    const {
        destination,
        ethTxHash,
        setEthTxHash,
        poktTxHash,
        setPoktTxHash,
        poktTxOngoing,
        poktTxSuccess,
        poktTxError,
        burnFunc,
        burnTx,
        currentMint,
        setCurrentMint,
        mintTx,
        mintTxHash,
        currentBurn,
        setCurrentBurn
    } = useGlobalContext()

    // STEPS
    // 0. Sending POKT to vault
    // 1. Vault is validating order
    // 2. Waiting for user to mint wPOKT
    // 3. Minting wPOKT
    // 4. wPOKT minted
    // const [step, setStep] = useState<number>(getCurrentStep())
    const [isBurnFetchError, setIsBurnFetchError] = useState<boolean>(false)
    const [isMintFetchError, setIsMintFetchError] = useState<boolean>(false)
    const [invalidMint, setInvalidMint] = useState<InvalidMint|undefined>(undefined)
    const [poktRefundTxHash, setPoktRefundTxHash] = useState<string>("")

    const { isOpen: isMintOpen, onOpen: onMintOpen, onClose: onMintClose } = useDisclosure()
    const { isOpen: isTimeoutOpen, onOpen: onTimeoutOpen, onClose: onTimeoutClose } = useDisclosure()
    const { isOpen: isRefundOpen, onOpen: onRefundOpen, onClose: onRefundClose } = useDisclosure()

    const step = useMemo(() => getCurrentStep(), [poktTxOngoing, poktTxSuccess, poktTxError, burnTx?.status, currentBurn?.status, mintTx?.status, currentMint?.status])
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
            if (step === 0) return 1000 * 60
            if (step === 1) {
                if (currentMint?.status === Status.CONFIRMED) return 1000 * 60
                else return 1000 * 60 * 3
            }
            if (step === 2) return 1000 * 60 * 5
            return 60000
        }
    }, [step])
    useEffect(() => { readyToMintWPokt() }, [step])
    // useEffect(() => {
    //     if (step === 1 && destination === "pokt" && ethTxHash && burnTx?.isSuccess) getBurnInfo()
    //     if (step === 1 && destination === "eth" && poktTxHash) getMintInfo()
    // }, [step, destination, ethTxHash, burnTx?.isSuccess, poktTxHash, mintTx?.isSuccess])
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

    function getCurrentStep(): number {
        if (destination === "pokt") {
            if (currentBurn?.status === Status.SUCCESS) return 3
            if (currentBurn?.status === Status.SIGNED || currentBurn?.status === Status.SUMBITTED) {
                setPoktTxHash(currentBurn?.return_tx_hash || "")
                return 2
            }
            if (currentBurn?.status === Status.CONFIRMED) return 1
            return 0
        } else {
            // if done, return 4
            // if minting, return 3
            // if ready to mint, return 2
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

    async function getPoktTxStatus() {
        try {
            const tx = await window.pocketNetwork.send("pokt_tx", [{ hash: poktTxHash }])
            console.log("Pokt Tx Status:", tx)
        } catch (error) {
            console.error(error)
        }
    }

    function readyToMintWPokt() {
        if (step === 2 && destination !== "pokt") {
            onMintOpen()
        }
    }

    async function getBurnInfo() {
        try {
            if (currentBurn?.status === "success") return
            const res = await fetch(`/api/burns/hash/${ethTxHash}`)
            const burn = await res.json()
            console.log("Burn from DB:", burn)
            setCurrentBurn(burn)
            setIsBurnFetchError(false)
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
            } catch (error) {
                console.error(error)
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
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktBlue">{destination === 'pokt' && 'UN'}WRAPPING IN PROGRESS</ModalHeader>
                <ModalCloseButton color="poktBlue" />
                <ModalBody padding={0}>
                    <Text paddingX={8} mb={8}>
                        You can close this window or refresh this page without interrupting the process.
                    </Text>
                    <Flex justify="center">
                        <Flex direction="column" align="center">
                            {step > 0 ? <BlueCheckIcon/> : 
                                <Circle>
                                    <SkeletonCircle position="fixed" size="20" />
                                    {destination === "pokt" ? <BlueEthIcon zIndex={2} /> : <BluePoktIcon zIndex={2} />}
                                </Circle>
                            }
                            {step === 0 && <Divider borderColor="poktLime" orientation="vertical" height="50px" />}
                        </Flex>
                        <Divider borderColor="poktLime" height="25px" maxWidth="50px" />
                        <Flex direction="column" align="center">
                            {step > 1 ? <BlueCheckIcon/> : step === 1 ? (
                                <Circle>
                                    <SkeletonCircle position="fixed" size="20" />
                                    <BlueBridgeIcon zIndex={2} />
                                </Circle>
                            ) : <BlueBridgeIcon/>}
                            {step === 1 && <Divider borderColor="poktLime" orientation="vertical" height="50px" />}
                        </Flex>
                        <Divider borderColor="poktLime" height="25px" maxWidth="50px" />
                        <Flex direction="column" align="center">
                            {destination === "pokt" ? step > 2 ? <BlueCheckIcon/> : <>{step === 2 ? (
                                <Circle>
                                    <SkeletonCircle position="fixed" size="20" />
                                    <BluePoktIcon zIndex={2} />
                                </Circle>
                            ) : <BluePoktIcon />}</> : step > 3 ? <BlueCheckIcon/> : <>{step >= 2 ? (
                                <Circle>
                                    <SkeletonCircle position="fixed" size="20" />
                                    <BlueEthIcon zIndex={2} />
                                </Circle>
                            ): <BlueEthIcon />}</>}
                            {step >= 2 && <Divider borderColor="poktLime" orientation="vertical" height="50px" />}
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
    return (
        <Flex
            direction="column"
            bg="darkOverlay"
            borderTopColor="poktLime"
            borderTopWidth={1}
            justify="center"
            align="center"
            padding={3}
            gap={2}
        >
            {destination === "pokt" ? (
                <>
                <Box textAlign="center">
                    <Text color="poktBlue">
                        {step === 0 && "Sending your wPOKT to the vault"}
                        {step === 1 && "Bridging your order"}
                        {step === 2 && "Unlocking POKT"}
                        {step > 2 && "Transaction Complete!"}
                    </Text>
                    <Text>
                        {step === 0 && "It may take up to 32 blocks to arrive, which is about 6 minutes."}
                        {step === 1 && "We are reviewing and approving your order. This process should take about 5-10 minutes."}
                        {step === 2 && "Your POKT is on the way! It may take a few blocks to confirm. Pocket blocks complete every 15 minutes."}
                        {step > 2 && "Your wPOKT is in your destination wallet."}
                    </Text>
                </Box>
                <Link textDecor="underline" color="poktLime" href={step < 2 ? `https://goerli.etherscan.io/tx/${ethTxHash}` : `https://poktscan.com/tx/${poktTxHash}`} isExternal>
                    {step === 0 && "View this transaction on Etherscan"}
                    {step === 1 && "View last transaction on Etherscan"}
                    {step === 2 && "View this transaction on PoktScan"}
                    {step > 2 && "View this transaction on PoktScan"}
                </Link>
                </>
            ) : (
                <>
                <Box textAlign="center">
                    <Text color="poktBlue">
                        {step === 0 && "Sending your POKT to the vault"}
                        {step === 1 && "Bridging your order"}
                        {step === 2 && "Minting wPOKT"}
                        {step > 2 && "Transaction Complete!"}
                    </Text>
                    <Text>
                        {step === 0 && "This may take several blocks to confirm. Pocket blocks complete every 15 minutes."}
                        {step === 1 && "We are reviewing and approving your order. This process should take about 5-10 minutes."}
                        {(step === 2 || step === 3) && "Your wPOKT is on the way! It may take up to 32 blocks to arrive, which is about 6 minutes."}
                        {step > 3 && "Your wPOKT is in your destination wallet."}
                    </Text>
                </Box>
                <Link textDecor="underline" color="poktLime" href={step < 2 ? `https://poktscan.com/tx/${poktTxHash}` : `https://goerli.etherscan.io/tx/${ethTxHash}`} isExternal>
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