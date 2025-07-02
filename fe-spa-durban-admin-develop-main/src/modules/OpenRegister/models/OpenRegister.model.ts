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
  bankDeposit:any;
  reasons:any;
};

export type RegisterValue ={
  Date:Date;
  _id:string;
  openingBalance:number;
  carryForwardBalance:number;
};