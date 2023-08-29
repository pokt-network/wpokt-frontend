import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, ModalProps, Box } from "@chakra-ui/react";


export function GasInfoModal(props: ModalProps) {
    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktBlue">Why does this cost ETH and POKT?</ModalHeader>
                <ModalCloseButton color="poktBlue" />
                <ModalBody padding={0}>
                    <Flex
                        direction="column"
                        bg="darkOverlay"
                        justify="center"
                        align="center"
                        padding={4}
                        paddingX={10}
                        gap={8}
                        mb={10}
                    >
                        <Box>
                            <Text color="poktBlue" fontSize={16} textAlign="center">wPOKT is minted and burned.</Text>
                            <Text>
                                To maintain 1:1 value between tokens, POKT is stored and released from our bridge vault, but wPOKT is minted and burned.
                            </Text>
                        </Box>
                        <Box>
                            <Text color="poktBlue" fontSize={16} textAlign="center">Minting wPOKT costs gas.</Text>
                            <Text>
                                While we handle all burn orders, you need to authorize and pay for the minting of wPOKT.
                            </Text>
                        </Box>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
