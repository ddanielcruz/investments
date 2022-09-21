import { Container, Flex } from '@chakra-ui/react'

import Navbar from '../layout/Navbar'
import ReturnCard from '../components/ReturnCard'

const KEYS = ['Overall', 'Stocks', 'Crypto', 'Fixed Income']

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <Container maxWidth="container.xl" py={8}>
        <Flex gap={8}>
          {KEYS.map(key => (
            <ReturnCard key={key} group={key} value={1000000} percentage={0.08} />
          ))}
        </Flex>
      </Container>
    </>
  )
}
