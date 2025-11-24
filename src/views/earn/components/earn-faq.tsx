import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: 'What is vote-locking and how do I do it?',
    answer: (
      <div>
        <p className="mb-4">
          The vote lock is a feature that allows you to lock your vote for a
          certain period of time.
        </p>
        <p>
          Through token-weighted voting, lockers can weigh in on decisions like:
        </p>
        <ul className="list-disc list-inside ml-3">
          <li>Which tokens the index includes</li>
          <li>How tokens are weighted and/or rebalanced</li>
          <li>Which fees are charged</li>
          <li>Who can propose and/or veto changes</li>
        </ul>
      </div>
    ),
  },
  {
    question: 'How do I earn rewards?',
    answer: `You earn a pro-rata share of the DTF's fees (minting + TVL fees) based on how much and how long you lock. Rewards accrue automatically and can be claimed anytime in the app.`,
  },
  {
    question: 'Do I need to vote on proposals to earn rewards?',
    answer: `No — rewards are earned just for locking. But voting on proposals (like rebalancing the basket) keeps your influence active and supports the DTF's growth.`,
  },
  {
    question: 'Can I unlock my tokens anytime?',
    answer: `No, locked tokens follow the DTF's timelock rules (set during creation). Check the lock duration before committing. Early unlock is not allowed to prevent short-term manipulation.`,
  },
]

const EarnFAQ = () => {
  return (
    <div className="mt-10">
      <h2 className="text-3xl font-semibold text-primary text-center mb-6">
        Vote Lock Frequently Asked Questions
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
}

export default EarnFAQ
