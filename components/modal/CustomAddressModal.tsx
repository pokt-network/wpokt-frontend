import { Box, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useDisclosure, ModalProps, Input, Center, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ErrorIcon } from "../icons/misc";
import { useGlobalContext } from "@/context/Globals";

export interface CustomAddressModalProps extends ModalProps {
    onConfirm?: (address: string) => void
}

export function CustomAddressModal(props: CustomAddressModalProps) {
    const [isInvalidAddress, setIsInvalidAddress] = useState<boolean>(false)
    const {
        destination,
        customEthAddress,
        customPoktAddress,
        setCustomEthAddress,
        setCustomPoktAddress
    } = useGlobalContext()

    useEffect(() => {
        if (destination === "pokt") {
            if (customPoktAddress === "") return setIsInvalidAddress(false)
            setIsInvalidAddress(!validateAddress(customPoktAddress))
        } else {
            if (customEthAddress === "") return setIsInvalidAddress(false)
            setIsInvalidAddress(!validateAddress(customEthAddress))
        }
    }, [customEthAddress, customPoktAddress])

    function validateAddress(address: string): boolean {
        const characters = "0123456789abcdefABCDEF".split("")
        const invalidChars = address.split("").filter(c => !characters.includes(c)).length
        if (address.length === 42 && address.startsWith("0x") && !invalidChars) {
            return true
        }
        return false
    }
    
    return (
        <Modal {...props} size="md" isCentered>
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
                                    <Text color="red.500">Valid {destination === "pokt" ? "POKT" : "ETH"} address required</Text>
                                </Flex>
                            )}
                        </Flex>
                        <Input
                            borderRadius={0}
                            placeholder="Enter address"
                            value={destination === "pokt" ? customPoktAddress : customEthAddress}
                            onChange={(e) => {
                                if (destination === "pokt") {
                                    setCustomPoktAddress(e.target.value)
                                } else {
                                    setCustomEthAddress(e.target.value)
                                }
                            }}
                        />
                    </Box>
                    <Center mt={4} mb={2}>
                        <Button bg="poktLime" onClick={() => props.onConfirm}>Confirm</Button>
                    </Center>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}