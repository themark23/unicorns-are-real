import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
  accentColor?: string;
}

export default function FaqSection({ items, accentColor = "rgba(139, 92, 246, 0.25)" }: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3" data-testid="faq-section">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: isOpen ? "rgba(30, 20, 60, 0.7)" : "rgba(20, 14, 45, 0.5)",
              border: `1px solid ${isOpen ? accentColor : "rgba(139, 92, 246, 0.1)"}`,
              transition: "all 0.2s ease",
            }}
          >
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
              onClick={() => setOpen(isOpen ? null : i)}
              data-testid={`faq-toggle-${i}`}
            >
              <span
                className="text-base font-medium pr-4"
                style={{ color: isOpen ? "hsl(270, 60%, 88%)" : "hsl(270, 20%, 80%)" }}
              >
                {item.question}
              </span>
              <span
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full"
                style={{ background: accentColor, color: isOpen ? "hsl(270, 75%, 80%)" : "hsl(270, 20%, 65%)" }}
              >
                {isOpen ? <Minus size={13} /> : <Plus size={13} />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p
                    className="px-6 pb-5 text-sm leading-relaxed"
                    style={{ color: "hsl(265, 15%, 60%)" }}
                    data-testid={`faq-answer-${i}`}
                  >
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
