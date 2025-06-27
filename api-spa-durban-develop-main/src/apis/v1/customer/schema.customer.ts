import mongoose, { Document, Model } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import validator from "validator";
import { format } from "date-fns";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";
import { CustomerTypeEnum, GenderTypeEnum } from "../../../utils/enumUtils";

export interface CustomerDocument extends Document {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  country: string;
  taxNo: string;
  dateOfBirth: Date;
  gender: string;
  loyaltyPoints: number;
  customerType: string;
  isDeleted: boolean;
  isActive: boolean;
  bookingCustomerId: string;
  cashBackAmount: number;
  customerGroup:string;
}

export interface CustomerModel extends mongoose.Model<CustomerDocument> {
  isEmailTaken(
    email: string,
    excludeCustomerId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
  isPhoneTaken(
    phone: string,
    excludeCustomerId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: CustomerDocument[];
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

const CustomerSchema = new mongoose.Schema<CustomerDocument>(
  {
    customerName: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      // required: true,
      trim: true,
    },
    email: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
      minlength: 6,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    address: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    region: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    taxNo: {
      type: String,
      default: "",
      trim: true,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      // required: true,
      trim: true,
      // validate(value: string) {
      //   const formattedDate = format(value, "yyyy-MM-dd HH:mm:ss");
      //   return formattedDate;
      // },
    },
    gender: {
      type: String,
      enum: [GenderTypeEnum.male, GenderTypeEnum.female, GenderTypeEnum.other],
      // required: true,
      trim: true,
    },
    customerGroup:{
      type:String,
      required:true
    },
    customerType: {
      type: String,
      enum: [CustomerTypeEnum.walkin, CustomerTypeEnum.regular],
      default: CustomerTypeEnum.regular,
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
    bookingCustomerId: {
      type: String,
      default: "",
    },
    cashBackAmount: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

// Add plugin that converts mongoose to JSON
paginate(CustomerSchema);

// // Apply the timestamp plugin to the Customer schema
timestamp(CustomerSchema);

// Static method to check if email is taken
CustomerSchema.statics.isEmailTaken = async function (
  email: string,
  excludeCustomerId?: mongoose.Types.ObjectId
) {
  const customer = await this.findOne({
    email,
    _id: { $ne: excludeCustomerId },
  });
  return !!customer;
};

// Static method to check if phone is taken
CustomerSchema.statics.isPhoneTaken = async function (
  phone: string,
  excludeCustomerId?: mongoose.Types.ObjectId
) {
  if (!phone) return false;
  const customer = await this.findOne({
    phone,
    _id: { $ne: excludeCustomerId },
  });
  return !!customer;
};

export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = [
  "customerName",
  "phone",
  "email",
  "city",
  "taxNo",
  "address",
  "region",
];
const Customer = mongoose.model<CustomerDocument, CustomerModel>(
  "Customer",
  CustomerSchema
);

export default Customer;
