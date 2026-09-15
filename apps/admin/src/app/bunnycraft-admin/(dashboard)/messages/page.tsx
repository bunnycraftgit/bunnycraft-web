import type { Metadata } from "next";

import { MessagesManager } from "@/components/admin/messages-manager";
import { prisma } from "@bunnycraft/db";
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
    ? { OR: [{ name: { contains: contactQ } }, { email: { contains: contactQ } }, { subject: { contains: contactQ } }] }
    : {};
  const newsletterWhere = newsletterQ ? { email: { contains: newsletterQ } } : {};

  const [messages, messagesTotal, subscribers, subscribersTotal] = await Promise.all([
    prisma.contactMessage.findMany({
      where: contactWhere,
      orderBy: { createdAt: "desc" },
      skip: (contactPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.contactMessage.count({ where: contactWhere }),
    prisma.newsletterSubscriber.findMany({
      where: newsletterWhere,
      orderBy: { createdAt: "desc" },
      skip: (newsletterPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.newsletterSubscriber.count({ where: newsletterWhere }),
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
