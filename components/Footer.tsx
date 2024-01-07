import { Box, Center, Flex, HStack, Heading, Link, Text, VStack } from "@chakra-ui/react";
import { DiscordIcon, GithubIcon, TwitterIcon } from "./icons/socials";
import { useEffect, useState } from "react";

export function Footer() {
    const [mobileFooter, setMobileFooter] = useState<boolean>(false)

    useEffect(() => {
        toggleMobile();
        window.addEventListener('resize', toggleMobile);
    });

    function toggleMobile() {
        if (window && window.innerWidth < 400) {
            setMobileFooter(true);
        } else {
            setMobileFooter(false);
        }
    };

    return (
        <Flex direction="column" justify="center" paddingX={10}>
            <Flex direction={mobileFooter ? "column" : "row"} justify="space-between" padding={10} gap={mobileFooter ? 10 : 4}>
                <Flex direction="column" gap={4}>
                    <Box>
                        <Heading size="md">Connect With Us</Heading>
                    </Box>
                    <Flex gap={8}>
                        <Link href="https://discord.com/invite/pokt" isExternal _hover={{ color: "hover.poktLime" }}>
                            <DiscordIcon width={8} height={8} href="https://discord.com/invite/pokt" />
                        </Link>
                        <Link href="https://github.com/pokt-network" isExternal _hover={{ color: "hover.poktLime" }}>
                            <GithubIcon width={8} height={8} href="https://github.com/pokt-network" />
                        </Link>
                        <Link href="https://twitter.com/POKTnetwork" isExternal _hover={{ color: "hover.poktLime" }}>
                            <TwitterIcon width={8} height={8} href="https://twitter.com/POKTnetwork" />
                        </Link>
                    </Flex>
                </Flex>
                <VStack align="left" spacing={1}>
                    <Heading size="md">Resources</Heading>
                    <Link href="https://docs.pokt.network/pokt/wpokt/" isExternal _hover={{ color: "hover.poktLime" }}>
                        Documentation
                    </Link>
                    <Link href="https://poktscan.com" isExternal _hover={{ color: "hover.poktLime" }}>
                        Explorer
                    </Link>
                    <Link href="https://forum.pokt.network" isExternal _hover={{ color: "hover.poktLime" }}>
                        Forum
                    </Link>
                    <Link href="https://v2.info.uniswap.org/pair/0xa7fd8ff8f4cada298286d3006ee8f9c11e2ff84e" isExternal _hover={{ color: "hover.poktLime" }}>
                        Uniswap Pool
                    </Link>
                </VStack>
            </Flex>
            {mobileFooter && <Center mb={2}>© 2023 Pocket Network</Center>}
            <HStack alignSelf="center" mb={4}>
                {!mobileFooter && <Text>© 2023 Pocket Network</Text>}
                {!mobileFooter && <Text>|</Text>}
                <Link href="https://docs.google.com/document/d/1xXMSvnh7UhrROAMkAgTgRAzzRc6C57Sr3ptoSvUqe7Q/edit?usp=sharing" isExternal _hover={{ color: "hover.poktLime" }}>
                    Terms of Use
                </Link>
                <Text>|</Text>
                <Link href="https://www.pokt.network/privacy-policy" isExternal _hover={{ color: "hover.poktLime" }}>
                    Privacy Policy
                </Link>
            </HStack>
        </Flex>
    )
}