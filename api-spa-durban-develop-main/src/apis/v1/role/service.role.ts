import httpStatus from "http-status";
import Role, { RoleDocument } from "./schema.role"; // Adjust RoleDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

/**
 * Create a role
 * @param {Object} roleBody
 * @returns {Promise<RoleDocument>  }
 */
const createRole = async (roleBody: any): Promise<RoleDocument> => {
  return Role.create(roleBody);
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
 * @returns {Promise<{ data: RoleDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryRoles = async (
  filter: any,
  options: any
): Promise<{
  data: RoleDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const roles = await Role.paginate(filter, options);
  return roles;
};

/**
 * Get role by id
 * @param {string } id
 * @returns {Promise<RoleDocument | null>  }
 */
const getRoleById = async (id: string): Promise<RoleDocument | null> => {
  if (typeof id === "string") {
    return Role.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Update role by id
 * @param {string } roleId
 * @param {Object} updateBody
 * @returns {Promise<RoleDocument>  }
 */
const updateRoleById = async (
  roleId: string,
  updateBody: any
): Promise<RoleDocument> => {
  const role = await getRoleById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
  }

  Object.assign(role, updateBody);
  await role.save();
  return role;
};

/**
 * Delete role by id
 * @param {string } roleId
 * @returns {Promise<RoleDocument> }
 */
const deleteRoleById = async (roleId: string): Promise<RoleDocument> => {
  const role = await getRoleById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
  }
  await Role.updateOne(
    { _id: role._id, isDeleted: false },
    { $set: { isDeleted: true } }
  );
  return role;
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
 * @param {Array  <FilterObject> } filterArray - Array of filters to check
 * @param {Array<string> } exceptIds - Array of IDs to exclude from checks
 * @param {Boolean} combined - Whether to combine filters with AND logic
 * @returns {Promise <ExistsResult>   }
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
  createRole,
  queryRoles,
  getRoleById,
  updateRoleById,
  deleteRoleById,
  isExists,
};
