import Link from "next/link";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-12">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        <nav className="flex shrink-0 gap-1 overflow-x-auto sm:w-48 sm:flex-col">
          <Link
            href="/account"
            className="rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-muted"
          >
            Profile
          </Link>
          <Link
            href="/account/orders"
            className="rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-muted"
          >
            Orders
          </Link>
          <Link
            href="/wishlist"
            className="rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-muted"
          >
            Wishlist
          </Link>
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
