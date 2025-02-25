import Address from '@/components/utils/explorer-address'
import { SmallButton } from '@/components/old/button'
import CopyValue from '@/components/old/button/CopyValue'
import FilesIcon from 'components/icons/FilesIcon'
import FingerprintIcon from 'components/icons/FingerprintIcon'
import WalletOutlineIcon from 'components/icons/WalletOutlineIcon'
import dayjs from 'dayjs'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Box, Link, Text } from 'theme-ui'
import { shortenString } from 'utils'
import { ROUTES } from 'utils/constants'
import { proposalDetailAtom } from './atom'
import ProposalSnapshot from './ProposalSnapshot'

const BackButton = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(`../${ROUTES.GOVERNANCE}`)
  }

  return (
    <SmallButton variant="transparent" onClick={handleBack}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 1,
        }}
      >
        <ArrowLeft size={16} />
      </Box>
    </SmallButton>
  )
}

const Dot = () => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      justifyContent: 'center',
      fontWeight: 'bold',
      display: ['none', 'block', 'block', 'block', 'block'],
    }}
  >
    ·
  </Box>
)

const StatItem = ({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) => (
  <Box variant="layout.verticalAlign" sx={{ gap: '12px' }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        bg: 'bgIcon',
        borderRadius: '4px',
        color: 'text',
      }}
    >
      {icon}
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Text variant="legend" sx={{ fontSize: 1 }}>
        {label}
      </Text>
      {children}
    </Box>
  </Box>
)

const ProposalHeader = () => {
  const rToken = useRToken()
  const proposal = useAtomValue(proposalDetailAtom)

  let title = 'Loading...'
  let rfcLink = ''

  if (proposal?.description) {
    const [heading, rfc, _] = proposal.description.split(/\r?\n/)
    title = heading.replaceAll('#', '').trim()
    if (rfc?.includes('forum')) {
      rfcLink = rfc.match(/\(([^)]+)\)/)?.[1] ?? ''
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        gap: [3, 7],
        p: [3, 4],
      }}
    >
      <Box
        variant="layout.verticalAlign"
        sx={{ gap: [3, 2], justifyContent: 'space-between', flexWrap: 'wrap' }}
      >
        <BackButton />
        <ProposalSnapshot />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: [3, 4] }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderBottom: '1px solid',
            borderColor: 'borderSecondary',
            pb: [3, 4],
            gap: 2,
          }}
        >
          <Text
            sx={{
              fontSize: 4,
              fontWeight: 'bold',
            }}
          >
            {title}
          </Text>
          {!!rfcLink && (
            <Link
              href={rfcLink}
              target="_blank"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Text
                sx={{
                  color: 'text',
                  textOverflow: 'ellipsis',
                  textDecoration: 'underline',
                  fontWeight: 'semibold',
                }}
              >
                {rfcLink}
              </Text>
              <ArrowUpRight size={16} />
            </Link>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: ['column', 'row'],
              alignItems: ['start', 'center'],
              gap: [2, 5],
              flexWrap: 'wrap',
            }}
          >
            <StatItem label="Proposed on" icon={<FilesIcon />}>
              <Text>
                {proposal?.creationTime
                  ? dayjs.unix(+proposal.creationTime).format('MMM D, YYYY')
                  : 'Loading...'}
              </Text>
            </StatItem>
            <StatItem label="Proposed by" icon={<WalletOutlineIcon />}>
              <Box>
                {proposal?.proposer && rToken?.chainId && (
                  <Address
                    address={proposal?.proposer}
                    chain={rToken?.chainId}
                  />
                )}
              </Box>
            </StatItem>
            <StatItem label="ID" icon={<FingerprintIcon />}>
              <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
                <Text>
                  {proposal?.id ? shortenString(proposal.id) : 'Loading...'}
                </Text>
                {!!proposal?.id && (
                  <CopyValue text={proposal.id} value={proposal.id} />
                )}
              </Box>
            </StatItem>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
export default ProposalHeader
