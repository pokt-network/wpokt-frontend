import { Button, ButtonGroup, HStack, IconButton, useDisclosure, Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Flex,
    Text,
    Center,
    Link,
    VStack, } from "@chakra-ui/react";
import Image from "next/image";
import { BlueEthIcon, EthIcon } from "./icons/eth";
import { PoktIcon } from "./icons/pokt";
import logo from "../public/logo/full_white.png";
import { useGlobalContext } from "@/context/Globals";
import { CloseIcon, MenuIcon } from "./icons/misc";
import { useRef } from "react";


export function Header() {
    const { mobile, poktAddress, ethAddress } = useGlobalContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const width = 220

    return (
        <HStack justify="space-between" align="center" paddingX={10} paddingY={5}>
            <Image src={logo} alt="logo" width={122} height={36} />
            {mobile ? (
                <>
                <IconButton
                    aria-label="menu"
                    icon={<MenuIcon />}
                    background="none"
                    onClick={onOpen}
                />
                <Drawer
                    isOpen={isOpen}
                    placement='right'
                    onClose={onClose}
                >
                    <DrawerOverlay />
                    <DrawerContent bg="#242C34" color="white" maxW={width}>
                        <DrawerHeader textAlign="center" color="poktBlue">MENU</DrawerHeader>
                        <DrawerBody>
                            {ethAddress ? (
                                <VStack spacing={1}>
                                    <Flex align="center" justify="space-between" bg="darkBlue" width={width} padding={2}>
                                        <EthIcon fill="poktBlue" width="26px" height="26px" />
                                        <Text>{ethAddress.substring(0,4) + "..." + ethAddress.substring(ethAddress.length - 4)}</Text>
                                        <CloseIcon width="22.63px" height="22.63px" fill="none" />
                                    </Flex>
                                    <Link
                                        color="poktLime"
                                        textAlign="center"
                                        textDecor="underline"
                                    >
                                        Disconnect
                                    </Link>
                                </VStack>
                            ) : (
                                <VStack spacing={1}>
                                    <Text fontSize={14}>Connect Ethereum Wallet</Text>
                                    <Button
                                        color="darkBlue"
                                        background="poktLime"
                                        borderWidth={2}
                                        borderColor="poktLime"
                                        leftIcon={<EthIcon />}
                                    >
                                        Connect
                                    </Button>
                                </VStack>
                            )}

                            {poktAddress ? (
                                <VStack mt={10} spacing={1}>
                                    <Flex align="center" justify="space-between" bg="darkBlue" width={width} padding={2}>
                                        <PoktIcon fill="poktBlue" width="26px" height="26px" />
                                        <Text>{poktAddress.substring(0,4) + "..." + poktAddress.substring(poktAddress.length - 4)}</Text>
                                        <CloseIcon width="22.63px" height="22.63px" fill="none" />
                                    </Flex>
                                    <Link
                                        color="poktLime"
                                        textAlign="center"
                                        textDecoration="underline"
                                    >
                                        Disconnect
                                    </Link>
                                </VStack>
                            ) : (
                                <VStack spacing={1} mt={10}>
                                    <Text fontSize={14}>Connect SendWallet</Text>
                                    <Button
                                        color="darkBlue"
                                        background="poktLime"
                                        borderWidth={2}
                                        borderColor="poktLime"
                                        leftIcon={<PoktIcon />}
                                    >
                                        Connect
                                    </Button>
                                </VStack>
                            )}
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
                </>
            ) : (
                <ButtonGroup>
                    {ethAddress ? (
                        <Button
                            color="white"
                            background="darkOverlay"
                            leftIcon={<EthIcon fill="poktBlue" width="28px" height="28px" />}
                            borderWidth={2}
                            borderColor="darkOverlay"
                            padding={4}
                            paddingY={6}
                        >
                            {ethAddress.substring(0,4) + "..." + ethAddress.substring(ethAddress.length - 4)}
                        </Button>
                    ) : (
                        <Button
                            color="darkBlue"
                            background="poktLime"
                            borderWidth={2}
                            borderColor="poktLime"
                            leftIcon={<EthIcon />}
                            padding={4}
                            paddingY={6}
                        >
                            Connect
                        </Button>
                    )}
                    {poktAddress ? (
                        <Button
                            color="white"
                            background="darkOverlay"
                            leftIcon={<PoktIcon fill="poktBlue" width="28px" height="28px" />}
                            borderWidth={2}
                            borderColor="darkOverlay"
                            padding={4}
                            paddingY={6}
                        >
                            {poktAddress.substring(0,4) + "..." + poktAddress.substring(poktAddress.length - 4)}
                        </Button>
                    ) : (
                        <Button
                            color="darkBlue"
                            background="poktLime"
                            borderWidth={2}
                            borderColor="poktLime"
                            leftIcon={<PoktIcon />}
                            padding={4}
                            paddingY={6}
                        >
                            Connect
                        </Button>
                    )}
                </ButtonGroup>
            )}
        </HStack>
    )
}