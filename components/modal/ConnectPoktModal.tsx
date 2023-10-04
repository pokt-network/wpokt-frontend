import { useGlobalContext } from "@/context/Globals";
import { useTransport } from "@/context/Transport";
import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, ModalProps } from "@chakra-ui/react";
import { useEffect } from "react";


export function ConnectPoktModal(props: ModalProps) {
    const { connectSendWallet, poktAddress } = useGlobalContext()
    const { connectLedgerDevice } = useTransport()

    const poktWalletOptions = [
        {
            name: "SendWallet / NodeWallet",
            onConnect: () => {
                connectSendWallet()
            }
        },
        {
            name: "Ledger",
            onConnect: async () => {
                await connectLedgerDevice()
            }
        },
    ]

    useEffect(() => {
        if (poktAddress) props.onClose()
    }, [poktAddress])

    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktBlue">Connect a Wallet</ModalHeader>
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
                        {poktWalletOptions.map((wallet, i) => (
                            <Flex
                                key={i}
                                direction="row"
                                justify="center"
                                align="center"
                                bg="darkBlue"
                                color="poktLime"
                                width="100%"
                                padding={2}
                                borderRadius={10}
                                cursor="pointer"
                                onClick={wallet.onConnect}
                                _hover={{ bg: "poktLime", color: "darkBlue" }}
                            >
                                <Text fontSize={16}>{wallet.name}</Text>
                            </Flex>
                        ))}
                        
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
