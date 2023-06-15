import { Box, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, ModalProps, Link, Divider } from "@chakra-ui/react";
import { useState } from "react";
import { BlueEthIcon } from "../icons/eth";
import { BlueCopperIcon } from "../icons/copper";
import { BluePoktIcon } from "../icons/pokt";
import { BlueCheckIcon } from "../icons/misc";
import { useGlobalContext } from "@/context/Globals";


export function ProgressModal(props: ModalProps) {
    const [step, setStep] = useState<number>(0)
    const { destination } = useGlobalContext()

    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktBlue">WRAPPING IN PROGRESS</ModalHeader>
                <ModalCloseButton color="poktBlue" />
                <ModalBody padding={0}>
                    <Text paddingX={8} mb={8}>
                        You can close this window or refresh this page without interrupting the process.
                    </Text>
                    <Flex justify="center">
                        <Flex direction="column" align="center">
                            {step > 0 ? <BlueCheckIcon/> : <>{destination === "pokt" ? <BlueEthIcon /> : <BluePoktIcon />}</>}
                            {step === 0 && <Divider borderColor="poktLime" orientation="vertical" height="50px" />}
                        </Flex>
                        <Divider borderColor="poktLime" height="25px" maxWidth="50px" />
                        <Flex direction="column" align="center">
                            {step > 1 ? <BlueCheckIcon/> : <BlueCopperIcon />}
                            {step === 1 && <Divider borderColor="poktLime" orientation="vertical" height="50px" />}
                        </Flex>
                        <Divider borderColor="poktLime" height="25px" maxWidth="50px" />
                        <Flex direction="column" align="center">
                            {step > 2 ? <BlueCheckIcon/> : <>{destination === "pokt" ? <BluePoktIcon /> : <BlueEthIcon />}</>}
                            {step >= 2 && <Divider borderColor="poktLime" orientation="vertical" height="50px" />}
                        </Flex>
                    </Flex>
                    <ProgressModalStatusDescription step={step} destination={destination} />
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}


export function ProgressModalStatusDescription({url, step, destination}: {url?: string, step: number, destination: string}) {
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
                        {step === 0 && "Sending your wPOKT to Copper"}
                        {step === 1 && "Bridging your order"}
                        {step === 2 && "Unlocking POKT"}
                        {step > 2 && "Transaction Complete!"}
                    </Text>
                    <Text>
                        {step === 0 && "It may take up to 32 blocks to arrive, which is about 6 minutes."}
                        {step === 1 && "Copper is reviewing and approving your order. This process should take about 5-10 minutes."}
                        {step === 2 && "Your POKT is on the way! It may take a few blocks to confirm. Pocket blocks complete every 15 minutes."}
                        {step > 2 && "Your wPOKT is in your destination wallet."}
                    </Text>
                </Box>
                <Link textDecor="underline" color="poktLime">
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
                        {step === 1 && "Copper is reviewing and approving your order. This process should take about 5-10 minutes."}
                        {step === 2 && "Your wPOKT is on the way! It may take up to 32 blocks to arrive, which is about 6 minutes."}
                        {step > 2 && "Your wPOKT is in your destination wallet."}
                    </Text>
                </Box>
                <Link textDecor="underline" color="poktLime">
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