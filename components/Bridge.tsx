import { Box, Button, Center, Container, Flex, HStack, Text, VStack } from "@chakra-ui/react";

// bridgePath: 0 = POKT -> wPOKT, 1 = wPOKT -> POKT
export function Bridge({ poktAddress, ethAddress, bridgePath }: {poktAddress?: string, ethAddress?: string, bridgePath?: number}) {
    const poktBalance = 9876
    const wpoktBalance = 1234
    return (
        <>
        {bridgePath !== 1 ? (
            <VStack>
                <Button bg="poktLime">
                    POKT -&gt; wPOKT
                </Button>
                <Container bg="darkOverlay">
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
                                    >
                                        Connect Wallet
                                    </Button>
                                </Center>
                            )}
                        </Box>
                    </Center>
                </Container>
            </VStack>
        ) : (
            <VStack>
                <Button bg="poktLime">
                    POKT -&gt; wPOKT
                </Button>
                <Container bg="darkOverlay">
                    <Box>
                        <HStack justify="space-between">
                            <Text>Amount to wrap</Text>
                            <Text>{poktAddress ? `${poktBalance} POKT in wallet` : 'No wallet connected'}</Text>
                        </HStack>
                        {}
                    </Box>
                </Container>
            </VStack>
        )}
        </>
    )
}