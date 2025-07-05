import mongoose, { Document, ObjectId } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";

export interface RegisterDocument extends Document {
  openingBalance: number;
  outletId: ObjectId;
  isDeleted: boolean;
  isActive: boolean;
  isOpened: boolean;
  createdBy: ObjectId;
  _v:any;
}

export interface RegisterModel extends mongoose.Model<RegisterDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: RegisterDocument[];
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

const RegisterSchema = new mongoose.Schema<RegisterDocument>(
  {
    openingBalance: {
      type: Number,
      required: true,
      min: [0, "Balance cannot be negative"],
    },
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Outlet",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOpened: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add pagination and timestamp plugins
paginate(RegisterSchema);
timestamp(RegisterSchema);

export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["outletId"];

const Register = mongoose.model<RegisterDocument, RegisterModel>(
  "Register",
  RegisterSchema
);

export default Register;
