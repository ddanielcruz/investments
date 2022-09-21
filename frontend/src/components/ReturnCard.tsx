import { VStack, Text, useColorModeValue, Icon, HStack } from '@chakra-ui/react'
import { MdTrendingDown, MdTrendingUp } from 'react-icons/md'

import { formatCurrency, formatPercentage } from '../helpers/formatting'

export interface IProps {
  group: string
  value: number
  percentage: number
}

export default function ReturnCard({ group, value, percentage }: IProps) {
  const isPositive = percentage > 0

  return (
    <VStack
      flexGrow={1}
      shadow={'base'}
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      rounded="md"
      align={'start'}
      spacing={2}
    >
      <Text color={useColorModeValue('gray.500', 'gray.300')}>{group}</Text>
      <Text fontWeight={'bold'} fontSize={'xl'}>
        {formatCurrency(value)}
      </Text>
      <HStack color={isPositive ? 'green.400' : 'red.400'}>
        <Icon as={isPositive ? MdTrendingUp : MdTrendingDown} />
        <Text fontWeight={'bold'} fontSize={'lg'}>
          {formatPercentage(percentage)}
        </Text>
      </HStack>
    </VStack>
  )
}
