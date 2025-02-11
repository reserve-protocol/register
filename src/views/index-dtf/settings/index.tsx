import { useAtomValue } from 'jotai'
import { Card } from '@/components/ui/card'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { IndexDTF } from '@/types'
import { formatCurrency, formatPercentage } from '@/utils'
import { formatEther, formatUnits } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import dtfIndexAbi from '@/abis/dtf-index-abi'

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <Card className="p-6 mb-6 border border-border rounded-xl">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    {children}
  </Card>
)

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-base text-gray-800 whitespace-pre-wrap">{value}</span>
  </div>
)

const ArrayRow = ({ label, value }: { label: string; value: any[] }) => (
  <Row
    label={label}
    value={
      <ul className="list-disc pl-5 text-sm text-gray-800">
        {value.map((item, index) => (
          <li key={index}>{item.toString()}</li>
        ))}
      </ul>
    }
  />
)

const DistributeFees = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { data: hash, writeContract, isPending } = useWriteContract()

  const { data: receipt, isLoading } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  if (!indexDTF) return null

  const distributeFees = () => {
    writeContract({
      abi: dtfIndexAbi,
      address: indexDTF.id,
      functionName: 'distributeFees',
      chainId,
    })
  }

  return (
    <Button
      className="col-span-2"
      onClick={distributeFees}
      disabled={isPending || isLoading || receipt?.status === 'success'}
    >
      {isPending || isLoading
        ? 'Loading...'
        : receipt?.status === 'success'
          ? 'Fees distributed'
          : 'Distribute Fees'}
    </Button>
  )
}

const IndexDTFSettings = () => {
  const indexDTF = useAtomValue(indexDTFAtom) as IndexDTF | null

  if (!indexDTF) return <div className="p-4 text-center">No data available</div>

  return (
    <div className="p-4 space-y-6">
      {/* General Information */}
      <Section title="General Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Row label="ID" value={indexDTF.id} />
          <Row label="Deployer" value={indexDTF.deployer} />
          <Row label="Owner" value={indexDTF.ownerAddress} />
          <Row label="Mandate" value={indexDTF.mandate} />
          <Row
            label="Minting Fee"
            value={formatPercentage(indexDTF.mintingFee * 100)}
          />
          <Row
            label="Annualized TVL Fee"
            value={formatPercentage(indexDTF.annualizedTvlFee * 100)}
          />
          <Row label="Auction Delay" value={`${indexDTF.auctionDelay} sec`} />
          <Row label="Auction Length" value={`${indexDTF.auctionLength} sec`} />
          <Row
            label="Total Revenue"
            value={`${formatCurrency(
              Number(formatEther(BigInt(indexDTF.totalRevenue)))
            )} ${indexDTF.token.symbol}`}
          />
          <Row
            label="Protocol Revenue"
            value={`${formatCurrency(
              Number(formatEther(BigInt(indexDTF.protocolRevenue)))
            )} ${indexDTF.token.symbol}`}
          />
          <Row
            label="Governance Revenue"
            value={`${formatCurrency(
              Number(formatEther(BigInt(indexDTF.governanceRevenue)))
            )} ${indexDTF.token.symbol}`}
          />
          <Row
            label="External Revenue"
            value={`${formatCurrency(
              Number(formatEther(BigInt(indexDTF.externalRevenue)))
            )} ${indexDTF.token.symbol}`}
          />
          <DistributeFees />
        </div>
      </Section>

      {/* Auction Details */}
      <Section title="Auction Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ArrayRow
            label="Auction Approvers"
            value={indexDTF.auctionApprovers}
          />
          <ArrayRow
            label="Auction Launchers"
            value={indexDTF.auctionLaunchers}
          />
          <ArrayRow label="Brand Managers" value={indexDTF.brandManagers} />
        </div>
      </Section>

      {/* Governance */}
      <Section title="Governance">
        {indexDTF.ownerGovernance ? (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Owner Governance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Row label="ID" value={indexDTF.ownerGovernance.id} />
              <Row
                label="Voting Delay"
                value={`${indexDTF.ownerGovernance.votingDelay} sec`}
              />
              <Row
                label="Voting Period"
                value={`${indexDTF.ownerGovernance.votingPeriod} sec`}
              />
              <Row
                label="Timelock ID"
                value={indexDTF.ownerGovernance.timelock.id}
              />
              <ArrayRow
                label="Guardians"
                value={indexDTF.ownerGovernance.timelock.guardians}
              />
              <Row
                label="Execution Delay"
                value={`${indexDTF.ownerGovernance.timelock.executionDelay} sec`}
              />
            </div>
          </div>
        ) : (
          <div className="text-base text-gray-800">
            No Owner Governance info
          </div>
        )}
        {indexDTF.tradingGovernance ? (
          <div>
            <h3 className="text-xl font-semibold mb-2">Trading Governance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Row label="ID" value={indexDTF.tradingGovernance.id} />
              <Row
                label="Voting Delay"
                value={`${indexDTF.tradingGovernance.votingDelay} sec`}
              />
              <Row
                label="Voting Period"
                value={`${indexDTF.tradingGovernance.votingPeriod} sec`}
              />
              <Row
                label="Timelock ID"
                value={indexDTF.tradingGovernance.timelock.id}
              />
              <ArrayRow
                label="Guardians"
                value={indexDTF.tradingGovernance.timelock.guardians}
              />
              <Row
                label="Execution Delay"
                value={`${indexDTF.tradingGovernance.timelock.executionDelay} sec`}
              />
            </div>
          </div>
        ) : (
          <div className="text-base text-gray-800">
            No Trading Governance info
          </div>
        )}
      </Section>

      {/* Token Information */}
      <Section title="Token Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Row label="Token ID" value={indexDTF.token.id} />
          <Row label="Name" value={indexDTF.token.name} />
          <Row label="Symbol" value={indexDTF.token.symbol} />
          <Row label="Decimals" value={indexDTF.token.decimals} />
          <Row
            label="Total Supply"
            value={formatCurrency(
              Number(
                formatUnits(
                  BigInt(indexDTF.token.totalSupply),
                  indexDTF.token.decimals
                )
              )
            )}
          />
        </div>
      </Section>

      {/* Staked Token Information (if any) */}
      {indexDTF.stToken && (
        <Section title="Staked Token Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Row label="St Token ID" value={indexDTF.stToken.id} />
            <Row label="Token Name" value={indexDTF.stToken.token.name} />
            <Row label="Token Symbol" value={indexDTF.stToken.token.symbol} />
            <Row label="Decimals" value={indexDTF.stToken.token.decimals} />
            <Row
              label="Total Supply"
              value={formatCurrency(
                Number(
                  formatUnits(
                    BigInt(indexDTF.stToken.token.totalSupply),
                    indexDTF.stToken.token.decimals
                  )
                )
              )}
            />
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-gray-600">
                Underlying
              </span>
              <div className="text-base text-gray-800">
                Name: {indexDTF.stToken.underlying.name} <br />
                Symbol: {indexDTF.stToken.underlying.symbol} <br />
                Address: {indexDTF.stToken.underlying.address} <br />
                Decimals: {indexDTF.stToken.underlying.decimals}
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  )
}

export default IndexDTFSettings
