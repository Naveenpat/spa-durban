import httpStatus from "http-status";
import Service, { ServiceDocument } from "./schema.service"; // Adjust ServiceDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

/**
 * Create a service
 * @param {Object} serviceBody
 * @returns {Promise<ServiceDocument>}
 */
const createService = async (serviceBody: any): Promise<ServiceDocument> => {
  return Service.create(serviceBody);
};

/**
 * Query for services
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: ServiceDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }> }
 */
const queryServices = async (
  filter: any,
  options: any
): Promise<{
  data: ServiceDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const services = await Service.paginate(filter, options);
  return services;
};

/**
 * Update service by id
 * @param {string | number} serviceId
 * @param {Object} updateBody
 * @returns {Promise<ServiceDocument>}
 */
const updateServiceById = async (
  serviceId: string | number,
  updateBody: any
): Promise<ServiceDocument> => {
  const service = await getServiceById(serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
  }

  Object.assign(service, updateBody);
  await service.save();
  return service;
};

/**
 * Toggle service status by id
 * @param {string | number} serviceId
 * @returns {Promise<ServiceDocument>}
 */
const toggleServiceStatusById = async (
  serviceId: string | number
): Promise<ServiceDocument> => {
  const service = await getServiceById(serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
  }
  service.isActive = !service.isActive;
  await service.save();
  return service;
};

/**
 * Get service
 * @param {PipelineStage[]} aggregateQuery - An array of aggregation pipeline stages
 * @returns {Promise<ServiceDocument | null>}
 */
const aggregateQuery = async (
  aggregateQuery: any[]
): Promise<ServiceDocument[]> => {
  const result = await Service.aggregate(aggregateQuery).exec();
  return result.length > 0 ? result : [];
};

/**
 * Delete service by id
 * @param {string | number} serviceId
 * @returns {Promise<ServiceDocument> }
 */
const deleteServiceById = async (
  serviceId: string | number
): Promise<ServiceDocument> => {
  const service = await getServiceById(serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
  }
  await Service.deleteOne({ _id: service._id });
  return service;
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

/**
 * Get Service by id
 * @param {string | number} id
 * @returns {Promise<ServiceDocument | null> }
 */
const getServiceById = async (
  id: string | number
): Promise<ServiceDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Service.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Get Services by an array of IDs
 * @param {Array<string | number> } ids
 * @returns {Promise <Array<ServiceDocument | null>>}
 */
const getServicesByIds = async (
  ids: Array<string | number>
): Promise<Array<ServiceDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Service.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};
const addServiceToTopData = async (
  serviceId: string | number
): Promise<ServiceDocument> => {
  const service = await getServiceById(serviceId);

  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
  }

  // Fetch all pinned services sorted by priority
  const topService = await Service.findOne({ pinned: true }).sort({
    priority: 1,
  });

  // Determine new priority
  const newPriority = topService ? topService.priority - 1 : 1;

  // Update all pinned services to shift priority down
  await Service.updateMany({ pinned: true }, { $inc: { priority: 1 } });

  // Update current service to be on top
  service.pinned = true;
  service.priority = newPriority;

  await service.save();
  return service;
};
const removeServiceFromTopData = async (
  serviceId: string | number
): Promise<ServiceDocument> => {
  const service = await getServiceById(serviceId);

  if (!service || !service.pinned) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not pinned or not found");
  }

  const removedPriority = service.priority;

  // Unpin the service and set a high priority so it moves down
  service.pinned = false;
  service.priority = 100;
  await service.save();

  // Shift remaining services up
  await Service.updateMany(
    { pinned: true, priority: { $gt: removedPriority } },
    { $inc: { priority: -1 } }
  );

  return service;
};

export {
  createService,
  queryServices,
  updateServiceById,
  deleteServiceById,
  isExists,
  getServiceById,
  getServicesByIds,
  aggregateQuery,
  toggleServiceStatusById,
  addServiceToTopData,
  removeServiceFromTopData,
};
