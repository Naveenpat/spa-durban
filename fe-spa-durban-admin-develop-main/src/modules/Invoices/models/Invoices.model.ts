export type InvoicesFormValues = {
  name?: string;
  voidNote?: string;
  status?: string;
};
export type Invoices = {
  invoiceNumber: string;
  customer: string;
  customerName: string;
  createdAt: string;
  totalAmount: string;
  balanceDue: number;
  status: string;
  action?: any;
  voidNote:any;
  giftCardCode:any;
  giftCardDiscount:any;
  _id: string;
};
export type SalesReport = {
  invoiceNumber: string;
  outletName:string;
  customer: string;
  customerName: string;
  createdAt: string;
  totalAmount: string;
  balanceDue: number;
  status: string;
  action?: any;
  _id: string;
  cashBackEarned:number;
  showItemModal:string;
};
