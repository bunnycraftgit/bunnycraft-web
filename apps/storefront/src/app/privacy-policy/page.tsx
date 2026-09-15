import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BunnyCraft collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated July 2026</p>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-2 font-heading text-base font-semibold text-foreground">
              Information we collect
            </h2>
            <p>
              When you create an account, place an order, or upload a file for a custom print, we
              collect your name, email address, shipping address, and the files or dimensions you
              provide. We never collect payment card details directly — those are handled by our
              payment processor.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-heading text-base font-semibold text-foreground">
              How we use it
            </h2>
            <p>
              Your information is used to fulfill orders, send order and shipping updates,
              respond to support requests, and — only if you opt in — send occasional product
              updates by email. Uploaded model files are used solely to produce your print.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-heading text-base font-semibold text-foreground">Cookies</h2>
            <p>
              We use essential cookies to keep you signed in and to remember your cart. We don&apos;t
              use third-party advertising trackers.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-heading text-base font-semibold text-foreground">
              Your choices
            </h2>
            <p>
              You can update or delete your account information at any time from your account
              page, or unsubscribe from marketing emails via the link in any newsletter. Contact
              us if you&apos;d like your data removed entirely.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
