import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import Spinner from './spinner'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,

}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: { children: 'Button' },
}

export const Accent: Story = {
  args: { variant: 'accent', children: 'Accent' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Destructive' },
}

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
}

export const OutlinePrimary: Story = {
  args: { variant: 'outline-primary', children: 'Outline Primary' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
}

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
}

export const GhostAccent: Story = {
  args: { variant: 'ghost-accent', children: 'Ghost Accent' },
}

export const LinkVariant: Story = {
  args: { variant: 'link', children: 'Link' },
}

export const Muted: Story = {
  args: { variant: 'muted', children: 'Muted' },
}

export const Circle: Story = {
  args: { variant: 'circle', children: '×' },
}

export const None: Story = {
  args: { variant: 'none', children: 'None' },
}

export const SizeXs: Story = {
  args: { size: 'xs', children: 'Extra Small' },
}

export const SizeSm: Story = {
  args: { size: 'sm', children: 'Small' },
}

export const SizeDefault: Story = {
  args: { size: 'default', children: 'Default' },
}

export const SizeLg: Story = {
  args: { size: 'lg', children: 'Large' },
}

export const SizeIcon: Story = {
  args: { size: 'icon', children: '★' },
}

export const SizeIconRounded: Story = {
  args: { size: 'icon-rounded', children: '★' },
}

export const SizeInline: Story = {
  args: { size: 'inline', variant: 'link', children: 'Inline link' },
}

export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
}

export const Loading: Story = {
  render: () => (
    <Button disabled>
      <Spinner className="mr-2" />
      Loading...
    </Button>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Default</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="outline-primary">Outline Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="ghost-accent">Ghost Accent</Button>
      <Button variant="link">Link</Button>
      <Button variant="muted">Muted</Button>
      <Button variant="circle">×</Button>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="default">Default</Button>
      <Button size="lg">LG</Button>
      <Button size="icon">★</Button>
      <Button size="icon-rounded">★</Button>
    </div>
  ),
}
