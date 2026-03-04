import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const EarnFAQ = ({
  title,
  faqs,
}: {
  title: string
  faqs: { question: string; answer: React.ReactNode }[]
}) => (
  <div className="mt-10">
    <h2 className="text-3xl font-semibold text-primary text-center mb-6">
      {title}
    </h2>
    <Accordion
      type="single"
      collapsible
      className="w-full border text-primary rounded-3xl overflow-hidden"
      defaultValue="item-1"
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
          <AccordionContent className="text-sm sm:text-base p-6">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
)

export default EarnFAQ
