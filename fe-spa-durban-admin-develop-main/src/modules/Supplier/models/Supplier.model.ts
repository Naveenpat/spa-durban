export type Supplier = {
  supplierName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  country: string;
  taxId: string;
  status: any;
  isActive: boolean;
  _id: string;
};

export type SupplierFormValues = {
  supplierName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  country: any;
  taxId: string;
};
