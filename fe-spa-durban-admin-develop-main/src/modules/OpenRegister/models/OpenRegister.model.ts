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
  bankDeposit: any;
  reasons: any;
 cashUsages: [{
    reason: string;
    amount: string;
    proofUrl: string;
    createdAt: Date;
  }];
};

export type RegisterValue = {
  openedAt: Date;
  _id: string;
  openingBalance: number;
  carryForwardBalance: number;
  closeRegister: any;
  registerStatus: string;
  bankDeposit: number;
  cashAmount: number;
  cashUsageProofUrl:string;
  cashUsageReason:string;
  actions:any;
   cashUsages: [{
    reason: string;
    amount: string;
    proofUrl: string;
    createdAt: Date;
  }];
};