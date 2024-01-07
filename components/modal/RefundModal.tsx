import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Link, ModalProps } from "@chakra-ui/react";
import { BluePoktIcon } from "../icons/pokt";
import { useGlobalContext } from "@/context/Globals";
import { POKT_CHAIN_ID } from "@/utils/constants";

interface RefundModalProps extends ModalProps {
    refundTxHash: string
}

export function RefundModal(props: RefundModalProps) {
    const { destination } = useGlobalContext()
    const poktTxUrl = POKT_CHAIN_ID !== "mainnet" ? `https://poktscan.com/testnet/tx/${props.refundTxHash}` : `https://poktscan.com/tx/${props.refundTxHash}`

    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktLime">BRIDGE REFUNDED</ModalHeader>
                <ModalCloseButton color="poktLime" _hover={{ color: "hover.poktLime" }} />
                <ModalBody padding={0}>
                    <Flex
                        direction="column"
                        // bg="darkOverlay"
                        borderTopColor={"poktLime"}
                        borderTopWidth={1}
                        borderBottomColor={"poktLime"}
                        borderBottomWidth={1}
                        justify="center"
                        align="center"
                        padding={4}
                        paddingX={6}
                        gap={2}
                        mb={10}
                    >
                        <BluePoktIcon />
                        <Text color="poktLime" fontSize={18} fontWeight={"bold"}>Your tokens have been refunded to your wallet.</Text>
                        <Text>
                            There was an error during the bridging process. 
                            Any tokens you have attempted to bridge have been returned to your wallet. 
                            Try waiting a few minutes before bridging again.
                        </Text>
                        <Link textDecor="underline" color="poktLime" mt={3} href={poktTxUrl} isExternal>
                            {destination === "pokt" ? "View this transaction on Etherscan" : "View this transaction on PoktScan"}
                        </Link>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
