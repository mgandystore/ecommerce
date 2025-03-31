// Props for the FAQ component
import {Faq} from "@/pages/types";
import {useState} from "react";
import {Minus, Plus} from "lucide-react";

type FAQSectionProps = {
  faqs: Faq[];
};

function FAQSection({ faqs }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="py-12 px-6 max-sm:py-8">
      <div className="max-w-screen-lg mx-auto">
        <h2 className="text-emerald-700 text-2xl font-bold mb-8 align-items-center">Questions fréquentes</h2>

        <div className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="rounded-lg overflow-hidden bg-gray-50"
          >
            <button
              onClick={() => toggleItem(faq.id)}
              className="cursor-pointer w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
            >
              <span className="font-medium text-stone-800">{faq.key}</span>
              <span className={`flex-shrink-0 ml-2 p-1 rounded-full ${openItems[faq.id] ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'} transition-colors duration-300`}>
                {openItems[faq.id] ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${openItems[faq.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              style={{ visibility: openItems[faq.id] ? 'visible' : 'hidden' }}
            >
              <div className="px-6 py-4 text-gray-600">
                <span className="text-sm" dangerouslySetInnerHTML={{ __html: faq.value }} />
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection
