export type Customer = {
  _id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  country: string;
  taxNo: string;
  dateOfBirth: string;
  gender: any;
  status: any;
  loyaltyPoints: string;
  isActive: boolean;
};

export type CustomerFormValues = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  country: any;
  taxNo: string;
  dateOfBirth: Date | null;
  gender: any;
};
