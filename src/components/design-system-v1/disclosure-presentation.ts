export const disclosurePresentation = {
  trigger:
    'group flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-left text-foreground transition-colors duration-180 hover:text-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:text-muted-foreground',
  chevron:
    'size-4 shrink-0 text-muted-foreground transition-[color,transform] duration-180 group-hover:text-primary group-disabled:text-muted-foreground group-data-[state=open]:rotate-180 motion-reduce:transition-none',
  contentMotion:
    'overflow-hidden data-[state=closed]:animate-accordion-up-v1 data-[state=open]:animate-accordion-down-v1 motion-reduce:animate-none',
  content: '-mt-1 px-4 pb-2 text-muted-foreground',
} as const
