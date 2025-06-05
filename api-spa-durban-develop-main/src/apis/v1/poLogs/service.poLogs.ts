import httpStatus from "http-status";
import PoLogs, { PoLogsDocument } from "./schema.poLogs"; // Adjust PoLogsDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose, { Document, Model } from "mongoose";
import { DateFilter, RangeFilter } from "../../../utils/interface";

/**
 * Query for poLogss
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: PoLogsDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryPoLogss = async (
  filter: any,
  options: any
): Promise<{
  data: PoLogsDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const poLogss = await PoLogs.paginate(filter, options);
  return poLogss;
};

export { queryPoLogss };
