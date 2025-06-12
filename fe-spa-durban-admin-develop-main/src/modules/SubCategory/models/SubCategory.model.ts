export type SubCategory = {
  categoryName: string;
  subCategoryName: string;
  description: string;
  _id: string;
  createdAt:Date;
};

export type SubCategoryFormValues = {
  categoryName: any;
  subCategoryName: string;
  description: string;
};
