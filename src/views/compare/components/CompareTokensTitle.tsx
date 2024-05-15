import { Trans } from '@lingui/macro'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import { SVGProps, useMemo } from 'react'
import { Box, Text } from 'theme-ui'

const BasketBoxOne = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 7 7"
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={0.2}
      d="M3.376 3.497.593 1.888m2.783 1.609 2.77-1.609m-2.77 1.609L3.37 6.7M.593 1.888v3.21L3.37 6.7M.593 1.888 3.376.3l2.77 1.588M3.37 6.7l2.776-1.608V1.888"
    />
    <path
      stroke="currentColor"
      strokeWidth={0.2}
      d="M.593 1.888v3.21l1.389.801M.593 1.889 3.376.298l2.77 1.59v3.203l-1.388.804L3.37 6.7M.593 1.888l1.392.804M3.37 6.7l.006-3.203-1.391-.805M3.37 6.7l-1.388-.801m.003-3.207L1.982 5.9"
    />
    <path
      stroke="currentColor"
      strokeWidth={0.2}
      d="M.593 1.888v3.21l1.389.801M.593 1.889l1.392.803M.593 1.888l1.392-.794L3.376.3l1.385.794M3.37 6.7l.006-3.203-1.391-.805M3.37 6.7l-1.388-.801m1.388.8 1.388-.803 1.388-.804V1.888l-1.385-.794M1.985 2.692 1.982 5.9m.003-3.207L4.76 1.094"
    />
  </svg>
)

const BasketBoxTwo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 8 9"
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={0.2}
      d="M3.625 4.496.146 2.486m3.48 2.01 3.462-2.01m-3.463 2.01L3.617 8.5M.147 2.486v4.012L3.616 8.5M.147 2.486 3.624.5l3.463 1.986M3.618 8.5l3.47-2.01V2.486"
    />
    <path
      stroke="currentColor"
      strokeWidth={0.2}
      d="M3.625 4.496 3.617 8.5m.008-4.004-.87-.503m.87.503.866-.503M.146 2.486v4.012l.868.5M.146 2.486 3.626.5l3.462 1.986m-6.942 0 .87.502M3.617 8.5 2.75 8m.868.5.868-.503m2.603-5.511V6.49l-.868.502m.868-4.506-.866.502m-4.336.503-.004 4.008m.004-4.008-.87-.503m.87.503.87.502M1.882 7.5l-.868-.5m.868.5.867.5m2.603-.504.005-4.004m-.005 4.004-.867.502m.867-.502.868-.503m-.863-3.501-.866.502m.866-.502.865-.503m-5.208 4.01.002-4.01M2.749 8l.007-4.006m1.729 4.004.006-4.004m1.73 3 .001-4.005"
    />
    <path
      stroke="currentColor"
      strokeWidth={0.2}
      d="M3.625 4.496 3.617 8.5m0 0L1.882 7.499M3.617 8.5l1.735-1.005L7.088 6.49V2.486l-.866-.497-.865-.496M3.625.5l.866.496M1.886 3.491l-.004 4.008m.004-4.008-.87-.503m.87.503.873-.503M1.882 7.5.146 6.498V2.486l.87.502m4.34-1.495L4.492.996m.866.497-.863.496m-3.478 1L4.491.995M2.759 2.988 1.016 1.99m1.743 1 .862-.497m.873-.503-1.33-.76m1.33.76-.873.503m-1.309-.754-.426-.245.873-.497.405.232m-.852.51.852-.51m-.852.51 1.31.754"
    />
  </svg>
)

const CompareTokensTitle = () => {
  const boxes = useMemo(
    () => [
      <BasketBoxOne key="box-one" fontSize={8} />,
      <BasketBoxTwo key="box-two" fontSize={12} />,
      <BasketCubeIcon key="box-three" />,
    ],
    []
  )

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ justifyContent: 'center' }}
      mt={[5, 8]}
      mb={[3, 7]}
    >
      <Box
        mr={5}
        variant="layout.verticalAlign"
        sx={{
          svg: { marginRight: 2 },
          display: ['none', 'flex'],
          opacity: 0.4,
        }}
      >
        {[...boxes]}
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Text variant="sectionTitle" sx={{ fontWeight: '700' }} mb={1}>
          <Trans>Browse RToken Currencies</Trans>
        </Text>
        <Text variant="legend">
          <Trans>
            Inspect collateral backing, mint, stake & explore deeper
          </Trans>
        </Text>
      </Box>

      <Box
        ml={5}
        variant="layout.verticalAlign"
        sx={{
          svg: { marginRight: 2 },
          display: ['none', 'flex'],
          opacity: 0.4,
        }}
      >
        {boxes.slice().reverse()}
      </Box>
    </Box>
  )
}

export default CompareTokensTitle
