declare global {
  type Product = {
    productImageUrl: string;
    productName: string;
    categoryName: string;
    subCategoryName: string;
    brandName: string;
    unitName: string;
    purchasePrice: string;
    mrp: string;
    sellingPrice: string;
    productCode: string;
    barcode: string;
    description: string;
    isActive: boolean;
    status: any;
    _id: string;
  };
  type ProductFormValues = {
    productName: string;
    productCode: string;
    categoryId: any;
    subCategoryId: any;
    brandId: any;
    productImageUrl: string;
    description: string;
    measurementUnitId: any;
    barcode: string;
    mrp: string;
    sellingPrice: string;
    purchasePrice: string;
    tax: any;
  };
}

export {};
