export type PromotionCoupons = {
  discountByPercentage: string;
  status: string;
  _id: string;
  isActive: boolean;
  createdAt:Date;
};

export type PromotionCouponsFormValues = {
  discountByPercentage: string;
  customerId: any;
  serviceId: any;
};
