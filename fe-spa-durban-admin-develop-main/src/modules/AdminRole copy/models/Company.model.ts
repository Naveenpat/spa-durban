export type Company = {
  companyName: string;
  email: string;
  phone: string;
  logo?: string;
  websiteUrl: string;
  createdAt: Date;
  _id: string;
};

export type CompanyFormValues = {
  companyName: string;
  email: string;
  phone: string;
  logo?: string;
  websiteUrl: string;
};
