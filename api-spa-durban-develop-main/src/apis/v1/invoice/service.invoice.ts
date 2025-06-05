import httpStatus from "http-status";
import Invoice, { InvoiceDocument } from "./schema.invoice"; // Adjust InvoiceDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";
import { ItemTypeEnum } from "../../../utils/enumUtils";

/**
 * Create a invoice
 * @param {Object} invoiceBody
 * @returns {Promise<InvoiceDocument> }
 */
const createInvoice = async (invoiceBody: any): Promise<InvoiceDocument> => {
  const invoice = new Invoice({ ...invoiceBody });
  const added = await invoice.save();
  return added;
};

/**
 * Query for invoices
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise<{ data: InvoiceDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryInvoices = async (
  filter: any,
  options: any
): Promise<{
  data: InvoiceDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const invoices = await Invoice.paginate(filter, options);
  return invoices;
};

/**
 * Get Invoice by id
 * @param {string | number} id
 * @returns {Promise <InvoiceDocument | null> }
 */
const getInvoiceById = async (
  id: string | number
): Promise<InvoiceDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Invoice.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Update invoice by id
 * @param {string | number} invoiceId
 * @param {Object} updateBody
 * @returns {Promise <InvoiceDocument>}
 */
const updateInvoiceById = async (
  invoiceId: string | number,
  updateBody: any
): Promise<InvoiceDocument> => {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
  }

  Object.assign(invoice, updateBody);
  await invoice.save();
  return invoice;
};

/**
 * Delete invoice by id
 * @param {string | number} invoiceId
 * @returns {Promise<InvoiceDocument>}
 */
const deleteInvoiceById = async (
  invoiceId: string | number
): Promise<InvoiceDocument> => {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
  }
  await updateInvoiceById(invoiceId, { isDeleted: false });
  return invoice;
};

/**
 * Modify the givenChange field of an invoice
 * @param {string} invoiceId
 * @param {number} value
 * @returns {Promise<InvoiceDocument>}
 */
export const modifyGivenChange = async (
  invoiceId: string,
  value: number
): Promise<InvoiceDocument> => {
  let invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
  }

  let newGivenChange = invoice.givenChange.valueOf() + value;

  if (newGivenChange < 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "givenChange cannot be negative"
    );
  }

  return await updateInvoiceById(invoiceId, { givenChange: newGivenChange });
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
 * Get Invoice by id with aggrigation
 * @param {PipelineStage[]} aggregateQuery - An array of aggregation pipeline stages
 * @returns {Promise<InvoiceDocument[] | null>}
 */
const getInvoiceAggrigate = async (
  aggregateQuery: any[]
): Promise<InvoiceDocument[] | null> => {
  const result = await Invoice.aggregate(aggregateQuery).exec();
  return result.length > 0 ? result : null;
};

/**
 * Get Invoices by an array of IDs
 * @param {Array<string | number> } ids
 * @returns {<Promise>}
 */
const getInvoicesByIds = async (
  ids: Array<string | number>
): Promise<Array<InvoiceDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Invoice.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

/**
 * Get the latest invoice for a specific outlet using prefix pattern.
 * @param outletId - The MongoDB ObjectId of the outlet
 * @param invoicePrefix - The prefix used in invoice numbers
 * @returns The latest invoice document or null
 */
export const getLatestInvoiceByOutletId = async (
  outletId: string,
  invoicePrefix: string
): Promise<InvoiceDocument | null> => {
  return Invoice.findOne({
    outletId: new mongoose.Types.ObjectId(outletId),
    invoiceNumber: { $regex: `^${invoicePrefix}\\d+$` },
    isDeleted: false
  })
    .sort({ createdAt: -1 }) // Or use `invoiceNumber` descending if preferred
    .lean();
};

const getInvoicesCounts = async (query: any) => {
  return Invoice.countDocuments(query).exec();
};

export {
  createInvoice,
  queryInvoices,
  updateInvoiceById,
  deleteInvoiceById,
  isExists,
  getInvoiceById,
  getInvoicesByIds,
  getInvoiceAggrigate,
  getInvoicesCounts,
};
