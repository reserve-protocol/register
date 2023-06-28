import Popup from 'components/popup'
import { useAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import mixpanel from 'mixpanel-browser'
import { selectedRTokenAtom } from 'state/atoms'
import { Box, BoxProps, Flex } from 'theme-ui'
import { ROUTES } from 'utils/constants'
import SelectedToken from './SelectedToken'
import TokenList from './TokenList'

/**
 * Top header RToken selection
 */
const RTokenSelector = (props: BoxProps) => {
  const navigate = useNavigate()
  const [isVisible, setVisible] = useState(false)
  const [selected, setSelected] = useAtom(selectedRTokenAtom)
  const location = useLocation()

  const handleSelect = useCallback(
    (token: string) => {
      mixpanel.track('Selected RToken', {
        Source: 'Dropdown',
        RToken: token.toLowerCase(),
      })

      if (token !== selected) {
        setSelected(token)
        navigate(
          `${selected ? location.pathname : ROUTES.OVERVIEW}?token=${token}`
        )
        setVisible(false)
      }
    },
    [setSelected, selected, location.pathname]
  )

  const handleHome = useCallback(() => {
    setSelected('')
    navigate('/')
    setVisible(false)
  }, [setVisible, setSelected, navigate])

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<TokenList onSelect={handleSelect} onHome={handleHome} />}
    >
      <Flex
        {...props}
        sx={{ alignItems: 'center', cursor: 'pointer', minWidth: 100 }}
        onClick={() => setVisible(!isVisible)}
      >
        <SelectedToken />
        <Box mr="2" />
        {isVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </Flex>
    </Popup>
  )
}

export default RTokenSelector
