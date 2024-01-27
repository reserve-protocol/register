import Popup from 'components/popup'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useCallback, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { selectedRTokenAtom } from 'state/atoms'
import { Box, BoxProps } from 'theme-ui'
import { CHAIN_TO_NETWORK } from 'utils/constants'
import SelectedToken from './SelectedToken'
import TokenList from './TokenList'

/**
 * Top header RToken selection
 */
const RTokenSelector = (props: BoxProps) => {
  const navigate = useNavigate()
  const [isVisible, setVisible] = useState(false)
  const selected = useAtomValue(selectedRTokenAtom)
  const location = useLocation()

  const handleSelect = useCallback(
    (token: string, chain: number) => {
      if (token !== selected) {
        mixpanel.track('Selected RToken', {
          Source: 'Dropdown',
          RToken: token.toLowerCase(),
        })
        // TODO: Not sure if people want to get this functionality
        // navigate(
        //   `${
        //     selected ? location.pathname : ROUTES.OVERVIEW
        //   }?token=${token}&chainId=${chain}`
        // )
        navigate(`/${CHAIN_TO_NETWORK[chain]}/token/${token}`)
        setVisible(false)
      }
    },
    [selected, location.pathname]
  )

  const handleHome = useCallback(() => {
    navigate('/')
    setVisible(false)
  }, [setVisible, navigate])

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<TokenList onSelect={handleSelect} onHome={handleHome} />}
    >
      <Box
        {...props}
        variant="layout.verticalAlign"
        sx={{
          cursor: 'pointer',
          fontSize: 1,
          // minWidth: 100,
        }}
        onClick={() => setVisible(!isVisible)}
      >
        <SelectedToken />
        <Box mr="auto" pl={[1, 2]} />
        {isVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Box>
    </Popup>
  )
}

export default RTokenSelector
