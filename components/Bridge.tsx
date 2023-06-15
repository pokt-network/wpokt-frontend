import { Box, Button, Center, Container, Flex, HStack, Input, Link, Text, VStack, useDisclosure } from "@chakra-ui/react";
import { EthIcon } from "./icons/eth";
import { PoktIcon } from "./icons/pokt";
import { useState } from "react";
import { CustomAddressModal } from "./modal/CustomAddressModal";
import { ProgressModal } from "./modal/ProgressModal";
import { CloseIcon, InfoIcon } from "./icons/misc";
import { useGlobalContext } from "@/context/Globals";
import { TimeInfoModal } from "./modal/TimeInfoModal";

export function Bridge() {
    const [customAddress, setCustomAddress] = useState<string>("")
    const { poktAddress, ethAddress, destination, setDestination } = useGlobalContext()

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isProgressOpen, onOpen: onProgressOpen, onClose: onProgressClose } = useDisclosure()
    const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure()

    const poktBalance = 9876
    const wpoktBalance = 1234


    return (
        <VStack minWidth="580px">
            <Button bg="poktLime" onClick={() => setDestination(destination === "pokt" ? "eth" : "pokt")}>
                {destination === "eth" ? "POKT" : "wPOKT"} &rarr; {destination === "eth" ? "wPOKT" : "POKT"}
            </Button>
            {destination === "eth" ? (
                <Container bg="darkOverlay" paddingY={4}>
                    <Center>
                        <Box width={320}>
                            <HStack justify="space-between" mb={1}>
                                <Text>Amount to wrap</Text>
                                <Text>{poktAddress ? `${poktBalance} POKT in wallet` : 'No wallet connected'}</Text>
                            </HStack>
                            {poktAddress ? (
                                <Box>
                                    <PoktIcon fill="white" position="fixed" ml={280} mt="6px" width="26px" height="26px" />
                                    <Input
                                        type="number"
                                        borderRadius={0}
                                        placeholder="Enter POKT amount"
                                    />
                                </Box>
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
                    <Box>
                        <Center mt={6}>
                            <Box width={320}>
                                <Text mb={1} textAlign="left">Destination Wallet</Text>
                            </Box>
                        </Center>
                        {ethAddress ? (
                            <Flex align="center" justify="space-between" bg="darkBlue" paddingX={4} paddingY={2}>
                                <EthIcon fill="poktBlue" width="26px" height="26px" />
                                <Text>{ethAddress}</Text>
                                <CloseIcon width="22.63px" height="22.63px" fill="poktLime" />
                            </Flex>
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
                        <CustomAddressModal isOpen={isOpen} onClose={onClose}><></></CustomAddressModal>
                    </Box>
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
                                <Flex align="center" gap={2}>
                                    <Text>~30 Minutes</Text>
                                    <InfoIcon _hover={{ cursor: "pointer" }} onClick={onInfoOpen} />
                                </Flex>
                            </Box>
                        </VStack>
                    </Center>
                    <Center>
                        <Button bg="poktLime" onClick={onProgressOpen}>
                            Wrap
                        </Button>
                    </Center>
                    <ProgressModal isOpen={isProgressOpen} onClose={onProgressClose}><></></ProgressModal>
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
                                <Box>
                                    <EthIcon fill="white" position="fixed" ml={280} mt="6px" width="26px" height="26px" />
                                    <Input
                                        type="number"
                                        borderRadius={0}
                                        placeholder="Enter wPOKT amount"
                                    />
                                </Box>
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
                        </Box>
                    </Center>
                    {poktAddress ? (
                        <Flex align="center" justify="space-between" bg="darkBlue" paddingX={4} paddingY={2}>
                            <PoktIcon fill="poktBlue" width="26px" height="26px" />
                            <Text>{poktAddress}</Text>
                            <CloseIcon width="22.63px" height="22.63px" fill="poktLime" />
                        </Flex>
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
                    <CustomAddressModal isOpen={isOpen} onClose={onClose}><></></CustomAddressModal>
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
                                <Flex align="center" gap={2}>
                                    <Text>~30 Minutes</Text>
                                    <InfoIcon _hover={{ cursor: "pointer" }} onClick={onInfoOpen} />
                                </Flex>
                            </Box>
                        </VStack>
                    </Center>
                    <Center>
                        <Button bg="poktLime" onClick={onProgressOpen}>
                            Unwrap
                        </Button>
                    </Center>
                    <ProgressModal isOpen={isProgressOpen} onClose={onProgressClose}><></></ProgressModal>
                </Container>
            )}
            <TimeInfoModal isOpen={isInfoOpen} onClose={onInfoClose}><></></TimeInfoModal>
        </VStack>
    )
}