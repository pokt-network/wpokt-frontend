import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, ModalProps, Button, Box } from "@chakra-ui/react";
import { BluePoktIcon } from "../icons/pokt";
import { useAccount, useBalance } from "wagmi";

export interface ResumeWrapModalProps extends ModalProps {
    timestamp: string
    amount: string
}

export function ResumeWrapModal({ timestamp, amount, ...props }: ResumeWrapModalProps) {
    const { address } = useAccount()

    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktBlue">YOU HAVE A BRIDGE IN PROGRESS</ModalHeader>
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
                        <Text color="poktBlue" fontSize={16}>
                            Mint your wPOKT to complete your bridge.
                        </Text>
                        <Box>
                            <Text>
                                On {timestamp}, you began a bridge to:
                            </Text>
                            <Text textAlign='center'>{address}</Text>
                            <Text>
                                for {amount} POKT. You still need to complete the bridge by minting your wPOKT.
                            </Text>
                        </Box>
                        <Button
                            bg="poktLime"
                            mt={3}
                        >
                            Complete Bridge
                        </Button>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
