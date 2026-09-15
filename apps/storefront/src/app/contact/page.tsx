import type { Metadata } from "next";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the BunnyCraft team.",
};

const DETAILS = [
  { icon: MailIcon, label: "hello@bunnycraft.com" },
  { icon: PhoneIcon, label: "(555) 010-2024" },
  { icon: MapPinIcon, label: "Austin, TX" },
];

export default function ContactPage() {
  return (
    <div className="container-page py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold sm:text-4xl">Get in Touch</h1>
          <p className="mt-3 text-muted-foreground">
            Questions about an order, a custom project, or bulk pricing? Send a message and
            we&apos;ll reply within one business day.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {DETAILS.map((d) => (
              <div key={d.label} className="flex items-center gap-3 text-sm">
                <div className="flex size-9 items-center justify-center rounded-none bg-primary/10 text-primary">
                  <d.icon className="size-4" />
                </div>
                {d.label}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
