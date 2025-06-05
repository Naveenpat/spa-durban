import mongoose, { Document, ObjectId } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";
export interface CashbackDocument extends Document {
  cashBackRulesName: string;
  howMuchCashback: number;
  cashBackDate: Date;
  serviceId: [ObjectId];
  isDeleted: boolean;
  isActive: boolean;
}

export interface CashbackModel extends mongoose.Model<CashbackDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: CashbackDocument[];
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

const CashbackSchema = new mongoose.Schema<CashbackDocument>(
  {
    cashBackRulesName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    howMuchCashback: {
      type: Number,
      required: true,
    },
    cashBackDate: {
      type: Date,
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
paginate(CashbackSchema);
timestamp(CashbackSchema);
export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["loyaltyProgramName"];
const Cashback = mongoose.model<CashbackDocument, CashbackModel>(
  "Cashback",
  CashbackSchema
);

export default Cashback;
