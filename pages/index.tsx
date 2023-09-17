import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Flex } from '@chakra-ui/react'
import { Bridge } from '@/components/Bridge'


export default function Home() {
  return (
    <Flex direction="column" minHeight="100vh" overflowX="hidden">
      <Header />
      <Flex flexGrow={1} justify="center" align="center" paddingY={10}>
        <Bridge />
      </Flex>
      <Footer />
    </Flex>
  )
}
