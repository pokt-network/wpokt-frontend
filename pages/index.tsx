import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Box, Center, Divider, Flex, Heading } from '@chakra-ui/react'
import { Bridge } from '@/components/Bridge'
import { GlobalContextProvider } from '@/context/Globals'


export default function Home() {
  return (
    <GlobalContextProvider>
      <Flex direction="column" minHeight="100vh" overflowX="hidden">
        <Header />
        <Heading
          size="lg"
          color="poktBlue"
          textAlign="center"
          padding={4}
        >
          Pocket/Ethereum Exchange
        </Heading>
        <Center paddingX={10}>
          <Divider borderColor={"poktLime"} />
        </Center>
        <Flex flexGrow={1} justify="center" align="center">
          <Bridge />
        </Flex>
        <Footer />
      </Flex>
    </GlobalContextProvider>
  )
}
