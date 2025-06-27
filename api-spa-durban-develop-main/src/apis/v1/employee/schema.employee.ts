import mongoose, { Document, ObjectId, Types } from "mongoose";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import { hash, compare } from "bcrypt";
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
  outletsId?: Types.ObjectId[];
  address: string;
  city: string;
  region: string;
  country: string;
  isDeleted: boolean;
  isActive: boolean;
  companyId?:ObjectId;
  password:string;
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
     companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      trim: true,
      default: null,
    },
    outletsId: {
      type: [mongoose.Schema.Types.ObjectId],
      // required: true,
      default: null,
      trim: true,
    },
    password: {
      type: String,
      required: true, // or false if optional
      select: false,  // optional: don't return in queries unless explicitly selected
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


// // Middleware to hash password before saving
// EmployeeSchema.pre<EmployeeDocument>("save", async function (next) {
//   const user = this;
//   if (user.isModified("password")) {
//     user.password = await hash(user.password, 12);
//   }
//   next();
// });


// EmployeeSchema.pre("findOneAndUpdate", async function (next) {
//   const update: any = this.getUpdate();

//   // Check if the password field is being updated
//   if (update?.password) {
//     update.password = await hash(update.password, 12);
//     this.setUpdate(update); // Ensure the updated password is set
//   }

//   next();
// });

export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["email", "name"];
const Employee = mongoose.model<EmployeeDocument, EmployeeModel>(
  "Employee",
  EmployeeSchema
);

export default Employee;
