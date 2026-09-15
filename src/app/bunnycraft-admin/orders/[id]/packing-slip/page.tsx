import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PrintButton } from "@/components/admin/print-button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Packing Slip" };

export default async function PackingSlipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/bunnycraft-admin/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">BunnyCraft</h1>
          <p className="text-sm text-muted-foreground">Packing Slip</p>
        </div>
        <PrintButton />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-semibold">Order</p>
          <p className="text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-muted-foreground">
            {order.createdAt.toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="font-semibold">Ship to</p>
          <p className="text-muted-foreground">
            {order.shippingName}
            <br />
            {order.shippingLine1}
            {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
            <br />
            {order.shippingCity}, {order.shippingState} {order.shippingZip}
            <br />
            {order.shippingCountry}
          </p>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-foreground/20 text-left">
            <th className="py-2">Item</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-foreground/10">
              <td className="py-2">{item.name}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">
                {formatCurrency(Number(item.unitPrice) * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex flex-col items-end gap-1 text-sm">
        <div className="flex w-48 justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(Number(order.subtotal))}</span>
        </div>
        {Number(order.discountTotal) > 0 && (
          <div className="flex w-48 justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>−{formatCurrency(Number(order.discountTotal))}</span>
          </div>
        )}
        <div className="flex w-48 justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{formatCurrency(Number(order.shippingTotal))}</span>
        </div>
        <div className="flex w-48 justify-between border-t border-foreground/20 pt-1 font-semibold">
          <span>Total</span>
          <span>{formatCurrency(Number(order.total))}</span>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Thank you for shopping with BunnyCraft!
      </p>
    </div>
  );
}
