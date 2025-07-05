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
  cashUsageProofUrl:string;
  cashUsageReason:string;
  cashUsageAmount:string;
};

export type RegisterValue ={
  openedAt:Date;
  _id:string;
  openingBalance:number;
  carryForwardBalance:number;
  closeRegister:any;
  registerStatus:string;
  cashUsageReason:string;
  cashUsageProofUrl:string;
  bankDeposit:number;
  cashAmount:number;
  cashUsageAmount:string;
};