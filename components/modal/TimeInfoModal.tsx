import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, ModalProps, Box } from "@chakra-ui/react";


export function TimeInfoModal(props: ModalProps) {
    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktBlue">What determines bridge time?</ModalHeader>
                <ModalCloseButton color="poktBlue" />
                <ModalBody padding={0}>
                    <Flex
                        direction="column"
                        bg="darkOverlay"
                        justify="center"
                        align="center"
                        padding={4}
                        paddingX={8}
                        gap={4}
                        mb={10}
                    >
                        <Box textAlign="center">
                            <Text color="poktBlue" fontSize={16}>Pocket blocks complete every 15 minutes.</Text>
                            <Text>
                                Depending on when you sign a bridge transaction, it may take up to 15 minutes to appear on-chain.
                            </Text>
                        </Box>
                        <Box textAlign="center">
                            <Text color="poktBlue" fontSize={16}>The bridge verifies your request between chains.</Text>
                            <Text>
                                It takes a few minutes to reach consensus and start a transaction on-chain.
                            </Text>
                        </Box>
                        <Box textAlign="center">
                            <Text color="poktBlue" fontSize={16}>Ethereum blocks complete every 12 seconds.</Text>
                            <Text>
                                For large sums of money, it is common to wait for up to 32 blocks to resolve before proceeding with a transaction.
                            </Text>
                        </Box>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
