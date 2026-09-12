import type { Metadata } from "next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about ordering and custom 3D printing at BunnyCraft.",
};

const FAQS = [
  {
    q: "What file formats can I upload for a custom print?",
    a: "STL, OBJ, and 3MF are all supported for 3D models, and JPG or PNG if you're working from a reference image instead of a model.",
  },
  {
    q: "How is the price calculated?",
    a: "We estimate the printed volume from your dimensions, convert that to filament weight using your chosen material's density, then add material cost, machine time, and a flat finishing fee. You'll see every line item before you order.",
  },
  {
    q: "How long does printing take?",
    a: "Most custom orders leave our print farm within 2-3 business days. Larger or more complex prints may take longer — the estimated print time shown in the customize wizard reflects machine time, not shipping.",
  },
  {
    q: "Can I change my material after ordering?",
    a: "Reach out through the Contact page as soon as possible after ordering. We can usually accommodate material changes before a print has started.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we ship within the country only. International shipping is on our roadmap.",
  },
  {
    q: "What's your return policy?",
    a: "Stock products can be returned within 30 days in original condition. Custom prints are made to order and are final sale unless there's a defect or printing error on our end.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-center text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
