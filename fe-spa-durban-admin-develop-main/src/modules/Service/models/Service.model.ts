export type Service = {
  serviceName: string;
  serviceCode: string;
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  serviceImageUrl: string;
  sellingPrice: number;
  createdAt: Date;
  isActive: boolean;
  status: any;
  _id: string;
};

export type ServiceFormValues = {
  serviceName: string;
  category: any;
  subCategory: any;
  serviceCode: string;
  sellingPrice: string;
  tax: any;
  outlets: any[];
  description: string;
  termsAndConditions: string;
  serviceImageUrl: string;
  products: any[];
  duration: string;
  cashback: string;
};
