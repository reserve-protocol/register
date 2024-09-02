import Address from 'components/address'
import { useAtom, useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { Circle, Clock, Lock, Plus, Slash } from 'react-feather'
import { Box, Progress, Text } from 'theme-ui'
import { proposalDetailAtom } from '../../atom'
import dayjs from 'dayjs'
import { formatDate, parseDuration } from 'utils'
import useBlockTimestamp from 'hooks/useBlockTimestamp'
import { isTimeunitGovernance } from 'views/governance/utils'
import { end } from '@popperjs/core'

// const mockTimeline = [
//   {
//     surtitle: 'Mon Jul 29, 04:40 pm',
//     icon: <Plus size={18} />,
//     title: 'Proposal created',
//     subtitle: (
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//         <Text>By:</Text>
//         <Address
//           address="0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4"
//           chain={1}
//         />
//       </Box>
//     ),
//     enabled: true,
//   },
//   {
//     surtitle: '2 day',
//     icon: <Clock size={18} />,
//     title: 'Voting delay',
//     enabled: true,
//   },
//   {
//     surtitle: 'Mon Jul 31, 04:40 pm',
//     icon: <Lock size={18} />,
//     title: 'Snapshot taken',
//     subtitle: (
//       <Address address="0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4" chain={1} />
//     ),
//     enabled: true,
//   },
//   {
//     surtitle: 'Mon Jul 31, 04:40 pm',
//     icon: <Slash size={18} />,
//     title: 'Voting period',
//     enabled: true,
//   },
//   {
//     surtitle: 'Mon Jul 31, 04:40 pm',
//     icon: <Slash size={18} />,
//     title: 'Voting period ends',
//     subtitle: 'in 11 days',
//     enabled: false,
//   },
//   {
//     surtitle: 'Fast proposal',
//     icon: <Clock size={18} />,
//     title: 'Execution delay',
//     subtitle: '1 week delay',
//     enabled: false,
//   },
//   {
//     icon: <Circle size={18} />,
//     title: 'Execute proposal',
//     enabled: false,
//   },
// ]

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
            bg: 'bgIcon',
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

export const TimelineItemCreated = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  return (
    <TimelineItem
      icon={<Circle size={18} />}
      title="Proposal created"
      surtitle={formatDate(+(proposal?.creationTime || 0) * 1000)}
      subtitle={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Text>By:</Text>
          <Address
            address="0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4"
            chain={1}
          />
        </Box>
      }
    />
  )
}

export const TimelineItemVotingDelay = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const isTimeunit = isTimeunitGovernance(proposal?.version ?? '1')
  const _startTime = useBlockTimestamp(proposal?.startBlock)
  const _endTime = useBlockTimestamp(proposal?.endBlock)

  const startTime = isTimeunit ? proposal?.startBlock : _startTime
  const endTime = isTimeunit ? proposal?.endBlock : _endTime

  return (
    <TimelineItem
      icon={<Clock size={18} />}
      title="Voting delay"
      surtitle={parseDuration((endTime || 0) - (startTime || 0))}
    />
  )
}
