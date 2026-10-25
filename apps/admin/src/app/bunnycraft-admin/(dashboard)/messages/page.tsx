import type { Metadata } from "next";

import { MessagesManager } from "@/components/admin/messages-manager";
import { ContactMessage, NewsletterSubscriber, Op, contains } from "@bunnycraft/db";
import { parsePage, parseQuery, paginationMeta } from "@/lib/pagination";

export const metadata: Metadata = { title: "Admin — Messages" };

const PAGE_SIZE = 15;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    contactQ?: string;
    contactPage?: string;
    newsletterQ?: string;
    newsletterPage?: string;
  }>;
}) {
  const sp = await searchParams;
  const contactPage = parsePage(sp, "contactPage");
  const contactQ = parseQuery(sp, "contactQ");
  const newsletterPage = parsePage(sp, "newsletterPage");
  const newsletterQ = parseQuery(sp, "newsletterQ");

  const contactWhere = contactQ
    ? {
        [Op.or]: [
          { name: contains(contactQ) },
          { email: contains(contactQ) },
          { subject: contains(contactQ) },
        ],
      }
    : {};
  const newsletterWhere = newsletterQ ? { email: contains(newsletterQ) } : {};

  const [messages, messagesTotal, subscribers, subscribersTotal] = await Promise.all([
    ContactMessage.findAll({
      where: contactWhere,
      order: [["createdAt", "DESC"]],
      offset: (contactPage - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    ContactMessage.count({ where: contactWhere }),
    NewsletterSubscriber.findAll({
      where: newsletterWhere,
      order: [["createdAt", "DESC"]],
      offset: (newsletterPage - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    NewsletterSubscriber.count({ where: newsletterWhere }),
  ]);

  const plainMessages = messages.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    createdAt: m.createdAt.toISOString(),
  }));

  const plainSubscribers = subscribers.map((s) => ({
    id: s.id,
    email: s.email,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <MessagesManager
      initialMessages={plainMessages}
      initialSubscribers={plainSubscribers}
      messagesMeta={paginationMeta(contactPage, messagesTotal, PAGE_SIZE)}
      subscribersMeta={paginationMeta(newsletterPage, subscribersTotal, PAGE_SIZE)}
    />
  );
}
