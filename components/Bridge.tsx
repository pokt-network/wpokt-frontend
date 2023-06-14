import { Box, Button, Center, Container, Flex, HStack, Link, Text, VStack, useDisclosure } from "@chakra-ui/react";
import { EthIcon } from "./icons/eth";
import { PoktIcon } from "./icons/pokt";
import { useState } from "react";
import { CustomAddressModal } from "./modal/CustomAddressModal";
import { ProgressModal } from "./modal/ProgressModal";

export function Bridge({ poktAddress, ethAddress }: {poktAddress?: string, ethAddress?: string}) {
    // bridgePath: 0 = POKT -> wPOKT, 1 = wPOKT -> POKT
    const [bridgePath, setBridgePath] = useState<number>(0)
    const [customAddress, setCustomAddress] = useState<string>("")
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isProgressOpen, onOpen: onProgressOpen, onClose: onProgressClose } = useDisclosure()
    const poktBalance = 9876
    const wpoktBalance = 1234


    return (
        <VStack>
            <Button bg="poktLime" onClick={() => setBridgePath(bridgePath === 1 ? 0 : 1)}>
                {bridgePath === 1 ? "wPOKT -> POKT" : "POKT -> wPOKT"}
            </Button>
            {bridgePath !== 1 ? (
                <Container bg="darkOverlay" paddingY={4}>
                    <Center>
                        <Box width={320}>
                            <HStack justify="space-between" mb={1}>
                                <Text>Amount to wrap</Text>
                                <Text>{poktAddress ? `${poktBalance} POKT in wallet` : 'No wallet connected'}</Text>
                            </HStack>
                            {poktAddress ? (
                                <Flex></Flex>
                            ) : (
                                <Center>
                                    <Button
                                        variant="outline"
                                        borderColor="poktLime"
                                        bg="transparent"
                                        color="white"
                                        leftIcon={<PoktIcon fill={"white"}/>}
                                    >
                                        Connect SendWallet
                                    </Button>
                                </Center>
                            )}
                        </Box>
                    </Center>
                    <Center mt={6}>
                        <Box width={320}>
                            <Text mb={1}>Destination Wallet</Text>
                            {ethAddress ? (
                                <Flex></Flex>
                            ) : (
                                <Center>
                                    <Button
                                        variant="outline"
                                        borderColor="poktLime"
                                        bg="transparent"
                                        color="white"
                                        leftIcon={<EthIcon fill={"white"}/>}
                                    >
                                        Connect Wallet
                                    </Button>
                                </Center>
                            )}
                            <Center mt={1}>
                                <Link
                                    color="poktLime"
                                    textAlign="center"
                                    textDecoration="underline"
                                    onClick={onOpen}
                                >
                                    Enter custom address
                                </Link>
                            </Center>
                            <CustomAddressModal isOpen={isOpen} onClose={onClose} destination={bridgePath}><></></CustomAddressModal>
                        </Box>
                    </Center>
                    <Center my={6}>
                        <VStack width={320} spacing={4} align="flex-start">
                            <Box>
                                <Text>Estimated Gas Cost:</Text>
                                <Text>{0.01} POKT</Text>
                            </Box>
                            <Box>
                                <Text>Estimated wPOKT Received:</Text>
                                <Text>---- wPOKT</Text>
                            </Box>
                            <Box>
                                <Text>Estimated time for bridge:</Text>
                                <Text>~30 Minutes</Text>
                            </Box>
                        </VStack>
                    </Center>
                    <Center>
                        <Button bg="poktLime" onClick={onProgressOpen}>
                            Wrap
                        </Button>
                    </Center>
                    <ProgressModal isOpen={isProgressOpen} onClose={onProgressClose} destination={bridgePath}><></></ProgressModal>
                </Container>
            ) : (
                <Container bg="darkOverlay" paddingY={4}>
                    <Center>
                        <Box width={320}>
                            <HStack justify="space-between" mb={1}>
                                <Text>Amount to unwrap</Text>
                                <Text>{poktAddress ? `${wpoktBalance} wPOKT in wallet` : 'No wallet connected'}</Text>
                            </HStack>
                            {ethAddress ? (
                                <Flex></Flex>
                                ) : (
                                    <Center>
                                    <Button
                                        variant="outline"
                                        borderColor="poktLime"
                                        bg="transparent"
                                        color="white"
                                        leftIcon={<EthIcon fill={"white"}/>}
                                        >
                                        Connect Wallet
                                    </Button>
                                </Center>
                            )}
                        </Box>
                    </Center>
                    <Center mt={6}>
                        <Box width={320}>
                            <Text mb={1}>Destination Wallet</Text>
                            {poktAddress ? (
                                <Flex></Flex>
                                ) : (
                                    <Center>
                                    <Button
                                        variant="outline"
                                        borderColor="poktLime"
                                        bg="transparent"
                                        color="white"
                                        leftIcon={<PoktIcon fill={"white"}/>}
                                        >
                                        Connect SendWallet
                                    </Button>
                                </Center>
                            )}
                            <Center mt={1}>
                                <Link
                                    color="poktLime"
                                    textAlign="center"
                                    textDecoration="underline"
                                    onClick={onOpen}
                                >
                                    Enter custom address
                                </Link>
                            </Center>
                            <CustomAddressModal isOpen={isOpen} onClose={onClose} destination={bridgePath}><></></CustomAddressModal>
                        </Box>
                    </Center>
                    <Center my={6}>
                        <VStack width={320} spacing={4} align="flex-start">
                            <Box>
                                <Text>Estimated Gas Cost:</Text>
                                <Text>{0.001} Gwei</Text>
                            </Box>
                            <Box>
                                <Text>Estimated POKT Received:</Text>
                                <Text>---- POKT</Text>
                            </Box>
                            <Box>
                                <Text>Estimated time for bridge:</Text>
                                <Text>~30 Minutes</Text>
                            </Box>
                        </VStack>
                    </Center>
                    <Center>
                        <Button bg="poktLime" onClick={onProgressOpen}>
                            Unwrap
                        </Button>
                    </Center>
                    <ProgressModal isOpen={isProgressOpen} onClose={onProgressClose} destination={bridgePath}><></></ProgressModal>
                </Container>
            )}
        </VStack>
    )
}