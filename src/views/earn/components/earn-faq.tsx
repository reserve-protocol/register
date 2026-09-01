import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useEffect, useState } from 'react'

const EarnFAQ = ({
  title,
  faqs,
  onOpenChange,
  openItem,
}: {
  title: string
  faqs: { question: string; answer: React.ReactNode }[]
  onOpenChange?: (index: number) => void
  // One-shot open command; pass a fresh object per request so it retriggers
  openItem?: { index: number }
}) => {
  const [value, setValue] = useState('item-1')

  useEffect(() => {
    if (openItem) setValue(`item-${openItem.index + 1}`)
  }, [openItem])

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    const index = Number(newValue.replace('item-', '')) - 1
    if (index >= 0) onOpenChange?.(index)
  }

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-semibold text-primary text-center mb-6">
        {title}
      </h2>
      <Accordion
        type="single"
        collapsible
        className="w-full border text-primary rounded-3xl overflow-hidden"
        value={value}
        onValueChange={handleValueChange}
      >
        {faqs.map((faq, index) => (
          <AccordionItem
            value={`item-${index + 1}`}
            key={index}
            className="[&[data-state=open]]:bg-secondary"
          >
            <AccordionTrigger className="p-6 text-base sm:text-2xl [&[data-state=open]]:border-b text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base p-6 text-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default EarnFAQ
