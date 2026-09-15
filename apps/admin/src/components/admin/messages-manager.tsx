"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EyeIcon, TrashIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};
type Subscriber = { id: string; email: string; createdAt: string };
type Meta = { page: number; pageCount: number; total: number; pageSize: number };

export function MessagesManager({
  initialMessages,
  initialSubscribers,
  messagesMeta,
  subscribersMeta,
}: {
  initialMessages: ContactMessage[];
  initialSubscribers: Subscriber[];
  messagesMeta: Meta;
  subscribersMeta: Meta;
}) {
  const router = useRouter();
  const [messages, setMessages] = React.useState(initialMessages);
  const [prevInitialMessages, setPrevInitialMessages] = React.useState(initialMessages);
  if (initialMessages !== prevInitialMessages) {
    setPrevInitialMessages(initialMessages);
    setMessages(initialMessages);
  }

  const [subscribers, setSubscribers] = React.useState(initialSubscribers);
  const [prevInitialSubscribers, setPrevInitialSubscribers] = React.useState(initialSubscribers);
  if (initialSubscribers !== prevInitialSubscribers) {
    setPrevInitialSubscribers(initialSubscribers);
    setSubscribers(initialSubscribers);
  }

  const [viewing, setViewing] = React.useState<ContactMessage | null>(null);

  async function removeMessage(id: string) {
    const res = await fetch(`/api/admin/contact-messages/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn't delete that message.");
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    toast.success("Message deleted.");
    router.refresh();
  }

  async function removeSubscriber(id: string) {
    const res = await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn't remove that subscriber.");
      return;
    }
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    toast.success("Subscriber removed.");
    router.refresh();
  }

  return (
    <div>
      <h2 className="mb-4 font-heading text-lg font-semibold">Messages</h2>
      <Tabs defaultValue="contact">
        <TabsList>
          <TabsTrigger value="contact">Contact ({messagesMeta.total})</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter ({subscribersMeta.total})</TabsTrigger>
        </TabsList>

        <TabsContent value="contact">
          <div className="mb-4">
            <AdminSearchBar placeholder="Search name, email, subject…" paramName="contactQ" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{m.subject}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setViewing(m)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <EyeIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => removeMessage(m.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {messages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      No contact messages match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <AdminPagination {...messagesMeta} pageParam="contactPage" />
          </div>
        </TabsContent>

        <TabsContent value="newsletter">
          <div className="mb-4">
            <AdminSearchBar placeholder="Search email…" paramName="newsletterQ" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeSubscriber(s.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {subscribers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                      No subscribers match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <AdminPagination {...subscribersMeta} pageParam="newsletterPage" />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.subject}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-muted-foreground">
              From <span className="font-medium text-foreground">{viewing?.name}</span> ·{" "}
              <a href={`mailto:${viewing?.email}`} className="hover:underline">
                {viewing?.email}
              </a>
            </p>
            <p className="whitespace-pre-wrap">{viewing?.message}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
