export type Outlet = {
  _id: string;
  companyLogo: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  country: string;
  status: any;
  isActive: boolean;
  logo:string;
};

export type OutletFormValues = {
  name: string;
  address: string;
  city: string;
  region: string;
  country: any;
  phone: string;
  email: string;
  taxID: string;
  invoicePrefix: string;
  invoiceNumber: string;
  onlinePaymentAccountId: any;
  logo:string;
};
