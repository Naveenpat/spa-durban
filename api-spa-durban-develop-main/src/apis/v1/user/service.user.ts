import httpStatus from "http-status";
import User, { UserDocument } from "./schema.user"; // Adjust UserDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose, { Document, Model } from "mongoose";
import { DateFilter, RangeFilter } from "../../../utils/interface";

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<UserDocument>}
 */
const createUser = async (userBody: any): Promise<UserDocument> => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: UserDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryUsers = async (
  filter: any,
  options: any
): Promise<{
  data: UserDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {string | number} id
 * @returns {Promise<UserDocument | null>}
 */
const getUserById = async (
  id: string | number
): Promise<UserDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return User.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Get User by id with aggrigation
 * @param {PipelineStage[]} aggregateQuery - An array of aggregation pipeline stages
 * @returns {Promise<UserDocument | null>}
 */
const getUserAggrigate = async (
  aggregateQuery: any[]
): Promise<UserDocument | null> => {
  const result = await User.aggregate(aggregateQuery).exec();
  return result.length > 0 ? result[0] : null;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<UserDocument | null>}
 */
const getUserByEmail = async (email: string): Promise<UserDocument | null> => {
  return User.findOne({ email, isDeleted: false });
};
const getUserByBookingUserId = async (
  bookingUserId: string
): Promise<UserDocument | null> => {
  return User.findOne({ bookingUserId, isDeleted: false });
};
/**
 * Update user by id
 * @param {string | number} userId
 * @param {Object} updateBody
 * @returns {Promise<UserDocument>}
 */
const updateUserById = async (
  userId: string | number,
  updateBody: any
): Promise<UserDocument> => {
  // const user = await getUserById(userId)
  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, "User not found")
  // }
  if (
    updateBody.email &&
    (await User.isEmailTaken(
      updateBody.email,
      new mongoose.Types.ObjectId(userId)
    ))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  const userUpdated = await User.findByIdAndUpdate(
    { _id: userId },
    { ...updateBody },
    { new: true, upsert: true }
  );
  if (!userUpdated) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Something went wrong while updating user's data."
    );
  }
  return userUpdated;
};

/**
 * Delete user by id
 * @param {string | number} userId
 * @returns {Promise<UserDocument>}
 */
const deleteUserById = async (
  userId: string | number
): Promise<UserDocument> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await User.updateOne(
    { _id: user._id, isDeleted: false },
    { $set: { isDeleted: true } }
  );
  return user;
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
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  isExists,
  getUserAggrigate,
  getUserByBookingUserId,
};
