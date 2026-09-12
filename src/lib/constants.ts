export { CATEGORIES } from "@/lib/catalog-data";

export const SITE_NAME = "BunnyCraft";

export const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Customize", href: "/customize" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_LINKS = {
  company: [
    { label: "About BunnyCraft", href: "/about" },
    { label: "Shop", href: "/shop" },
    { label: "Custom Printing", href: "/customize" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Track Order", href: "/account/orders" },
  ],
} as const;

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: "Instagram" },
  { label: "X", href: "https://x.com", icon: "Twitter" },
  { label: "YouTube", href: "https://youtube.com", icon: "Youtube" },
  { label: "Facebook", href: "https://facebook.com", icon: "Facebook" },
] as const;
