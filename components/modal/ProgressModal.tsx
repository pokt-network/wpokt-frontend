import { Box, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, ModalProps, Link, Divider, useDisclosure, useTimeout, SkeletonCircle, Circle } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BlueEthIcon } from "../icons/eth";
import { BlueBridgeIcon } from "../icons/copper";
import { BluePoktIcon } from "../icons/pokt";
import { BlueCheckIcon } from "../icons/misc";
import { useGlobalContext } from "@/context/Globals";
import { MintModal } from "./MintModal";


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
    const [step, setStep] = useState<number>(getCurrentStep())

    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => { setStep(getCurrentStep()) }, [poktTxOngoing, poktTxSuccess, poktTxError, burnTx?.status, currentBurn?.status, mintTx?.status, currentMint?.status])
    useEffect(() => { readyToMintWPokt() }, [step])
    useEffect(() => {
        if (step === 1 && destination === "pokt" && ethTxHash) getBurnInfo()
    }, [step, destination, ethTxHash])

    useTimeout(() => {
        if (step >= 1 && destination === "pokt" && ethTxHash) {
            getBurnInfo()
        } else if (step >= 2 && destination !== "pokt" && mintTxHash) {
            console.log("Getting mint info")
            // getMintInfo()
        }
    }, 15000)

    function getCurrentStep(): number {
        if (destination === "pokt") {
            // TODO: add eth to pokt steps
            if (currentBurn?.status === "success") return 3
            if (currentBurn?.status === "signed" || currentBurn?.status === "submitted") {
                setPoktTxHash(currentBurn?.return_tx_hash || "")
                return 2
            }
            console.log("Burn func status:", burnFunc)
            console.log("Burn tx info:", burnTx)
            if (burnTx?.isSuccess) return 1
            return 0
        } else {
            // if done, return 4
            // if minting, return 3
            // if ready to mint, return 2
            if (currentMint?.status === "success" || mintTx?.isSuccess) {
                setEthTxHash(mintTxHash || "")
                return 4
            }
            if (currentMint?.status === "pending" || mintTx?.isLoading) {
                setEthTxHash(mintTxHash || "")
                return 3
            }
            if (currentMint?.status === "signed") return 2
            if (poktTxSuccess) return 1
            return 0
        }
    }

    function readyToMintWPokt() {
        if (step === 2 && destination !== "pokt") {
            onOpen()
        }
    }

    async function getBurnInfo() {
        try {
            const res = await fetch(`/api/burns/hash/${ethTxHash}`)
            const burn = await res.json()
            console.log("Burn from DB:", burn)
            setCurrentBurn(burn)
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
                        <MintModal isOpen={isOpen} onClose={onClose} mintInfo={currentMint}><></></MintModal>
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