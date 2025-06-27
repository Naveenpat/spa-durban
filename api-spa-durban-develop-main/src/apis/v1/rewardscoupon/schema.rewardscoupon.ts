import mongoose, { Document, ObjectId, Types } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";

export interface RewardsCouponDocument extends Document {
  rewardsPoint: number;
  couponCode: string;
  serviceId: [ObjectId];
  isDeleted: boolean;
  isActive: boolean;
  createdAt:Date;
  usedBy: Types.ObjectId[];
}

export interface RewardsCouponModel
  extends mongoose.Model<RewardsCouponDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: RewardsCouponDocument[];
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

const RewardsCouponSchema = new mongoose.Schema<RewardsCouponDocument>(
  {
    rewardsPoint: {
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer',default:[] }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add pagination and timestamp plugins
paginate(RewardsCouponSchema);
timestamp(RewardsCouponSchema);
export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["loyaltyProgramName"];
const RewardsCoupon = mongoose.model<RewardsCouponDocument, RewardsCouponModel>(
  "RewardsCoupon",
  RewardsCouponSchema
);

export default RewardsCoupon;
