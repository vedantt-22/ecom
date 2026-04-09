export interface CartItemmodel {
  id:        number;
  quantity:  number;
  lineTotal: number;
  product: {
    id:       number;
    name:     string;
    price:    number;
    stock:    number;
    imageUrl: string;
  };
}

export interface Cartmodel {
  cartId:    number;
  items:     CartItemmodel[];
  total:     number;
  itemCount: number;
}