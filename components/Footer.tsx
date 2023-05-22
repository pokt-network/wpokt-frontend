import { Box, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react";
import { DiscordIcon, GithubIcon, TelegramIcon, TwitterIcon } from "./icons/socials";

export function Footer() {
    return (
        <Flex justify="space-between" padding={10} gap={4} background="darkOverlay">
            <Flex direction="column" gap={4}>
                <Box>
                    <Heading size="sm">Stay Updated</Heading>
                    <Text>Come and help us grow the  POKT community alongside the protocol.</Text>
                    <Text>Join our social media channels.</Text>
                </Box>
                <Flex gap={8}>
                    <DiscordIcon width={8} height={8} />
                    <GithubIcon width={8} height={8} />
                    <TelegramIcon width={8} height={8} />
                    <TwitterIcon width={8} height={8} />
                </Flex>
            </Flex>
            <VStack align="left">
                <Heading size="sm">Product</Heading>
                <Link>What is the Pocket Network?</Link>
                <Link>Website</Link>
            </VStack>
            <VStack align="left">
                <Heading size="sm">Community</Heading>
                <Link>Blog</Link>
                <Link>Forum</Link>
                <Link>Join Discord</Link>
            </VStack>
            <VStack align="left">
                <Heading size="sm">Resources</Heading>
                <Link>White Paper</Link>
                <Link>Economic One Pager</Link>
                <Link>Dev Portal</Link>
                <Link>Terms of Use</Link>
                <Link>Privacy Policy</Link>
            </VStack>
        </Flex>
    )
}