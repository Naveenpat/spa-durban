export type PromotionCoupons = {
  discountByPercentage: string;
  status: string;
  _id: string;
  isActive: boolean;
  createdAt:Date;
  endDate:Date;
  startDate:Date;
  groupTarget:string;
};

export type PromotionCouponsFormValues = {
  discountByPercentage: string;
  customerId: any;
  serviceId: any;
  startDate:Date;
  endDate:Date;
  groupTarget:[];
};
