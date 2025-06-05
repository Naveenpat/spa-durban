export type UserProfile = {
  name: string;
  email: string;
  age: number;
  amount: number;
  _id: string;
};

export type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type UserProfileFormValues = {
  name: string;
  email: string;
  mobile: string;
  altMobile: string;
  language: string;
  city: string;
  postBox: string;
  country: string;
  address: string;
  signatureUrl: string;
  photoUrl: string;
};

export type trasactionListingType = {
  date: string;
  debit: string;
  credit: string;
  account: string;
  payer: string;
  method: string;
  action?: string;
};
