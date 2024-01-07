import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Link, ModalProps } from "@chakra-ui/react";
import { BluePoktIcon } from "../icons/pokt";
import { useGlobalContext } from "@/context/Globals";
import { CHAIN, ETH_CHAIN_ID, POKT_CHAIN_ID } from "@/utils/constants";


export function TimeoutModal(props: ModalProps) {
    const { destination, poktTxHash, ethTxHash } = useGlobalContext()
    const ethTxUrl = Number(ETH_CHAIN_ID) !== 1 ? `https://${CHAIN.name}.etherscan.io/tx/${ethTxHash}` : `https://etherscan.io/tx/${ethTxHash}`
    const poktTxUrl = POKT_CHAIN_ID !== "mainnet" ? `https://poktscan.com/testnet/tx/${poktTxHash}` : `https://poktscan.com/tx/${poktTxHash}`
    const txUrl = destination === "pokt" ? (poktTxHash ? poktTxUrl : ethTxUrl) : (ethTxHash ? ethTxUrl : poktTxUrl)

    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktLime">BRIDGE IN PROGRESS</ModalHeader>
                <ModalCloseButton color="poktLime" _hover={{ color: "hover.poktLime" }} />
                <ModalBody padding={0}>
                    <Text paddingX={8} mb={4}>
                        You can close this window or refresh this page without interrupting the process.
                    </Text>
                    <Flex
                        direction="column"
                        // bg="darkOverlay"
                        justify="center"
                        align="center"
                        padding={4}
                        paddingX={6}
                        gap={2}
                        mb={10}
                    >
                        <BluePoktIcon />
                        <Text color="poktLime" fontSize={18} fontWeight={"bold"}>Your transaction is taking longer than expected</Text>
                        <Text>
                            You do not have to do anything. We are still attempting to complete your bridge request. 
                            You can keep this window open and check back later. 
                            If there has been a change, this page will update.
                        </Text>
                        <Link 
                            textDecor="underline"
                            color="poktLime"
                            mt={3}
                            href={txUrl}
                            isExternal
                        >
                            {destination === "pokt" ? (poktTxHash ? "View this transaction on PoktScan" : "View this transaction on Etherscan") : (ethTxHash ? "View this transaction on Etherscan" : "View this transaction on PoktScan")}
                        </Link>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
