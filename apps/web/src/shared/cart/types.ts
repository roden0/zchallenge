export type CartLine = {
  lineId: string;
  productId: string;
  brand: string;
  name: string;
  imageUrl: string;
  storage: { capacity: string; price: number };
  color: { name: string; hexCode: string };
};

export type NewCartLine = Omit<CartLine, 'lineId'>;

export type CartState = { lines: CartLine[] };

export type CartAction =
  | { type: 'add'; line: CartLine }
  | { type: 'remove'; lineId: string }
  | { type: 'replace'; lines: CartLine[] };
