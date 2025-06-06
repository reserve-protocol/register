import AlertIcon from 'components/icons/AlertIcon'
import { atom, useAtomValue } from 'jotai'
import { chainIdAtom, rTokenStateAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'

// TODO: Use CMS for this state? or maybe environment variables, chain specific
const maintenanceAtom = atom((get) => {
  return false
})

const WarningBanner = ({
  title,
  description,
  ...props
}: BoxProps & { title: string; description: string }) => {
  return (
    <Box {...props} variant="layout.borderBox" p="3">
      <Box variant="layout.verticalAlign">
        <AlertIcon width={32} height={32} />
        <Box ml="3">
          <Text sx={{ fontWeight: 'bold' }} variant="warning">
            {title}
          </Text>
          <br />
          <Text mt="1" sx={{ display: 'block' }} variant="warning">
            {description}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export const CollateralizationBanner = (props: BoxProps) => {
  const { isCollaterized } = useAtomValue(rTokenStateAtom)

  if (isCollaterized) return null

  return (
    <WarningBanner
      {...props}
      title="RToken basket is under re-collateralization."
      description="For redemptions, please wait until the process is complete or manually redeem using the previous basket."
    />
  )
}

export const MaintenanceBanner = (props: BoxProps) => {
  const maintenance = useAtomValue(maintenanceAtom)

  if (!maintenance) return null

  return (
    <WarningBanner
      {...props}
      title="RToken zapper is under maintenance."
      description="This should last for a few hours, manual minting/redemption is available."
    />
  )
}

export const DisabledArbitrumBanner = (props: BoxProps) => {
  const chainId = useAtomValue(chainIdAtom)

  if (chainId !== ChainId.Arbitrum) return null

  return (
    <WarningBanner
      {...props}
      title="Arbitrum mints are no longer supported."
      description="Because of a low usage, the Reserve DApp is sunsetting mints on Arbitrum. Redemptions will continue to be supported. Yield DTFs are always backed 1:1 by underlying assets and can be permissonlessly redeemed at any time."
    />
  )
}
