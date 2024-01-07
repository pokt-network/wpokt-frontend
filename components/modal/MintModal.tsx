import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Link, ModalProps, Button, useStatStyles } from "@chakra-ui/react";
import { BluePoktIcon } from "../icons/pokt";
import { useGlobalContext } from "@/context/Globals";
import { useAccount, useBalance, useContractWrite, useFeeData, usePrepareContractWrite } from "wagmi";
import { createPublicClient, formatEther, getAddress, http, parseEther } from "viem";
import { CHAIN, MINT_CONTROLLER_ADDRESS } from "@/utils/constants";
import { MINT_CONTROLLER_ABI } from "@/utils/abis";
import { Mint } from "@/types";
import { useEffect, useMemo, useState } from "react";

export interface MintModalProps extends ModalProps {
    mintInfo?: Mint
}

export function MintModal(props: MintModalProps) {
    const [gasCost, setGasCost] = useState<string>("")
    const { setMintTxHash } = useGlobalContext()
    const { address } = useAccount()
    const { data: ethBalance } = useBalance({ address })
    const { config } = usePrepareContractWrite({
        address: MINT_CONTROLLER_ADDRESS,
        abi: MINT_CONTROLLER_ABI,
        functionName: 'mintWrappedPocket',
        args: [props.mintInfo?.data, props.mintInfo?.signatures]
    })
    const mintFunc = useContractWrite(config)

    const { data: feeData } = useFeeData({ chainId: CHAIN.id })

    const gas = useMemo(async () => {
        let g = BigInt(0)
        try {
            const pubClient = createPublicClient({
                chain: CHAIN,
                transport: http()
            })
            g = await pubClient.estimateContractGas({
                address: MINT_CONTROLLER_ADDRESS,
                abi: MINT_CONTROLLER_ABI,
                functionName: 'mintWrappedPocket',
                args: [props.mintInfo?.data, props.mintInfo?.signatures],
                account: getAddress(address ?? '')
            })
        } catch (error) {
            console.error(error)
            g = BigInt(289000) // Default gas
        }
        return g
    }, [props.mintInfo, mintFunc.writeAsync])

    useEffect(() => {
        gas
            .then(g => setGasCost(g > BigInt(0) ? formatEther(g * (feeData?.maxFeePerGas ?? BigInt(0))) : ""))
            .catch(error => console.error(error))
    }, [gas, feeData])

    async function mintWPokt() {
        try {
            if (!mintFunc.writeAsync) throw new Error("No writeAsync function")
            const tx = await mintFunc.writeAsync()
            setMintTxHash(tx.hash)
            props.onClose()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktLime">wPOKT READY TO MINT</ModalHeader>
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
                        <Text color="poktLime" fontSize={18} fontWeight={"bold"}>
                            {
                                ethBalance?.value && ethBalance?.value > parseEther(gasCost) ? 
                                    "Authorize the wPOKT mint to proceed" : 
                                    "You don’t have enough ETH in your wallet"
                            }
                        </Text>
                        <Text>
                            {
                                ethBalance?.value && ethBalance?.value > parseEther(gasCost) ? 
                                    "To complete the bridge, authorize the minting of your wPOKT using the button below. The wPOKT will then be sent to your wallet." : 
                                    `To complete this bridge, you need to pay the gas cost for this transaction. You should need about ${gasCost} ETH to pay for gas right now, but that can change as the market gets more or less busy.`
                            }
                        </Text>
                        <Button
                            bg="poktLime"
                            color="darkBlue"
                            mt={3}
                            onClick={mintWPokt}
                            isLoading={mintFunc.isLoading}
                            _hover={{ bg: "hover.poktLime" }}
                        >
                            Mint wPOKT
                        </Button>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
