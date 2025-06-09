import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Flex, Text } from '@chakra-ui/react'
import { Bridge } from '@/components/Bridge'
import { IS_PAUSED, IS_POKT_PAUSED } from '@/utils/constants'


export default function Home() {
  return (
    <Flex direction="column" minHeight="100vh" overflowX="hidden">
      <Header />
      {IS_PAUSED && (
        <Flex 
          flexGrow={1} 
          justify="center" 
          align="center" 
          paddingY={10}
          bg="poktLime"
          color="darkBlue"
          width="100%"
        >
          <Text fontSize="lg" fontWeight="bold">
            Due to Pocket Network undergoing the Shannon upgrade, the bridge will be paused for 24 hours starting at 10am ET today (June 3rd)
          </Text>
        </Flex>
      )}

      {(IS_POKT_PAUSED && !IS_PAUSED) && (
        <Flex 
          flexGrow={1} 
          justify="center" 
          align="center" 
          paddingY={10}
          bg="poktLime"
          color="darkBlue"
          width="100%"
        >
          <Text fontSize="lg" fontWeight="bold">
            This bridge only supports wPOKT → POKT transfers as Pocket Network transitions to a unified xERC-20 token standard.
          </Text>
        </Flex>
      )}
      
      <Flex flexGrow={1} justify="center" align="center" paddingY={10}>
        <Bridge />
      </Flex>
      <Footer />
    </Flex>
  )
}
