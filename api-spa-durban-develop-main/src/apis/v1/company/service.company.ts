// company.service.ts
import httpStatus from "http-status";
import mongoose from "mongoose";
import ApiError from "../../../../utilities/apiError";
import Company, { CompanyDocument } from "./schema.company";
import { RangeFilter } from "../../../utils/interface";

const createCompany = async (companyBody: any): Promise<CompanyDocument> => {
  try {
    const company = await Company.create(companyBody);
    return company;
  } catch (err: any) {
    // MongoDB duplicate key error
    if (err.code === 11000 && err.keyPattern?.companyName) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Company name already exists");
    }

    // Other errors
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Company creation failed");
  }
};

/**
 * Query for roles
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: CompanyDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryRoles = async (
  filter: any,
  options: any
): Promise<{
  data: CompanyDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const company = await Company.paginate(filter, options);
  return company;
};
const getCompanyById = async (id: string): Promise<CompanyDocument | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ID format");
  }

  return Company.findOne({ _id: id, isDeleted: false });
};

const updateCompanyById = async (companyId: string, updateBody: any): Promise<CompanyDocument> => {
  const company = await getCompanyById(companyId);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  Object.assign(company, updateBody);
  await company.save();

  return company;
};

const deleteCompanyById = async (companyId: string): Promise<CompanyDocument> => {
  const company = await getCompanyById(companyId);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  company.isDeleted = true;
  await company.save();

  return company;
};

const toggleCompanyStatusById = async (companyId: string): Promise<CompanyDocument> => {
  const company = await getCompanyById(companyId);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  company.isActive = !company.isActive;
  await company.save();

  return company;
};

export {
  createCompany,
  queryRoles,
  getCompanyById,
  updateCompanyById,
  deleteCompanyById,
  toggleCompanyStatusById,
};
