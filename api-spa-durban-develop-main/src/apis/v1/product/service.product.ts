import httpStatus from "http-status";
import Product, { ProductDocument } from "./schema.product"; // Adjust ProductDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

/**
 * Create a product
 * @param {Object} productBody
 * @returns {Promise <ProductDocument> }
 */
const createProduct = async (productBody: any): Promise<ProductDocument> => {
  if (await Product.isBarcodeAlreadyExist(productBody.barcode)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Barcode already exists!");
  }
  if (await Product.isProductCodeAlreadyExist(productBody.productCode)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product code already exists!");
  }
  if (await Product.exists({ productName: productBody.productName, isDeleted: false })) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product name already exists!");
  }
  return Product.create(productBody);
};

/**
 * Query for products
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @returns {Promise  <{ data: ProductDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }> }
 */
const queryProducts = async (
  filter: any,
  options: any
): Promise<{
  data: ProductDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const products = await Product.paginate(filter, options);
  return products;
};

/**
 * Update product by id
 * @param {string | number} productId
 * @param {Object} updateBody
 * @returns {Promise <ProductDocument> }
 */
const updateProductById = async (
  productId: string | number,
  updateBody: any
): Promise<ProductDocument> => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  // Check if productName already exists for another product
  const existingProduct = await Product.findOne({
    productName: product.productName,
    _id: { $ne: productId }, // Exclude current product
    isDeleted: false,
  });

  if (existingProduct) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product name already exists!");
  }

  Object.assign(product, updateBody);
  await product.save();
  return product;
};

/**
 * Delete product by id
 * @param {string | number} productId
 * @returns {Promise<ProductDocument> }
 */
const deleteProductById = async (
  productId: string | number
): Promise<ProductDocument> => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  await Product.deleteOne({ _id: product._id });
  return product;
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
 * @returns {Promise <ExistsResult>}
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
 * Get Product by id
 * @param {string | number} id
 * @returns {Promise   <ProductDocument | null>  }
 */
const getProductById = async (
  id: string | number
): Promise<ProductDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Product.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};
/**
 * Get Product
 * @param {string | number} id
 * @returns {Promise   <ProductDocument | null>  }
 */
const getProduct = async (
  matchQuery: object
): Promise<ProductDocument | null> => {
  if (typeof matchQuery === "object") {
    return Product.findOne({
      ...matchQuery,
    });
  }
  return null;
};
/**
 * Get Product
 * @param {PipelineStage[]} aggregateQuery - An array of aggregation pipeline stages
 * @returns {Promise<ProductDocument | null>}
 */
const getProductDetails = async (
  aggregateQuery: any[]
): Promise<ProductDocument | null> => {
  const result = await Product.aggregate(aggregateQuery).exec();
  return result.length > 0 ? result[0] : null;
};

/**
 * Toggle product status by id
 * @param {string | number} productId
 * @returns {Promise<ProductDocument>}
 */
const toggleProductStatusById = async (
  productId: string | number
): Promise<ProductDocument> => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  product.isActive = !product.isActive;
  await product.save();
  return product;
};

/**
 * Get Product
 * @param {PipelineStage[]} aggregateQuery - An array of aggregation pipeline stages
 * @returns {Promise<ProductDocument | null>}
 */
const aggregateQuery = async (
  aggregateQuery: any[]
): Promise<ProductDocument[]> => {
  const result = await Product.aggregate(aggregateQuery).exec();
  return result.length > 0 ? result : [];
};

/**
 * Get Products by an array of IDs
 * @param {Array <string | number> } ids
 * @returns {Promise <Array<ProductDocument | null>  >}
 */
const getProductsByIds = async (
  ids: Array<string | number>
): Promise<Array<ProductDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Product.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

export {
  createProduct,
  queryProducts,
  updateProductById,
  deleteProductById,
  isExists,
  getProductById,
  getProductsByIds,
  getProduct,
  getProductDetails,
  aggregateQuery,
  toggleProductStatusById,
};
