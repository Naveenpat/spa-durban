import mongoose, { Document, Model } from "mongoose";
import validator from "validator";
import { hash, compare } from "bcrypt";
import timestamp from "../../plugins/timeStamp.plugin";
import { paginate } from "../../plugins/pagination.plugin";
import {
  DateFilter,
  FilterByItem,
  RangeFilter,
} from "../../../utils/interface";
import { UserEnum } from "../../../utils/enumUtils";
import { string } from "joi/lib";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  userName: string;
  phone: string;
  userType: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  isPasswordMatch(password: string): Promise<boolean>;
  isDeleted: boolean;
  isActive: boolean;
  bookingUserId: string;
}

export interface UserModel extends mongoose.Model<UserDocument> {
  isuserNameTaken(
    userName: string,
    excludeUserId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
  isEmailTaken(
    email: string,
    excludeUserId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
  isPhoneTaken(
    phone: string,
    excludeUserId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
  paginate: (
    filter: any,
    options: any
  ) => Promise<{
    data: UserDocument[];
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

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      unique: false,
      trim: true,
      lowercase: true,
      minlength: 6,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    userName: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      unique: true,
      default: "",
    },
    password: {
      type: String,
      required: false,
      trim: true,
      // minlength: 8,
      private: true, // used by the toJSON plugin
    },
    userType: {
      type: String,
      enum: UserEnum,
      default: UserEnum.Employee,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bookingUserId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Add plugin that converts mongoose to JSON
paginate(userSchema);

// // Apply the timestamp plugin to the User schema
timestamp(userSchema);

// Static method to check if email is taken
userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: mongoose.Types.ObjectId
) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

// Static method to check if phone is taken
userSchema.statics.isPhoneTaken = async function (
  phone: string,
  excludeUserId?: mongoose.Types.ObjectId
) {
  if (!phone) return false;
  const user = await this.findOne({ phone, _id: { $ne: excludeUserId } });
  return !!user;
};

// Static method to check if userName is taken
userSchema.statics.isuserNameTaken = async function (
  userName: string,
  excludeUserId?: mongoose.Types.ObjectId
) {
  const user = await this.findOne({ userName, _id: { $ne: excludeUserId } });
  return !!user;
};

// Instance method to check if password matches
userSchema.methods.isPasswordMatch = async function (password: string) {
  const user = this as UserDocument;
  return compare(password, user.password);
};

// Middleware to hash password before saving
userSchema.pre<UserDocument>("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await hash(user.password, 12);
  }
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const update: any = this.getUpdate();

  // Check if the password field is being updated
  if (update?.password) {
    update.password = await hash(update.password, 12);
    this.setUpdate(update); // Ensure the updated password is set
  }

  next();
});

export const allowedDateFilterKeys = ["createdAt", "updatedAt"];
export const searchKeys = ["name", "email"];
const User = mongoose.model<UserDocument, UserModel>("User", userSchema);

export default User;
