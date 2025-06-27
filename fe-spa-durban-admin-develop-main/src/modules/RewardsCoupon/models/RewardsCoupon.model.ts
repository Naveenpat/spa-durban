export type RewardsCoupon = {
  rewardsPoint: string;
  status: string;
  couponCode: string;
  _id: string;
  isActive: boolean;
  createdAt:Date;
};

export type RewardsCouponFormValues = {
  rewardsPoint: string;

  serviceId: any;
};
