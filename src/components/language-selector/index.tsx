import { Box, BoxProps } from 'theme-ui'
import LangIcon from 'components/icons/Lang'
import Popup from 'components/popup'
import { useState } from 'react'
import { transition } from 'theme'

const ActionItem = ({ sx, ...props }: BoxProps) => (
  <Box
    sx={{
      ...sx,
      transition,
      padding: '16px',
      borderBottom: '1px solid',
      borderColor: 'border',
      cursor: 'pointer',
      '&:first-of-type': {
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
      },

      '&:last-of-type': {
        borderBottomLeftRadius: '4px',
        borderBottomRightRadius: '4px',
        borderBottom: 'none',
      },

      '&:hover': {
        backgroundColor: 'secondary',
      },
    }}
    {...props}
  />
)

const LanguageList = ({ onChange }: { onChange(key: string): void }) => (
  <Box>
    <ActionItem
      role="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={() => onChange('en')}
    >
      🇺🇸 &nbsp;English
    </ActionItem>
    <ActionItem
      role="button"
      tabIndex={0}
      sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
      aria-hidden="true"
      onClick={() => onChange('es')}
    >
      🇲🇽 &nbsp;Español
    </ActionItem>
  </Box>
)

const LanguageSelector = () => {
  const [isVisible, setVisible] = useState(false)
  // const { i18n } = useTranslation()

  const handleSelection = (lang: string) => {
    setVisible(false)
    // i18n.changeLanguage(lang)
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
          fontSize: 2,
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
