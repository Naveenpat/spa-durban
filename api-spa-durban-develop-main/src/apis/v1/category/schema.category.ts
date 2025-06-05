import mongoose, { Document } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";

export interface CategoryDocument extends Document {
  categoryName: string;
  description: string;
  colorCode: string;
  isDeleted: boolean;
  isActive: boolean;
}

export interface CategoryModel extends mongoose.Model<CategoryDocument> {
  isCategoryExists(
    categoryName: string,
    excludeCategoryId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: CategoryDocument[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
    search: string;
    dateFilter: DateFilter | undefined;
    filterBy: FilterByItem | undefined;
    rangeFilterBy: RangeFilter | undefined;
    isPaginationRequired: boolean | undefined;
  }>;
}

const CategorySchema = new mongoose.Schema<CategoryDocument>(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    colorCode: {
      type: String,
      default: "",
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
paginate(CategorySchema);

// // Apply the timestamp plugin to the Category schema
timestamp(CategorySchema);

// Static method to check if email is taken
CategorySchema.statics.isCategoryExists = async function (
  categoryName: string,
  excludeCategoryId?: mongoose.Types.ObjectId
) {
  const category = await this.findOne({
    categoryName,
    _id: { $ne: excludeCategoryId },
  });
  return !!category;
};

export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["categoryName", "description"];
const Category = mongoose.model<CategoryDocument, CategoryModel>(
  "Category",
  CategorySchema
);

export default Category;
