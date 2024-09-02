import { Box, Progress, Text } from 'theme-ui'
import { ReactNode } from 'react'

import { Slash, Circle, Lock, Plus, Clock } from 'react-feather'
import Address from 'components/address'

const proposal = {
  id: '2434660005055',
  chain: 1,
  proposer: '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  createdTimestamp: Date.now() / 1000 - 86_400 * 4,
  title: 'Human readable proposal title',
  rfcLink: 'https://forum.reserve.org/t/123',
  status: 'VOTING',
  votingStartsTimestamp: Date.now() / 1000 - 86_400 * 2,
  votingEndsTimestamp: Date.now() / 1000 + 361_800,
  executionTimestamp: Date.now() / 1000 + 361_800 + 189_000,
  forVotes: 15_000_000,
  againstVotes: 5_000_000,
  abstainVotes: 20_000_000,
  currentQuorum: 8_620_000,
  quorumNeeded: 102_320_000,
  hasQuorum: true,
  numberOfChanges: 4,
  description: `
    ### Proposal description
    Following the RFC to guide the ETH+ community through the next steps to finalize the upgrade to the 3.4.0 smart contract release by Reserve Protocol, the following prerequisites have been completed:
    <!--EMPTYLINE-->
    - All reward token balances should be claimed beforehand
    - All rebalancing and revenue auctions must run to completion
    <!--EMPTYLINE-->
    Once these steps are completed **The final step to upgrade ETH+ to release 3.4.0 can proceed.** This RFC will not follow a normal governance cycle, this RFC is designed to prompt the community to complete the required prerequisites, so the upgrade to release 3.4.0 can be finalized. Once these steps are completed, the second IP to finalize the upgrade will be launched.
    <!--EMPTYLINE-->
    ### Summary
    Following the RFC to guide the ETH+ community through the next steps to finalize the upgrade to the 3.4.0 smart contract release by Reserve Protocol, the following prerequisites have been completed:
    <!--EMPTYLINE-->
    - All reward token balances should be claimed beforehand
    - All rebalancing and revenue auctions must run to completion
    <!--EMPTYLINE-->
    Once these steps are completed **The final step to upgrade ETH+ to release 3.4.0 can proceed.** This RFC will not follow a normal governance cycle, this RFC is designed to prompt the community to complete the required prerequisites, so the upgrade to release 3.4.0 can be finalized. Once these steps are completed, the second IP to finalize the upgrade will be launched.
    <!--EMPTYLINE-->
    ### Problem statement
    Following the RFC to guide the ETH+ community through the next steps to finalize the upgrade to the 3.4.0 smart contract release by Reserve Protocol, the following prerequisites have been completed:
    <!--EMPTYLINE-->
    - All reward token balances should be claimed beforehand
    - All rebalancing and revenue auctions must run to completion
    <!--EMPTYLINE-->
    Once these steps are completed **The final step to upgrade ETH+ to release 3.4.0 can proceed.** This RFC will not follow a normal governance cycle, this RFC is designed to prompt the community to complete the required prerequisites, so the upgrade to release 3.4.0 can be finalized. Once these steps are completed, the second IP to finalize the upgrade will be launched.
  `
    .replace(/\n\s+/g, '\n')
    .replace(/<!--EMPTYLINE-->/g, '\n'),
  changes: {
    'gauge-listing': [
      {
        chainId: 1,
        address: '0x5BDd1fA233843Bfc034891BE8a6769e58F1e1346' as const,
      },
    ],
    'staking-listing': [],
    'incentive-listing': [],
    'collateral-whitelisting': [],
    'protocol-whitelisting': [],
  },
}

const mockTimeline = [
  {
    surtitle: 'Mon Jul 29, 04:40 pm',
    icon: <Plus size={18} />,
    title: 'Proposal created',
    subtitle: (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Text>By:</Text>
        <Address
          address="0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4"
          chain={1}
        />
      </Box>
    ),
    enabled: true,
  },
  {
    surtitle: '2 day',
    icon: <Clock size={18} />,
    title: 'Voting delay',
    enabled: true,
  },
  {
    surtitle: 'Mon Jul 31, 04:40 pm',
    icon: <Lock size={18} />,
    title: 'Snapshot taken',
    subtitle: (
      <Address address="0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4" chain={1} />
    ),
    enabled: true,
  },
  {
    surtitle: 'Mon Jul 31, 04:40 pm',
    icon: <Slash size={18} />,
    title: 'Voting period',
    enabled: true,
  },
  {
    surtitle: 'Mon Jul 31, 04:40 pm',
    icon: <Slash size={18} />,
    title: 'Voting period ends',
    subtitle: 'in 11 days',
    enabled: false,
  },
  {
    surtitle: 'Fast proposal',
    icon: <Clock size={18} />,
    title: 'Execution delay',
    subtitle: '1 week delay',
    enabled: false,
  },
  {
    icon: <Circle size={18} />,
    title: 'Execute proposal',
    enabled: false,
  },
]

type TimelineItemProps = {
  icon: ReactNode
  title: string
  surtitle?: ReactNode
  subtitle?: ReactNode
  enabled?: boolean
  showProgress?: boolean
}

const TimelineItem = ({
  icon,
  title,
  surtitle,
  subtitle,
  enabled = true,
  showProgress = false,
}: TimelineItemProps) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          px: 3,
          py: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            bg: 'muted',
            zIndex: 10,
            opacity: enabled ? 1 : 0.8,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ opacity: enabled ? 1 : 0.5 }}>
          <Box sx={{ fontSize: 1 }}>{surtitle}</Box>
          <Box sx={{ fontWeight: 'bold' }}>{title}</Box>
          <Box sx={{ fontSize: 1 }}>{subtitle}</Box>
        </Box>
      </Box>
      {showProgress && (
        <Progress
          value={20}
          max={100}
          sx={{
            position: 'absolute',
            width: '100%',
            color: 'primary',
            backgroundColor: 'lightgray',
            height: 2,
            zIndex: 20,
          }}
        />
      )}
    </Box>
  )
}

const ProposalTimeline = () => {
  // TODO: Add skeleton loader
  if (!proposal) return null

  return (
    <Box sx={{ bg: 'background', borderRadius: '8px', p: 2, mt: 2 }}>
      <Text
        variant="title"
        sx={{ fontWeight: 'bold', lineHeight: '20px' }}
        p={3}
      >
        Status
      </Text>
      <Box
        sx={{
          position: 'relative',
          bg: 'focusedBackground',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0px 10px 38px 6px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            borderLeft: '2px solid',
            borderColor: 'borderSecondary',
            top: '40px',
            left: '29px',
            height: 'calc(100% - 72px)',
            zIndex: 10,
          }}
        />
        <Box py={2}>
          {mockTimeline.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column' }}>
              <TimelineItem
                {...item}
                showProgress={
                  item.enabled !== Boolean(mockTimeline[index + 1]?.enabled) &&
                  index !== mockTimeline.length - 1
                }
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default ProposalTimeline
