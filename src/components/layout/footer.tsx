"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PackageSearchIcon, SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FacebookGlyph,
  InstagramGlyph,
  XGlyph,
  YoutubeGlyph,
} from "@/components/icons/social-icons";
import { FOOTER_LINKS, SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

const SOCIAL_ICONS = {
  Instagram: InstagramGlyph,
  Twitter: XGlyph,
  Youtube: YoutubeGlyph,
  Facebook: FacebookGlyph,
} as const;

export function Footer() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast.success("You're subscribed! Watch your inbox for BunnyCraft news.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="container-page grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-none bg-primary text-primary-foreground">
              <PackageSearchIcon className="size-4" />
            </span>
            <span className="font-heading text-lg font-bold">{SITE_NAME}</span>
          </Link>
          <p className="max-w-sm text-sm text-muted-foreground">
            Custom 3D printing made simple. Upload your design, choose your filament, and get an
            instant quote — precision printed and delivered to your door.
          </p>
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((s) => {
              const Icon = SOCIAL_ICONS[s.icon];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-sm font-semibold">Company</h3>
          {FOOTER_LINKS.company.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-sm font-semibold">Support</h3>
          {FOOTER_LINKS.support.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-sm font-semibold">Stay in the loop</h3>
          <p className="text-sm text-muted-foreground">
            Get new product drops and printing tips, no spam.
          </p>
          <form onSubmit={onSubscribe} className="flex gap-2">
            <Input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
            />
            <Button type="submit" size="icon" disabled={submitting} aria-label="Subscribe">
              <SendIcon className="size-4" />
            </Button>
          </form>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p>Designed & printed with care.</p>
        </div>
      </div>
    </footer>
  );
}
