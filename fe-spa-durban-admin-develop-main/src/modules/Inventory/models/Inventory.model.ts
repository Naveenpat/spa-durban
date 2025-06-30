export type Inventory = {
  productId: string;
  productName: string;
  totalPrice: number;
  totalQuantity: number;
  availableQunatity: number;
  _id: string;
  createdAt:Date;
  outletName:string;
  invoiceNumber:any;
};

export type InventoryFormValues = {
  product: any;
  purchasePrice: string;
  quantityValue: any;
  dewasQty: string;
  indoreQty: string;
  bhopalQty: string;
};
