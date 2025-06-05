export type PromotionCoupons = {
  discountByPercentage: string;
  status: string;
  _id: string;
  isActive: boolean;
};

export type PromotionCouponsFormValues = {
  discountByPercentage: string;
  customerId: any;
  serviceId: any;
};
