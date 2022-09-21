import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, HStack, Link, useColorMode, useColorModeValue } from '@chakra-ui/react'

export default function Navbar() {
  const linkColor = useColorModeValue('gray.500', 'gray.300')
  const linkHoverColor = useColorModeValue('gray.800', 'white')
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box as="nav" shadow="base" bg={useColorModeValue('white', 'gray.800')}>
      <Flex py={2} px={4} minH="60px" align="center" maxW="container.xl" mx="auto">
        <Flex grow={1}>
          <Link
            href="/"
            fontSize="lg"
            fontWeight="bold"
            _hover={{ textDecoration: 'none' }}
            color={useColorModeValue('gray.800', 'white')}
          >
            Investments
          </Link>
        </Flex>

        <HStack spacing={4}>
          {LINKS.map(link => (
            <Link
              key={link.label}
              href={link.url}
              fontWeight={500}
              color={linkColor}
              _hover={{ textDecoration: 'none', color: linkHoverColor }}
            >
              {link.label}
            </Link>
          ))}

          <Button onClick={toggleColorMode} variant="ghost">
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </Button>
        </HStack>
      </Flex>
    </Box>
  )
}

const LINKS: { label: string; url: string }[] = [
  {
    label: 'Dashboard',
    url: '/'
  },
  {
    label: 'Transactions',
    url: '/transactions'
  }
]
