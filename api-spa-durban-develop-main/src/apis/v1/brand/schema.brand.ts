import mongoose, { Document } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";

export interface BrandDocument extends Document {
  brandName: string;
  description: string;
  isDeleted: boolean;
  isActive: boolean;
}

export interface BrandModel extends mongoose.Model<BrandDocument> {
  isbrandTaken(
    brandName: string, // Changed to 'brandName'
    excludebrandId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: BrandDocument[];
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

const BrandSchema = new mongoose.Schema<BrandDocument>(
  {
    brandName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: { type: String, default: "", trim: true, lowercase: true },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

paginate(BrandSchema);
timestamp(BrandSchema);

BrandSchema.statics.isbrandTaken = async function (
  brandName: string, // Changed to 'brandName'
  excludebrandId?: mongoose.Types.ObjectId
) {
  const brandFound = await this.findOne({
    brandName, // Use 'brandName' as defined in the schema
    _id: { $ne: excludebrandId },
  }).exec(); // Ensure `.exec()` is used for the promise-based syntax

  return !!brandFound;
};

export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["brandName", "description"];

const Brand = mongoose.model<BrandDocument, BrandModel>("Brand", BrandSchema);

export default Brand;
