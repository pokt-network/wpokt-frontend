import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, ModalProps, Button, Box } from "@chakra-ui/react";
import { BluePoktIcon } from "../icons/pokt";
import { useAccount, useBalance, useContractWrite, usePrepareContractWrite } from "wagmi";
import { MINT_CONTROLLER_ADDRESS } from "@/utils/constants";
import { MINT_CONTROLLER_ABI } from "@/utils/abis";
import { Mint } from "@/types";
import { formatUnits, parseUnits } from "viem";
import { useGlobalContext } from "@/context/Globals";

export interface ResumeWrapModalProps extends ModalProps {
    mintInfo?: Mint
    openProgressModal: () => void
}

export function ResumeWrapModal({ mintInfo, openProgressModal, ...props }: ResumeWrapModalProps) {
    const { setMintTxHash, setCurrentMint, allPendingMints, setAllPendingMints } = useGlobalContext()
    const { config, refetch } = usePrepareContractWrite({
        address: MINT_CONTROLLER_ADDRESS,
        abi: MINT_CONTROLLER_ABI,
        functionName: 'mintWrappedPocket',
        args: [mintInfo?.data, mintInfo?.signatures]
    })
    const mintFunc = useContractWrite(config)

    async function mintWPokt() {
        try {
            if (!mintFunc.writeAsync) {
                const refetched = await refetch()
                if (refetched.isError) throw new Error("No writeAsync function and error refetching")
            }
            if (!mintFunc.writeAsync) throw new Error("No writeAsync function")
            const tx = await mintFunc.writeAsync()
            setMintTxHash(tx.hash)
            setCurrentMint(mintInfo)
            openProgressModal()
            mintFunc.reset()
            const remainingMintsPending = allPendingMints.slice(0, -1)
            setAllPendingMints(remainingMintsPending)
            props.onClose()
        } catch (error) {
            console.error(error)
        }
    }

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
                                On {mintInfo?.created_at.toLocaleString()}, you began a bridge to:
                            </Text>
                            <Text textAlign='center'>{mintInfo?.recipient_address}</Text>
                            <Text>
                                for {formatUnits(BigInt(mintInfo?.amount||0), 6)} POKT. You still need to complete the bridge by minting your wPOKT.
                            </Text>
                        </Box>
                        <Button
                            bg="poktLime"
                            color="darkBlue"
                            mt={3}
                            onClick={mintWPokt}
                            isLoading={mintFunc.isLoading}
                        >
                            Complete Bridge
                        </Button>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
