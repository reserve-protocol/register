import React, { useMemo } from 'react'
import { useCallback, useState } from 'react'
import { borderRadius } from 'theme'
import { Box, BoxProps, Text } from 'theme-ui'

interface Item {
  key: string
  label: string
  icon?: JSX.Element
}

interface Props extends BoxProps {
  items: Item[]
  onMenuChange(key: string): void
  active: string
  small?: boolean
  background?: string
  collapse?: boolean
}

const defaultStyles = (
  background: string,
  small: boolean,
  collapse: boolean
) => ({
  border: '1px solid',
  borderColor: 'darkBorder',
  color: 'secondaryText',
  fontSize: small ? 0 : 1,
  fontWeight: small ? 500 : 400,
  borderRadius: borderRadius.boxes,
  background: 'secondaryBackground',
  width: 'fit-content',
  '>div': {
    padding: small ? '6px' : '6px 8px 6px 8px',
    lineHeight: '16px',
    userSelect: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: borderRadius.inner,
    justifyContent: 'center',
    width: collapse ? [40, 'auto'] : 'auto',
    marginLeft: 1,
    ':first-of-type': {
      marginLeft: 0,
    },
    ':hover': {
      backgroundColor: 'border',
    },
    '&.active': {
      backgroundColor: 'backgroundNested',
      color: 'text',
      ':hover': {
        backgroundColor: 'border',
      },
    },
  },
})

const MenuItem = ({
  item,
  onClick,
  isActive,
  collapse,
}: {
  item: Item
  onClick(key: string): void
  isActive: boolean
  collapse: boolean
}) => {
  return (
    <div
      role="button"
      className={isActive ? 'active' : ''}
      onClick={() => onClick(item.key)}
    >
      {item.icon}
      <Text
        ml={!!item.icon ? 2 : 0}
        sx={{ display: collapse ? ['none', 'none', 'block'] : 'block' }}
      >
        {item.label}
      </Text>
    </div>
  )
}

// Reusable implementation, different from token header as it doesnt relies on routes
// TODO: refactor header menu to not rely on react-router at least on the inner component level.
const TabMenu = ({
  items,
  onMenuChange,
  small = false,
  collapse = false,
  background = 'transparent',
  active,
  sx,
  ...props
}: Props) => {
  // TODO: Styles got a typing error, for some reason userSelect: 'none' is not valid?
  const styles: any = useMemo(() => {
    return {
      ...defaultStyles(background, small, collapse),
      ...(sx ?? {}),
    }
  }, [sx])

  const handleSelect = useCallback(
    (key: string) => {
      onMenuChange(key)
    },
    [onMenuChange]
  )

  return (
    <Box variant="layout.verticalAlign" p={1} sx={styles} {...props}>
      {items.map((item) => (
        <MenuItem
          item={item}
          onClick={handleSelect}
          isActive={item.key === active}
          key={item.key}
          collapse={collapse}
        />
      ))}
    </Box>
  )
}

export default React.memo(TabMenu)
