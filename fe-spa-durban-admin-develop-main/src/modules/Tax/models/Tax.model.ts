export type Tax = {
  taxType: string;
  taxPercent: number;
  _id: string;
  createdAt:Date;
};

export type TaxFormValues = {
  taxType: any;
  taxPercent: string;
};
