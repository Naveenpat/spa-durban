export type Account = {
  accountNumber: any;
  accountName: string;
  note: string;
  _id: string;
  isActive: boolean;
  status: any;
};

export type AccountFormValues = {
  accountName: '';
  accountNumber: '';
  note: '';
  isActive?: boolean;
};
