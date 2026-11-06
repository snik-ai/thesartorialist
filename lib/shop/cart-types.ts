export type CartLine = {
  id: string;
  quantity: number;
  total: number;
  variantId: string;
  size: string | null;
  price: number;
  image: string | null;
  handle: string;
  title: string;
};

export type CartData = {
  id: string;
  count: number;
  checkoutUrl: string;
  subtotal: number;
  lines: CartLine[];
};
