export type Category = {
  categoryName: string;
  description: string;
  totalProducts: number;
  stockQuantity: number;
  worth: number;
  _id: string;
};

export type CategoryFormValues = {
  categoryName: string;
  description: string;
  colorCode?:string;
};
