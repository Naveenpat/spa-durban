export type SalesInvoicesFormValues = {
  name?: string;
  voidNote?: string;
  status?: string;
};
export type SalesInvoices = {
  invoiceNumber: string;
  customer: string;
  customerName: string;
  createdAt: string;
  totalAmount: string;
  balanceDue: number;
  status: string;
  action?: any;
  _id: string;
};
export type SalesComparisonList = {
  invoiceNumber: string;
  customer: string;
  outletName:string;
  totalSales:any;
  customerName: string;
  createdAt: string;
  totalAmount: string;
  balanceDue: number;
  status: string;
  action?: any;
  _id: string;
};