export type PaymentMode = {
  modeName: string;
  type: string;
  isActive: boolean;
  status: any;
  _id: string;
  createdAt:Date;
};

export type PaymentModeFormValues = {
  modeName: string;
  type: any;
};
