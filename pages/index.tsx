import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Box, Center, Divider, Flex, Heading } from '@chakra-ui/react'
import { Bridge } from '@/components/Bridge'
import { GlobalContext, GlobalContextProvider } from '@/context/Globals'
import { useContext } from 'react'


export default function Home() {
  const { destination } = useContext(GlobalContext)
  return (
    <Flex direction="column" minHeight="100vh" overflowX="hidden">
      <Header />
      <Heading
        size="lg"
        color="poktBlue"
        textAlign="center"
        padding={4}
      >
        {destination === 'eth' ? 'Pocket/Ethereum' : 'Ethereum/Pocket'} Bridge
      </Heading>
      <Center paddingX={10} paddingBottom={1}>
        <Divider borderColor={"poktLime"} />
      </Center>
      <Flex flexGrow={1} justify="center" align="center" paddingY={10}>
        <Bridge />
      </Flex>
      <Footer />
    </Flex>
  )
}
