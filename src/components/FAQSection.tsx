import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

const faqs = [
  {
    question: "What is Aether's return policy?",
    answer: "We offer a 14-day imperfect alignment guarantee. If your headwear doesn't fit your vibe, return it unworn for a full refund or exchange. Custom bespoke pieces are final sale."
  },
  {
    question: "How long does shipping take?",
    answer: "Inside Dhaka: 1-2 business days. Outside Dhaka: 2-3 business days. We use Pathao Merchant Delivery to ensure your pieces arrive securely."
  },
  {
    question: "Are your materials sustainably sourced?",
    answer: "Yes. We source our cotton and linen blends from sustainable farms, ensuring our imperfect aesthetics leave a minimal footprint on the earth."
  },
  {
    question: "Can I wash my Aether headwear?",
    answer: "Only dry wash."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Currently, we only ship within Bangladesh. We are working on expanding our logistics to support international orders in the future."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center mb-10">
        <MessageCircleQuestion className="w-8 h-8 text-white/50 mx-auto mb-3" />
        <h2 className="font-serif italic text-2xl md:text-3xl text-white mb-2">Curious Minds</h2>
        <p className="font-mono text-xs tracking-widest uppercase text-white/50">Frequently Asked Questions</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/10"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
            >
              <h3 className="font-sans font-medium text-white/90 pr-4">{faq.question}</h3>
              <ChevronDown 
                className={`w-5 h-5 text-white/50 transition-transform duration-300 shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} 
              />
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-6 pb-5 font-sans text-sm text-white/60 leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
