import { useRef, useState } from 'react'
import { DialogTaskHeader } from './dialog-task-header'
import { ASSET_INFORMATION_EXAMPLES } from './asset-information-fixtures'
import { AssetInformationOverview } from './asset-information-overview'
import { Button } from '@/components/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/design-system-v1/tabs'
import { v1Typography } from '@/components/design-system-v1/typography'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogTrigger,
} from '@/components/dialog'
import { cn } from '@/lib/utils'

export const BridgeInformationDialog = ({
  example: exampleKey = 'nvidia',
}: {
  example?: keyof typeof ASSET_INFORMATION_EXAMPLES
}) => {
  const [tab, setTab] = useState('overview')
  const risksRef = useRef<HTMLButtonElement>(null)
  const example = ASSET_INFORMATION_EXAMPLES[exampleKey]

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setTab('overview')
      }}
    >
      <DialogTrigger asChild>
        <Button tone="secondary">{example.title}</Button>
      </DialogTrigger>
      <DialogContent width="standard" aria-describedby={undefined}>
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex min-h-0 flex-col"
        >
          <DialogTaskHeader title={example.title} />
          <div className="px-4 pt-2">
            <TabsList width="full" aria-label={example.title}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="risks" ref={risksRef}>
                Risks
              </TabsTrigger>
            </TabsList>
          </div>
          <DialogBody key={tab}>
            <TabsContent value="overview">
              <AssetInformationOverview
                example={example}
                onRisks={() => {
                  setTab('risks')
                  risksRef.current?.focus()
                }}
              />
            </TabsContent>
            <TabsContent value="risks" className="space-y-4 py-4">
              <h3 className={v1Typography.itemTitle}>
                Potential Risks Using {example.provider.name}
              </h3>
              <ul
                className={cn(
                  'space-y-4 text-muted-foreground',
                  v1Typography.supporting
                )}
              >
                {example.provider.risks.map((risk) => {
                  const [title, ...description] = risk.split(' - ')
                  return (
                    <li key={risk}>
                      <span className="font-medium text-foreground">
                        {title}
                      </span>
                      {description.length > 0 &&
                        ` - ${description.join(' - ')}`}
                    </li>
                  )
                })}
              </ul>
            </TabsContent>
          </DialogBody>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
