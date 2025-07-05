import mongoose, { Document, ObjectId } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";

export interface CloseRegisterDocument extends Document {
  outletId: ObjectId;
  createdBy: ObjectId;
  date: Date;
  bankDeposit: number;
  carryForwardBalance: number;
  closeRegister: {
    // _id: ObjectId;
    totalAmount: number;
    paymentModeName: string;
    manual: string;
    reason:string;
  }[];
  openRegisterId:ObjectId;
  isDeleted: boolean;
  isActive: boolean;
  createdAt:Date;
}

export interface CloseRegisterModel
  extends mongoose.Model<CloseRegisterDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: CloseRegisterDocument[];
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

const CloseRegisterSchema = new mongoose.Schema<CloseRegisterDocument>(
  {
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Outlet",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    bankDeposit: {
      type: Number,
      default: 0,
    },
    carryForwardBalance: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    closeRegister: [
      {
        // _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        totalAmount: { type: Number, required: true, min: 0 },
        paymentModeName: { type: String, required: true },
        manual: { type: String, required: true },
        reason: { type: String,default:'' }
      },
    ],
    openRegisterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "registers",
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
paginate(CloseRegisterSchema);
timestamp(CloseRegisterSchema);

export const allowedDateFilterKeys = ["createdAt", "updatedAt", "date"];
export const searchKeys = ["outletId"];

const CloseRegister = mongoose.model<CloseRegisterDocument, CloseRegisterModel>(
  "CloseRegister",
  CloseRegisterSchema
);

export default CloseRegister;
