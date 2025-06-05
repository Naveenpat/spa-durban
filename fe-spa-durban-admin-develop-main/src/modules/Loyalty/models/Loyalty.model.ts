export type Loyalty = {
  loyaltyProgramName: string;
  status: string;
  _id: string;
  isActive: boolean;
};

export type LoyaltyFormValues = {
  outlets: any;
  loyaltyProgramName: string;
};
