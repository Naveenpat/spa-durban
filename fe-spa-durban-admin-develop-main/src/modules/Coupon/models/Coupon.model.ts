export type Coupon = {
  _id: string;
  type: any;
  userName: string;
  earnPoint: string;
  referralCode: string;
  discountAmount: string;
  quantity: string;
  isActive: boolean;
  status: any;
  valid: Date | null;
  note: string;
};

export type CouponFormValues = {
  type: any;
  user: any;
  earnPoint: any;
  referralCode: string;
  discountAmount: string;
  quantity: string;
  valid: Date | null;
  note: string;
};
