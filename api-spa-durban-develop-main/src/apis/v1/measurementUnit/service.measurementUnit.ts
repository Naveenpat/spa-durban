import httpStatus from "http-status";
import MeasurementUnit, {
  MeasurementUnitDocument,
} from "./schema.measurementUnit"; // Adjust MeasurementUnitDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

/**
 * Create a measurementUnit
 * @param {Object} measurementUnitBody
 * @returns {Promise<MeasurementUnitDocument>  }
 */
const createMeasurementUnit = async (
  measurementUnitBody: any
): Promise<MeasurementUnitDocument> => {
  return MeasurementUnit.create(measurementUnitBody);
};

/**
 * Query for measurementUnits
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise<{ data: MeasurementUnitDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryMeasurementUnits = async (
  filter: any,
  options: any
): Promise<{
  data: MeasurementUnitDocument[];
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
  const measurementUnits = await MeasurementUnit.paginate(filter, options);
  return measurementUnits;
};

/**
 * Update measurementUnit by id
 * @param {string | number} measurementUnitId
 * @param {Object} updateBody
 * @returns {Promise<MeasurementUnitDocument> }
 */
const updateMeasurementUnitById = async (
  measurementUnitId: string | number,
  updateBody: any
): Promise<MeasurementUnitDocument> => {
  const measurementUnit = await getMeasurementUnitById(measurementUnitId);
  if (!measurementUnit) {
    throw new ApiError(httpStatus.NOT_FOUND, "MeasurementUnit not found");
  }

  Object.assign(measurementUnit, updateBody);
  await measurementUnit.save();
  return measurementUnit;
};

/**
 * Delete measurementUnit by id
 * @param {string | number} measurementUnitId
 * @returns {Promise <MeasurementUnitDocument> }
 */
const deleteMeasurementUnitById = async (
  measurementUnitId: string | number
): Promise<MeasurementUnitDocument> => {
  const measurementUnit = await getMeasurementUnitById(measurementUnitId);
  if (!measurementUnit) {
    throw new ApiError(httpStatus.NOT_FOUND, "MeasurementUnit not found");
  }
  await MeasurementUnit.deleteOne({ _id: measurementUnit._id });
  return measurementUnit;
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
 * @param {Array
                        <FilterObject>
                          } filterArray - Array of filters to check
 * @param {Array
                          <string>
                            } exceptIds - Array of IDs to exclude from checks
 * @param {Boolean} combined - Whether to combine filters with AND logic
 * @returns {Promise
                            <ExistsResult>
                              }
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

/**
 * Get MeasurementUnit by id
 * @param {string | number} id
 * @returns {Promise   <MeasurementUnitDocument | null>  }
 */
const getMeasurementUnitById = async (
  id: string | number
): Promise<MeasurementUnitDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return MeasurementUnit.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Get MeasurementUnits by an array of IDs
 * @param {Array<string | number>} ids
 * @returns {Promise <Array<MeasurementUnitDocument | null>>}
 */
const getMeasurementUnitsByIds = async (
  ids: Array<string | number>
): Promise<Array<MeasurementUnitDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return MeasurementUnit.find({
    _id: { $in: objectIds },
    isDeleted: false,
  }).exec();
};

export {
  createMeasurementUnit,
  queryMeasurementUnits,
  updateMeasurementUnitById,
  deleteMeasurementUnitById,
  isExists,
  getMeasurementUnitById,
  getMeasurementUnitsByIds,
};
