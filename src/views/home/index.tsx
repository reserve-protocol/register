import { useState } from 'react'
import { Container, Input } from 'components'
import { useAppSelector } from 'state/hooks'
import { Box, Text, Grid, Button } from '@theme-ui/components'
import { useDispatch } from 'react-redux'
import { addWallet, removeWallet } from 'state/wallets/reducer'
import WalletConnection from 'components/wallets/WalletConnection'
import AddWallet from './components/AddWallet'

const Home = () => {
  const dispatch = useDispatch()

  const handleAdd = (address: string, alias: string) => {
    dispatch(addWallet({ address, alias }))
  }

  return (
    <Container>
      <Text>Wallet connect</Text>
      <Box mt={2} mb={3} p={2} sx={{ border: '1px solid #ccc' }}>
        <WalletConnection />
      </Box>
      <Text>Track any wallet</Text>
      <AddWallet sx={{ border: '1px solid #ccc' }} p={4} onAdd={handleAdd} />
    </Container>
  )
}

export default Home
