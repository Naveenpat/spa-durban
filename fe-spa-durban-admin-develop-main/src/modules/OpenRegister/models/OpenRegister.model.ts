export type Register = {
  registerId: string;
  openingBalance: number;
  _id: string;
};

export type OpenRegisterFormValues = {
  registerId?: any;
  openingBalance: string;
};

export type PaymentMode = {
  manual: any;
  _id: string;
  totalAmount: number;
  paymentModeName: string;
};
