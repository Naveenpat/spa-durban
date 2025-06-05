export type GiftCard = {
  customerName: string;
  type: string;
  giftCardName: string;
  giftCardAmount: number;
  createdAt: string;
  giftCardExpiryDate: string;
  giftCardCode: string;
  isActive: boolean;
  status: any;
  _id: string;
};

export type GiftCardFormValues = {
  type: string;
  customerId: any;
  giftCardName: string;
  giftCardAmount: string;
  giftCardExpiryDate: any;
};
