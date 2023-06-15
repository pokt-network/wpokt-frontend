import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Link, ModalProps } from "@chakra-ui/react";
import { BluePoktIcon } from "../icons/pokt";
import { useGlobalContext } from "@/context/Globals";


export function RefundModal(props: ModalProps) {
    const { destination } = useGlobalContext()

    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktBlue">BRIDGE REFUNDED</ModalHeader>
                <ModalCloseButton color="poktBlue" />
                <ModalBody padding={0}>
                    <Flex
                        direction="column"
                        bg="darkOverlay"
                        justify="center"
                        align="center"
                        padding={4}
                        paddingX={8}
                        gap={2}
                        mb={10}
                    >
                        <BluePoktIcon />
                        <Text color="poktBlue" fontSize={16}>Your tokens have been refunded to your wallet.</Text>
                        <Text>
                            There was an error during the bridging process. 
                            Any tokens you have attempted to bridge have been returned to your wallet. 
                            Try waiting a few minutes before bridging again.
                        </Text>
                        <Link textDecor="underline" color="poktLime" mt={3}>
                            {destination === "pokt" ? "View this transaction on Etherscan" : "View this transaction on PoktScan"}
                        </Link>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
