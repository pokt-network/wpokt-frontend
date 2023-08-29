import { Button, ButtonGroup, HStack, IconButton, useDisclosure, Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    Flex,
    Text,
    Link,
    VStack, } from "@chakra-ui/react";
import Image from "next/image";
import { BlueEthIcon, EthIcon } from "./icons/eth";
import { PoktIcon } from "./icons/pokt";
import logo from "../public/logo/full_white.png";
import { useGlobalContext } from "@/context/Globals";
import { CloseIcon, MenuIcon } from "./icons/misc";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";


export function Header() {
    const { mobile, poktAddress, ethAddress, setPoktAddress, connectSendWallet } = useGlobalContext()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { openConnectModal } = useConnectModal()
    const { address } = useAccount()
    const { disconnect } = useDisconnect()
    const width = 220

    return (
        <HStack justify="space-between" align="center" paddingX={10} paddingY={5}>
            <Link href="https://pokt.network" isExternal>
                <Image src={logo} alt="logo" width={122} height={36} />
            </Link>
            {mobile ? (
                <>
                <IconButton
                    aria-label="menu"
                    icon={<MenuIcon />}
                    background="none"
                    _hover={{ bg: "none", fill: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.1)" }}
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
                            {address ? (
                                <VStack spacing={1}>
                                    <Flex align="center" justify="space-between" bg="darkBlue" width={width} padding={2}>
                                        <EthIcon fill="poktBlue" width="26px" height="26px" />
                                        <Text>{address.substring(0,4) + "..." + address.substring(address.length - 4)}</Text>
                                        <CloseIcon width="22.63px" height="22.63px" fill="none" />
                                    </Flex>
                                    <Link
                                        color="poktLime"
                                        textAlign="center"
                                        textDecor="underline"
                                        onClick={() => disconnect()}
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
                                        onClick={openConnectModal}
                                        _hover={{ bg: "hover.poktLime" }}
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
                                        onClick={() => setPoktAddress("")}
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
                                        onClick={connectSendWallet}
                                        _hover={{ bg: "hover.poktLime" }}
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
                    {address ? (
                        <Button
                            color="white"
                            background="darkOverlay"
                            leftIcon={<EthIcon fill="poktBlue" width="24px" height="24px" />}
                            borderWidth={2}
                            borderColor="darkOverlay"
                            _hover={{ bg: "hover.darkBlue" }}
                            padding={3}
                            paddingY={5}
                            onClick={() => disconnect()}
                        >
                            {address.substring(0,4) + "..." + address.substring(address.length - 4)}
                        </Button>
                    ) : (
                        <Button
                            color="darkBlue"
                            background="poktLime"
                            borderWidth={2}
                            borderColor="poktLime"
                            _hover={{ bg: "hover.poktLime" }}
                            leftIcon={<EthIcon />}
                            padding={4}
                            paddingY={5}
                            onClick={openConnectModal}
                        >
                            Connect
                        </Button>
                    )}
                    {poktAddress ? (
                        <Button
                            color="white"
                            background="darkOverlay"
                            leftIcon={<PoktIcon fill="poktBlue" width="24px" height="24px" />}
                            borderWidth={2}
                            borderColor="darkOverlay"
                            _hover={{ bg: "hover.darkBlue" }}
                            padding={4}
                            paddingY={5}
                            onClick={() => setPoktAddress("")}
                        >
                            {poktAddress.substring(0,4) + "..." + poktAddress.substring(poktAddress.length - 4)}
                        </Button>
                    ) : (
                        <Button
                            color="darkBlue"
                            background="poktLime"
                            borderWidth={2}
                            borderColor="poktLime"
                            _hover={{ bg: "hover.poktLime" }}
                            leftIcon={<PoktIcon />}
                            padding={4}
                            paddingY={5}
                            onClick={connectSendWallet}
                        >
                            Connect
                        </Button>
                    )}
                </ButtonGroup>
            )}
        </HStack>
    )
}