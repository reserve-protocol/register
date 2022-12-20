import Popup from 'components/popup'
import { useAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useNavigate } from 'react-router-dom'
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

  const handleSelect = useCallback(
    (token: string) => {
      if (token !== selected) {
        setSelected(token)
        navigate(`${ROUTES.OVERVIEW}?token=${token}`)
        setVisible(false)
      }
    },
    [setSelected, selected]
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
