import mongoose, { Document, ObjectId } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";
import validator from "validator";

export interface EmployeeDocument extends Document {
  _id: ObjectId;
  userName: string;
  email: string;
  name: string;
  phone: string;
  userRoleId: ObjectId;
  outletsId: [ObjectId];
  address: string;
  city: string;
  region: string;
  country: string;
  isDeleted: boolean;
  isActive: boolean;
}

export interface EmployeeModel extends mongoose.Model<EmployeeDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: EmployeeDocument[];
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

const EmployeeSchema = new mongoose.Schema<EmployeeDocument>(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
      ref: "User",
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 6,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      // required: true,
      trim: true,
    },
    userRoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: false,
      trim: true,
      default: null,
    },
    outletsId: {
      type: [mongoose.Schema.Types.ObjectId],
      // required: true,
      trim: true,
    },
    address: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
    },
    region: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
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
paginate(EmployeeSchema);

// // Apply the timestamp plugin to the Employee schema
timestamp(EmployeeSchema);

export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["email", "name"];
const Employee = mongoose.model<EmployeeDocument, EmployeeModel>(
  "Employee",
  EmployeeSchema
);

export default Employee;
