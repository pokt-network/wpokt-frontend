import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Box, Flex } from '@chakra-ui/react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Box flexGrow={1}></Box>
      <Footer />
    </Flex>
  )
}
