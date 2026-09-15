import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProductCartLine = {
  id: string;
  kind: "product";
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  material?: string;
  quantity: number;
};

export type CustomCartLine = {
  id: string;
  kind: "custom";
  fileName: string;
  fileType: string;
  fileUrl?: string;
  filamentId: string;
  filamentName: string;
  colorName?: string;
  heightMm: number;
  widthMm: number;
  depthMm: number;
  estWeightGrams: number;
  estPrintHours: number;
  unitPrice: number;
  previewImage?: string;
  quantity: number;
};

export type CartLine = ProductCartLine | CustomCartLine;

type CartState = {
  lines: CartLine[];
  couponCode: string | null;
  addProduct: (line: Omit<ProductCartLine, "id" | "kind">) => void;
  addCustom: (line: Omit<CustomCartLine, "id" | "kind">) => void;
  removeLine: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  setCouponCode: (code: string | null) => void;
  clear: () => void;
};

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      couponCode: null,
      addProduct: (line) =>
        set((state) => {
          const existing = state.lines.find(
            (l): l is ProductCartLine =>
              l.kind === "product" && l.productId === line.productId
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.id === existing.id
                  ? { ...l, quantity: l.quantity + line.quantity }
                  : l
              ),
            };
          }
          return {
            lines: [...state.lines, { ...line, id: makeId(), kind: "product" }],
          };
        }),
      addCustom: (line) =>
        set((state) => ({
          lines: [...state.lines, { ...line, id: makeId(), kind: "custom" }],
        })),
      removeLine: (id) =>
        set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.id === id ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        })),
      setCouponCode: (code) => set({ couponCode: code }),
      clear: () => set({ lines: [], couponCode: null }),
    }),
    { name: "bunnycraft-cart" }
  )
);

export function cartLineTotal(line: CartLine) {
  return line.unitPrice * line.quantity;
}

export function useCartCount() {
  return useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
}

export function useCartSubtotal() {
  return useCartStore((s) => s.lines.reduce((sum, l) => sum + cartLineTotal(l), 0));
}
