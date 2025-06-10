import mongoose, { Document, ObjectId } from "mongoose";
import validator from "validator";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import { DateFilter, FilterByItem, RangeFilter } from "../../../utils/interface"

export interface CompanyDocument extends Document {
  _id: ObjectId;
  companyName: string;
  email: string;
  phone: string;
  logo?: string; // URL or file path
  isDeleted: boolean;
  isActive: boolean;
}

export interface CompanyModel extends mongoose.Model<CompanyDocument> {}

export interface CompanyModel extends mongoose.Model<CompanyDocument> {
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: CompanyDocument[];
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

const CompanySchema = new mongoose.Schema<CompanyDocument>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      unique:true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique:true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address");
        }
      },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique:true
    },
    logo: {
      type: String,
      unique:true,
      trim: true,
      default: null,
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

// Plugins
timestamp(CompanySchema);
paginate(CompanySchema);
export const allowedDateFilterKeys = ["createdAt", "updatedAt"]
export const searchKeys = ["companyName"]
const Company = mongoose.model<CompanyDocument, CompanyModel>(
  "Company",
  CompanySchema
);

export default Company;
