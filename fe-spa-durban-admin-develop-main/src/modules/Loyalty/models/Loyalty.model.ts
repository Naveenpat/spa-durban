export type Loyalty = {
  loyaltyProgramName: string;
  status: string;
  _id: string;
  isActive: boolean;
  createdAt:Date;
};

export type LoyaltyFormValues = {
  outlets: any;
  loyaltyProgramName: string;
};
