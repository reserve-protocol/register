import styled from '@emotion/styled'
import { Box } from '@theme-ui/components'
import LangIcon from 'components/icons/Lang'
import Popup from 'components/popup'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const LangItem = styled(Box)`
  padding: 10px;
  border-bottom: 1px solid black;

  &:first-of-type {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-of-type {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border-bottom: none;
  }

  &:hover {
    background-color: #ccc;
    cursor: pointer;
  }
`

const LanguageList = ({ onChange }: { onChange(key: string): void }) => (
  <Box>
    <LangItem
      role="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={() => onChange('en')}
    >
      English
    </LangItem>
    <LangItem
      role="button"
      tabIndex={0}
      sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
      aria-hidden="true"
      onClick={() => onChange('es')}
    >
      Español
    </LangItem>
  </Box>
)

const LanguageSelector = () => {
  const [isVisible, setVisible] = useState(false)
  const { i18n } = useTranslation()

  const handleSelection = (lang: string) => {
    setVisible(false)
    i18n.changeLanguage(lang)
  }

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<LanguageList onChange={handleSelection} />}
    >
      <Box
        role="button"
        sx={{
          color: 'white',
          fontSize: 3,
          display: 'flex',
          alignItems: 'center',
          marginRight: 3,
          cursor: 'pointer',
        }}
      >
        <LangIcon onClick={() => setVisible(!isVisible)} />
      </Box>
    </Popup>
  )
}

export default LanguageSelector
