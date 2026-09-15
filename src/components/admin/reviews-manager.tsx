"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StarIcon, TrashIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  photoUrl: string | null;
  createdAt: string;
  product: { name: string; slug: string };
};
type Meta = { page: number; pageCount: number; total: number; pageSize: number };

export function ReviewsManager({ initial, meta }: { initial: Review[]; meta: Meta }) {
  const router = useRouter();
  const [reviews, setReviews] = React.useState(initial);
  const [prevInitial, setPrevInitial] = React.useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setReviews(initial);
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn't delete that review.");
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Review deleted.");
    router.refresh();
  }

  return (
    <div>
      <h2 className="mb-4 font-heading text-lg font-semibold">Reviews</h2>
      <div className="mb-4">
        <AdminSearchBar placeholder="Search author or product…" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link href={`/shop/${r.product.slug}`} className="font-medium hover:underline">
                    {r.product.name}
                  </Link>
                </TableCell>
                <TableCell>{r.authorName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className="size-3.5"
                        fill={i < r.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {r.comment}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive">
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No reviews match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <AdminPagination {...meta} />
      </div>
    </div>
  );
}
