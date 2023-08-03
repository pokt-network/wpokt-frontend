import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Link, ModalProps, Button } from "@chakra-ui/react";
import { BluePoktIcon } from "../icons/pokt";
import { useGlobalContext } from "@/context/Globals";
import { useAccount, useBalance, useContractWrite, usePrepareContractWrite } from "wagmi";
import { parseEther } from "viem";
import { MINT_CONTROLLER_ADDRESS } from "@/utils/constants";
import { MINT_CONTROLLER_ABI } from "@/utils/abis";
import { Mint } from "@/types";

export interface MintModalProps extends ModalProps {
    mintInfo?: Mint
}

export function MintModal(props: MintModalProps) {
    const { address } = useAccount()
    const { data: ethBalance } = useBalance({ address })
    const { config } = usePrepareContractWrite({
        address: MINT_CONTROLLER_ADDRESS,
        abi: MINT_CONTROLLER_ABI,
        functionName: 'mintwrappedPocket',
        args: [props.mintInfo?.data, props.mintInfo?.signatures]
    })
    const mintFunc = useContractWrite(config)

    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktBlue">wPOKT READY TO MINT</ModalHeader>
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
                            {
                                ethBalance?.value && ethBalance?.value > parseEther('0.01') ? 
                                    "Authorize the wPOKT mint to proceed" : 
                                    "You don’t have enough ETH in your wallet"
                            }
                        </Text>
                        <Text>
                            {
                                ethBalance?.value && ethBalance?.value > parseEther('0.01') ? 
                                    "To complete the bridge, authorize the minting of your wPOKT using the button below. The wPOKT will then be sent to your wallet." : 
                                    "To complete this bridge, you need to pay the gas cost for this transaction. You should need about XXX ETH to pay for gas right now, but that can change as the market gets more or less busy."
                            }
                        </Text>
                        <Button
                            bg="poktLime"
                            mt={3}
                            onClick={mintFunc.write}
                        >
                            Mint wPOKT
                        </Button>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
