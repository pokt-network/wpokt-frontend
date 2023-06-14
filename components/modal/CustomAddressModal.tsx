import { Box, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useDisclosure, ModalProps, Input, Center, Button } from "@chakra-ui/react";
import { useState } from "react";
import { ErrorIcon } from "../icons/misc";

export interface CustomAddressModalProps extends ModalProps {
    onConfirm?: (address: string) => void
    destination: number // 0 = wPOKT, 1 = POKT
}

export function CustomAddressModal(props: CustomAddressModalProps) {
    const [isInvalidAddress, setIsInvalidAddress] = useState<boolean>(true)
    
    return (
        <Modal {...props} size="sm" isCentered>
            <ModalOverlay />
            <ModalContent bg="darkBlue">
                <ModalHeader textAlign="center" color="poktBlue">Custom Destination Address</ModalHeader>
                <ModalCloseButton color="poktBlue" />
                <ModalBody>
                    <Text>
                        Instead of connecting a wallet, you can manually input an address here. 
                        Tokens will be bridged directly to this address. Double check your address! 
                        Tokens sent to the wrong address cannot be recovered.
                    </Text>
                    <Box mt={6}>
                        <Flex justify={"space-between"} mb={1}>
                            <Text>Custom address</Text>
                            {isInvalidAddress && (
                                <Flex align="center" gap={1}>
                                    <ErrorIcon />
                                    <Text color="red.500">Valid {props.destination === 1 ? "POKT" : "ETH"} address required</Text>
                                </Flex>
                            )}
                        </Flex>
                        <Input />
                    </Box>
                    <Center mt={4} mb={2}>
                        <Button bg="poktLime" onClick={() => props.onConfirm}>Confirm</Button>
                    </Center>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}