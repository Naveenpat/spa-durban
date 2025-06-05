type Product = {
  productId: string;
  quantity: number;
  rate: number;
  tax: string;
  discount: number;
  amount: number;
  description: string;
  _id: string;
  productName: string;
  productCode: string;
  taxType: string;
  taxPercent: number;
};

export enum PaymentStatus {
  COMPLETED = 'Paid',
  PENDING = 'Unpaid',
}

export type PurchaseOrder = {
  _id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  reference: string;
  orderDate: string;
  payableAmount: number;
  shippingCharges: number;
  totalTax: number;
  totalDiscount: number;
  amountPaid: number;
  dueAmount: number;
  isInventoryIn: boolean;
  paymentStatus: keyof typeof PaymentStatus;
  orderStatus: string;
  dueDate: string;
  discountType: string;
  products: Product[];
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrderFormValues = {
  supplier: any;
  invoiceNumber: string;
  orderDate: Date | null;
  shippingCharges: string;
  amountPaid: string;

  productDetails: {
    product: any;
    quantity: string;
    rate: string;
    discount: string;
    discountType: 'FLAT' | 'PERCENT';
  }[];
};

export type PaymentInFormValues = {
  amount: string;
};
