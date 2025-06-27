import httpStatus from "http-status";
import Outlet, { OutletDocument } from "./schema.outlet"; // Adjust OutletDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";
import Company from "../company/schema.company";

/**
 * Create a outlet
 * @param {Object} outletBody
 * @returns {Promise<OutletDocument>}
 */
const createOutlet = async (outletBody: any): Promise<OutletDocument> => {
  return Outlet.create(outletBody);
};

const getOutletsByCompanyId = async (companyId: string) => {
  return Outlet.find({ companyId });
};


/**
 * Query for outlets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise<{ data: OutletDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryOutlets = async (
  filter: any,
  options: any
): Promise<{
  data: OutletDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
  isPaginationRequired: boolean | undefined;
}> => {
  options.additionalQuery = [{
    $lookup: {
      from: "companies", // MongoDB collection name
      localField: "companyId",
      foreignField: "_id",
      as: "companyDetails",
      pipeline: [
        {
          $project: {
            companyName: 1,
          },
        },
      ],
    },
  },
  {
    $addFields: {
      companyName: { $arrayElemAt: ["$companyDetails.companyName", 0] },
    },
  },
  { $unset: ["companyDetails"] },
  ];
  const outlets = await Outlet.paginate(filter, options);
  return outlets;
};

/**
 * Get outlet by id
 * @param {string | number} id
 * @returns {Promise<OutletDocument | null> }
 */
const getOutletById = async (
  id: string | number
): Promise<OutletDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Outlet.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

const getOutletByBookingStoreId = async (
  bookingStoreId: string | number
): Promise<OutletDocument | null> => {
  if (!bookingStoreId) return null; // Validate input

  return Outlet.findOne({
    bookingStoreId: bookingStoreId, // Match bookingStoreId
    // isDeleted: false, // Ensure it's not deleted
  });
};

/**
 * Get Outlet by id with aggrigation
 * @param {PipelineStage[]} aggregateQuery - An array of aggregation pipeline stages
 * @returns {Promise<OutletDocument[] | null>}
 */
const getOutletAggrigate = async (
  aggregateQuery: any[]
): Promise<OutletDocument[] | null> => {
  const result = await Outlet.aggregate(aggregateQuery).exec();
  return result.length > 0 ? result : null;
};

/**
 * Get Outlet by id with aggrigation
 * @param {PipelineStage[]} aggregateQuery - An array of aggregation pipeline stages
 * @returns {Promise<OutletDocument[] | null>}
 */
const getOutletsWithAggrigate = async (
  aggregateQuery: any[]
): Promise<OutletDocument[] | []> => {
  const result = await Outlet.aggregate(aggregateQuery).exec();
  return result.length > 0 ? result : [];
};
/**
 * Get outlets by an array of IDs
 * @param {Array<string | number>} ids
 * @returns {Promise<Array<OutletDocument | null>>}
 */
const getOutletsByIds = async (
  ids: Array<string | number>
): Promise<Array<OutletDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Outlet.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

/**
 * Update outlet by id
 * @param {string | number} outletId
 * @param {Object} updateBody
 * @returns {Promise<OutletDocument>}
 */
const updateOutletById = async (
  outletId: string | number,
  updateBody: any
): Promise<OutletDocument> => {
  const outlet = await getOutletById(outletId);
  if (!outlet) {
    throw new ApiError(httpStatus.NOT_FOUND, "Outlet not found");
  }

  Object.assign(outlet, updateBody);
  await outlet.save();
  return outlet;
};

/**
 * Toggle outlet status by id
 * @param {string | number} outletId
 * @returns {Promise<OutletDocument>}
 */
const toggleOutletStatusById = async (
  outletId: string | number
): Promise<OutletDocument> => {
  const outlet = await getOutletById(outletId);
  if (!outlet) {
    throw new ApiError(httpStatus.NOT_FOUND, "Outlet not found");
  }
  outlet.isActive = !outlet.isActive;
  await outlet.save();
  return outlet;
};

/**
 * Delete outlet by id
 * @param {string | number} outletId
 * @returns {Promise<OutletDocument>}
 */
const deleteOutletById = async (
  outletId: string | number
): Promise<OutletDocument> => {
  const outlet = await getOutletById(outletId);
  if (!outlet) {
    throw new ApiError(httpStatus.NOT_FOUND, "Outlet not found");
  }
  await Outlet.updateOne(
    { _id: outlet._id, isDeleted: false },
    { $set: { isDeleted: true } }
  );
  return outlet;
};

interface FilterObject {
  [key: string]: any; // Adjust any as per your field types
}

interface ExistsResult {
  exists: boolean;
  existsSummary: string;
}

/**
 * Check if certain conditions exist in the database
 * @param {Array<FilterObject>} filterArray - Array of filters to check
 * @param {Array<string>} exceptIds - Array of IDs to exclude from checks
 * @param {Boolean} combined - Whether to combine filters with AND logic
 * @returns {Promise<ExistsResult>}
 */
const isExists = async (
  filterArray: FilterObject[],
  exceptIds: string[] = [],
  combined: boolean = false
): Promise<ExistsResult> => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray);
    if (exceptIds.length > 0) {
      combinedObj["_id"] = { $nin: exceptIds };
    }
    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`,
      };
    }
    return { exists: false, existsSummary: "" };
  }

  let mappedArray = await Promise.all(
    filterArray.map(async (element) => {
      if (exceptIds.length > 0) {
        element["_id"] = { $nin: exceptIds };
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] };
      }
      return { exists: false, fieldName: Object.keys(element)[0] };
    })
  );

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true;
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `;
      }
      return acc;
    },
    { exists: false, existsSummary: "" } as ExistsResult // Ensure initial type assignment
  );
};

// Example functions used in the code, add typings accordingly
async function combineObjects(
  filterArray: FilterObject[]
): Promise<FilterObject> {
  // Implementation
  return {} as FilterObject;
}

async function getOneByMultiField(filter: FilterObject): Promise<boolean> {
  // Implementation
  return false;
}

export {
  createOutlet,
  queryOutlets,
  getOutletById,
  getOutletsByIds,
  updateOutletById,
  deleteOutletById,
  isExists,
  toggleOutletStatusById,
  getOutletAggrigate,
  getOutletsWithAggrigate,
  getOutletByBookingStoreId,
  getOutletsByCompanyId
};
