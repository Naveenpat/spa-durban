export type Employee = {
  name: string;
  email: string;
  roleName: string;
  outletNames: string;
  isActive: boolean;
  status: any;
  companyName:any;
  createdAt:Date;
  _id: string;
};

export type EmployeeFormValues = {
  userName: string;
  email: string;
  password: string;
  userRoleId: any;
  outletsId?: any;
  name: string;
  address: string;
  city: string;
  region: string;
  country: any;
  phone: string;
  companyId?:any;
};
