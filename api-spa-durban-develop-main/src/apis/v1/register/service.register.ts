import httpStatus from "http-status";
import Register, { RegisterDocument } from "./schema.register";
import CloseRegister, { CloseRegisterDocument } from "./schema.closereegister";
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";
import SalesRegister from "./schema.salesreegister";

const createRegister = async (registerBody: any): Promise<RegisterDocument> => {
  return Register.create(registerBody);
};
const createCloseRegister = async (
  registerBody: any
): Promise<CloseRegisterDocument> => {
  return CloseRegister.create(registerBody);
};
const queryRegisters = async (
  filter: any,
  options: any
): Promise<{
  data: RegisterDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  return Register.paginate(filter, options);
};

const updateRegisterById = async (
  registerId: string | number,
  updateBody: any
): Promise<RegisterDocument> => {
  const register = await getRegisterById(registerId);
  if (!register) {
    throw new ApiError(httpStatus.NOT_FOUND, "Register not found");
  }

  Object.assign(register, updateBody);
  await register.save();
  return register;
};

const deleteRegisterById = async (
  registerId: string | number
): Promise<RegisterDocument> => {
  const register = await getRegisterById(registerId);
  if (!register) {
    throw new ApiError(httpStatus.NOT_FOUND, "Register not found");
  }

  await Register.updateOne(
    { _id: register._id },
    { $set: { isDeleted: true } }
  );
  return register;
};

const toggleRegisterStatusById = async (
  registerId: string | number
): Promise<RegisterDocument> => {
  const register = await getRegisterById(registerId);
  if (!register) {
    throw new ApiError(httpStatus.NOT_FOUND, "Register not found");
  }
  register.isActive = !register.isActive;
  await register.save();
  return register;
};

const getRegisterById = async (
  id: string | number
): Promise<RegisterDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Register.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};
const findRegister = async (query: {
  createdBy: string;
  outletId: string;
  startOfDay: Date;
  endOfDay: Date;
}) => {
  return await SalesRegister.findOne({
    createdBy: new mongoose.Types.ObjectId(query.createdBy),
    outletId: new mongoose.Types.ObjectId(query.outletId),
    createdAt: { $gte: query.startOfDay, $lte: query.endOfDay }, // Search within the given date range
  });
};

const findCloseRegister = async (query: {
  createdBy: string;
  outletId: string;
  startOfDay: Date;
  endOfDay: Date;
}) => {
  return await SalesRegister.findOne({
    createdBy: new mongoose.Types.ObjectId(query.createdBy),
    outletId: new mongoose.Types.ObjectId(query.outletId),
    createdAt: { $gte: query.startOfDay, $lte: query.endOfDay }, // Search within the given date range
  });
};

export {
  createRegister,
  queryRegisters,
  updateRegisterById,
  deleteRegisterById,
  toggleRegisterStatusById,
  getRegisterById,
  findRegister,
  findCloseRegister,
  createCloseRegister,
};
