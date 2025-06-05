import mongoose, { Document, ObjectId } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";

export interface ProductDocument extends Document {
  _id: ObjectId;
  productName: string;
  productCode: string;
  categoryId: ObjectId;
  subCategoryId: ObjectId;
  brandId: ObjectId;
  productImageUrl: string;
  description: string;
  measurementUnitId: ObjectId;
  taxId: ObjectId;
  taxType: string;
  taxPercent: number;
  barcode: string;
  mrp: number;
  sellingPrice: number;
  purchasePrice: number;
  isDeleted: boolean;
  isActive: boolean;
  availableQuantity: number;
}

export interface ProductModel extends mongoose.Model<ProductDocument> {
  isBarcodeAlreadyExist(
    barcode: string,
    excludeCategoryId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
  isProductCodeAlreadyExist(
    productCode: string,
    excludeCategoryId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: ProductDocument[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
    search: string;
    dateFilter: DateFilter | undefined;
    filterBy: FilterByItem | undefined;
    rangeFilterBy: RangeFilter | undefined;
  }>;
}

const ProductSchema = new mongoose.Schema<ProductDocument>(
  {
    productName: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    productCode: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    taxId: {
      type: mongoose.Types.ObjectId,
      ref: "Tax",
      required: false,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      trim: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      trim: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      trim: true,
    },
    productImageUrl: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    measurementUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      trim: true,
    },
    barcode: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    mrp: {
      type: Number,
      required: false,
      trim: true,
    },
    sellingPrice: {
      type: Number,
      required: false,
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: false,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugin that converts mongoose to JSON
paginate(ProductSchema);

// // Apply the timestamp plugin to the Product schema
timestamp(ProductSchema);

// Static method to check if email is taken
ProductSchema.statics.isBarcodeAlreadyExist = async function (
  barcode: string,
  excludeCategoryId?: mongoose.Types.ObjectId
) {
  const category = await this.findOne({
    barcode,
    _id: { $ne: excludeCategoryId },
  });
  return !!category;
};
// Static method to check if email is taken
ProductSchema.statics.isProductCodeAlreadyExist = async function (
  productCode: string,
  excludeCategoryId?: mongoose.Types.ObjectId
) {
  const category = await this.findOne({
    productCode,
    _id: { $ne: excludeCategoryId },
  });
  return !!category;
};

export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["productName", "productCode", "barcode"];
const Product = mongoose.model<ProductDocument, ProductModel>(
  "Product",
  ProductSchema
);

export default Product;
