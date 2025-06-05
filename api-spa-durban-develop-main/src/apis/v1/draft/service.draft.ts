import httpStatus from "http-status";
import Draft, { DraftDocument } from "./schema.draft"; // Adjust DraftDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";
import { ItemTypeEnum } from "../../../utils/enumUtils";

/**
 * Create a draft
 * @param {Object} draftBody
 * @returns {Promise<DraftDocument> }
 */
const createDraft = async (draftBody: any): Promise<DraftDocument> => {
  const draft = new Draft({ ...draftBody });
  const added = await draft.save();
  return added;
};

/**
 * Query for Drafts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: DraftDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryDrafts = async (
  filter: any,
  options: any
): Promise<{
  data: DraftDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const Drafts = await Draft.paginate(filter, options);
  return Drafts;
};

/**
 * Update draft by id
 * @param {string | number} draftId
 * @param {Object} updateBody
 * @returns {Promise <DraftDocument>}
 */
const updateDraftById = async (
  draftId: string | number,
  updateBody: any
): Promise<DraftDocument> => {
  const draft = await getDraftById(draftId);
  if (!draft) {
    throw new ApiError(httpStatus.NOT_FOUND, "Draft not found");
  }

  Object.assign(draft, updateBody);
  await draft.save();
  return draft;
};

/**
 * Delete draft by id
 * @param {string | number} draftId
 * @returns {Promise<DraftDocument>}
 */
const deleteDraftById = async (
  draftId: string | number
): Promise<DraftDocument> => {
  const draft = await getDraftById(draftId);
  if (!draft) {
    throw new ApiError(httpStatus.NOT_FOUND, "Draft not found");
  }
  await Draft.deleteOne({ _id: draftId });
  return draft;
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
 * @param {Array <FilterObject>} filterArray - Array of filters to check
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

/**
 * Get Draft by id
 * @param {string | number} id
 * @returns {Promise <DraftDocument | null> }
 */
const getDraftById = async (
  id: string | number
): Promise<DraftDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Draft.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Get Draft by id with aggrigation
 * @param {PipelineStage[]} aggregateQuery - An array of aggregation pipeline stages
 * @returns {Promise<DraftDocument[] | null>}
 */
const getDraftAggrigate = async (
  aggregateQuery: any[]
): Promise<DraftDocument[] | null> => {
  const result = await Draft.aggregate(aggregateQuery).exec();
  return result.length > 0 ? result : null;
};

/**
 * Get Drafts by an array of IDs
 * @param {Array<string | number> } ids
 * @returns {<Promise>}
 */
const getDraftsByIds = async (
  ids: Array<string | number>
): Promise<Array<DraftDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Draft.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

const getDraftsCounts = async (query: any) => {
  return Draft.countDocuments(query).exec();
};

export {
  createDraft,
  queryDrafts,
  updateDraftById,
  deleteDraftById,
  isExists,
  getDraftById,
  getDraftsByIds,
  getDraftAggrigate,
  getDraftsCounts,
};
