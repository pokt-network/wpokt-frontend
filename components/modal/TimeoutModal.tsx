import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Link, ModalProps } from "@chakra-ui/react";
import { BluePoktIcon } from "../icons/pokt";
import { useGlobalContext } from "@/context/Globals";


export function TimeoutModal(props: ModalProps) {
    const { destination } = useGlobalContext()

    return (
        <Modal {...props} size="sm" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktBlue">BRIDGE IN PROGRESS</ModalHeader>
                <ModalCloseButton color="poktBlue" />
                <ModalBody padding={0}>
                    <Text paddingX={8} mb={4}>
                        You can close this window or refresh this page without interrupting the process.
                    </Text>
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
                        <Text color="poktBlue" fontSize={16}>Your transaction is taking longer than expected</Text>
                        <Text>
                            You do not have to do anything. We are still attempting to complete your bridge request. 
                            You can keep this window open and check back later. 
                            If there has been a change, this page will update.
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
