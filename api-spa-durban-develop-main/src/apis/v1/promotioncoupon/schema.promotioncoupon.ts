import mongoose, { Document, ObjectId, Types } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";

export interface PromotionCouponDocument extends Document {
  discountByPercentage: number;
  couponCode: string;
  serviceId: [ObjectId];
  customerId: [ObjectId];
  startDate: Date;
  endDate: Date;
  isDeleted: boolean;
  isActive: boolean;
  groupTarget: [String];
  usedBy: Types.ObjectId[];
}

export interface PromotionCouponModel
  extends mongoose.Model<PromotionCouponDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: PromotionCouponDocument[];
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

const PromotionCouponSchema = new mongoose.Schema<PromotionCouponDocument>(
  {
    discountByPercentage: {
      type: Number,
      required: true,
      trim: true,
      lowercase: true,
    },
    couponCode: {
      type: String,
      required: true,
    },
    serviceId: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
    },
    customerId: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    groupTarget: {
      type: [String], // Use [String] instead of Array for clarity
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer',default:[] }]
  },
  {
    timestamps: true,
  }
);

// Add pagination and timestamp plugins
paginate(PromotionCouponSchema);
timestamp(PromotionCouponSchema);
export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["promotionProgramName"];
const PromotionCoupon = mongoose.model<
  PromotionCouponDocument,
  PromotionCouponModel
>("PromotionCoupon", PromotionCouponSchema);

export default PromotionCoupon;
