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
import { EthIcon } from "./icons/eth";
import { PoktIcon } from "./icons/pokt";
import logo from "../public/logo/full_white.png";
import { useGlobalContext } from "@/context/Globals";
import { CloseIcon, MenuIcon } from "./icons/misc";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useTransport } from "@/context/Transport";
import { ConnectPoktModal } from "./modal/ConnectPoktModal";


export function Header() {
    const { mobile, poktAddress, ethAddress, setPoktAddress, connectSendWallet } = useGlobalContext()
    const { connectLedgerDevice, isUsingHardwareWallet, removeTransport } = useTransport()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isConnectPoktModalOpen, onOpen: onConnectPoktModalOpen, onClose: onConnectPoktModalClose } = useDisclosure()
    const { openConnectModal } = useConnectModal()
    const { address } = useAccount()
    const { disconnect } = useDisconnect()
    const width = 220

    async function disconnectPokt() {
        if (isUsingHardwareWallet) {
            return removeTransport()
        }
        return setPoktAddress("")
    }

    return (
        <>
        <HStack justify="space-between" align="center" paddingX={10} paddingY={5}>
            <Flex gap={1} align="end">
                <Link href="https://pokt.network" isExternal>
                    <Image src={logo} alt="logo" width={122} height={36} />
                </Link>
                <Text fontSize={18} fontWeight={700}>Bridge</Text>
            </Flex>
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
                                    {/* <Button
                                        color="darkBlue"
                                        background="poktLime"
                                        borderWidth={2}
                                        borderColor="poktLime"
                                        leftIcon={<EthIcon />}
                                        onClick={openConnectModal}
                                        _hover={{ bg: "hover.poktLime" }}
                                    >
                                        Connect
                                    </Button> */}
                                    <Button
                                        variant="outline"
                                        borderColor="poktLime"
                                        bg="transparent"
                                        color="white"
                                        paddingX={8}
                                        height={8}
                                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                        leftIcon={<EthIcon fill={"white"}/>}
                                        onClick={openConnectModal}
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
                                        onClick={disconnectPokt}
                                    >
                                        Disconnect
                                    </Link>
                                </VStack>
                            ) : (
                                <VStack spacing={1} mt={10}>
                                    <Text fontSize={14}>Connect Pocket Wallet</Text>
                                    {/* <Button
                                        color="darkBlue"
                                        background="poktLime"
                                        borderWidth={2}
                                        borderColor="poktLime"
                                        leftIcon={<PoktIcon />}
                                        onClick={onConnectPoktModalOpen}
                                        _hover={{ bg: "hover.poktLime" }}
                                    >
                                        Connect
                                    </Button> */}
                                    <Button
                                        variant="outline"
                                        borderColor="poktLime"
                                        bg="transparent"
                                        color="white"
                                        paddingX={8}
                                        height={8}
                                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                        leftIcon={<PoktIcon fill={"white"}/>}
                                        onClick={connectSendWallet}
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
                            // padding={3}
                            paddingX={3}
                            width="140px"
                            height={8}
                            onClick={() => disconnect()}
                        >
                            {address.substring(0,4) + "..." + address.substring(address.length - 4)}
                        </Button>
                    ) : (
                        // <Button
                        //     color="darkBlue"
                        //     background="poktLime"
                        //     borderWidth={2}
                        //     borderColor="poktLime"
                        //     _hover={{ bg: "hover.poktLime" }}
                        //     leftIcon={<EthIcon />}
                        //     padding={4}
                        //     paddingY={5}
                        //     onClick={openConnectModal}
                        // >
                        //     Connect
                        // </Button>
                        <Button
                            variant="outline"
                            borderColor="poktLime"
                            bg="transparent"
                            color="white"
                            paddingX={8}
                            width="140px"
                            height={8}
                            _hover={{ bg: "rgba(255,255,255,0.1)" }}
                            leftIcon={<EthIcon fill={"white"}/>}
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
                            // padding={4}
                            paddingX={3}
                            width="140px"
                            height={8}
                            onClick={disconnectPokt}
                        >
                            {poktAddress.substring(0,4) + "..." + poktAddress.substring(poktAddress.length - 4)}
                        </Button>
                    ) : (
                        // <Button
                        //     color="darkBlue"
                        //     background="poktLime"
                        //     borderWidth={2}
                        //     borderColor="poktLime"
                        //     _hover={{ bg: "hover.poktLime" }}
                        //     leftIcon={<PoktIcon />}
                        //     padding={4}
                        //     paddingY={5}
                        //     onClick={connectSendWallet}
                        // >
                        //     Connect
                        // </Button>
                        <Button
                            variant="outline"
                            borderColor="poktLime"
                            bg="transparent"
                            color="white"
                            paddingX={8}
                            width="140px"
                            height={8}
                            _hover={{ bg: "rgba(255,255,255,0.1)" }}
                            leftIcon={<PoktIcon fill={"white"}/>}
                            onClick={onConnectPoktModalOpen}
                        >
                            Connect
                        </Button>
                    )}
                </ButtonGroup>
            )}
        </HStack>
        <ConnectPoktModal isOpen={isConnectPoktModalOpen} onClose={onConnectPoktModalClose}><></></ConnectPoktModal>
        </>
    )
}