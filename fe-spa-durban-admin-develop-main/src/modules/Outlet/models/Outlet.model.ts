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
  companyName:any;
  createdAt:Date;
  viewSalesReport:string;
  viewOutletRegister:string;
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
  companyId:any;
 smtp: {
  host: string ,
  port:string,
  username:string,
  password:string,
  sendFrom:string,
  ccEmails:string,
  bccEmails:string
}
};
