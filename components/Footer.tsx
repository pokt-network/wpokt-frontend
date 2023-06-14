import { Box, Flex, HStack, Heading, Link, Text, VStack } from "@chakra-ui/react";
import { DiscordIcon, GithubIcon, TelegramIcon, TwitterIcon } from "./icons/socials";

export function Footer() {
    return (
        <Flex direction="column" justify="center" paddingX={10} background="darkOverlay">
            <Flex justify="space-between" padding={10} gap={4}>
                <Flex direction="column" gap={4}>
                    <Box>
                        <Heading size="sm">Connect With Us</Heading>
                    </Box>
                    <Flex gap={8}>
                        <Link href="https://discord.com/invite/pokt" isExternal>
                            <DiscordIcon width={8} height={8} href="https://discord.com/invite/pokt" />
                        </Link>
                        <Link href="https://github.com/pokt-network/pocket" isExternal>
                            <GithubIcon width={8} height={8} href="https://github.com/pokt-network/pocket" />
                        </Link>
                        <Link href="https://twitter.com/POKTnetwork" isExternal>
                            <TwitterIcon width={8} height={8} href="https://twitter.com/POKTnetwork" />
                        </Link>
                    </Flex>
                </Flex>
                <VStack align="left" spacing={1}>
                    <Heading size="sm">Resources</Heading>
                    <Link href="https://docs.pokt.network" isExternal>
                        Documentation
                    </Link>
                    <Link href="https://poktscan.com" isExternal>
                        Explorer
                    </Link>
                    <Link href="https://forum.pokt.network" isExternal>
                        Forum
                    </Link>
                </VStack>
            </Flex>
            <HStack alignSelf="center" mb={4}>
                <Text>© 2023 Pocket Network</Text>
                <Text>|</Text>
                <Link href="https://www.pokt.network/privacy-policy" isExternal>
                    Terms of Use
                </Link>
                <Text>|</Text>
                <Link href="https://www.pokt.network/terms-of-use" isExternal>
                    Privacy Policy
                </Link>
            </HStack>
        </Flex>
    )
}