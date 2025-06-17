import httpStatus from "http-status";
import Customer, { CustomerDocument } from "./schema.customer"; // Adjust CustomerDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";
import { userService } from "./../service.index";
import { UserEnum, CustomerTypeEnum } from "../../../utils/enumUtils";
import XLSX from 'xlsx';
/**
 * Create a customer
 * @param {Object} customerBody
 * @returns {Promise<CustomerDocument>}
 */

const createCustomer = async (customerBody: any): Promise<CustomerDocument> => {
  //create a user
  customerBody["userType"] = UserEnum.Customer;
  customerBody["userName"] = customerBody.email;
  customerBody["password"] = customerBody.phone;
  customerBody["name"] = customerBody.customerName;
  const user = await userService.createUser(customerBody);
  if (user) {
    customerBody["_id"] = user._id;
    return Customer.create(customerBody);
  } else {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Something went wrong while registering customer."
    );
  }
};
const findCustomerByBookingId = async (bookingCustomerId: string) => {
  if (!bookingCustomerId) return null;
  const customer = await Customer.findOne({ bookingCustomerId });
  return customer;
};
/**
 * Query for customers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise  <{ data: CustomerDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */

const queryCustomers = async (
  filter: any,
  options: any
): Promise<{
  data: CustomerDocument[];
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
  const {
    page = 1,
    limit = 10,
    sortBy = { customerName: 1 },
    filterBy,
  } = options;
  // console.log(
  //   filterBy,
  //   "==============filterBy================================="
  // );

  try {
    const customersAggregation = await Customer.aggregate([
      { $match: filterBy || {} },

      {
        $facet: {
          metadata: [{ $count: "totalResults" }],
          data: [
            // { $sort: sortBy },
            { $skip: (page - 1) * limit }, // ✅ Apply pagination
            { $limit: limit },
          ],
        },
      },
      {
        $project: {
          data: 1,
          totalResults: { $arrayElemAt: ["$metadata.totalResults", 0] }, // ✅ Extract total count
        },
      },
    ]).allowDiskUse(true);

    // console.log(customersAggregation, "customersAggregation=========");

    if (!customersAggregation.length) {
      return {
        data: [],
        page,
        limit,
        totalPages: 0,
        totalResults: 0,
        search: options.searchValue,
        dateFilter: options.dateFilter,
        filterBy: options.searchIn,
        rangeFilterBy: options.rangeFilterBy,
        isPaginationRequired: options.isPaginationRequired,
      };
    }

    const customersData = customersAggregation[0];

    return {
      data: customersData.data,
      page,
      limit,
      totalPages: Math.ceil(customersData.totalResults / limit),
      totalResults: customersData.totalResults || 0,
      search: options.searchValue,
      dateFilter: options.dateFilter,
      filterBy: options.searchIn,
      rangeFilterBy: options.rangeFilterBy,
      isPaginationRequired: options.isPaginationRequired,
    };
  } catch (error) {
    console.error("Error in queryCustomers:", error);
    throw new Error("Failed to fetch customers due to sorting issue.");
  }
};

/**
 * Get customer by id
 * @param {string | number} id
 * @returns {Promise  <CustomerDocument | null>}
 */
const getCustomerById = async (
  id: string | number
): Promise<CustomerDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Customer.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

/**
 * Get customers by an array of IDs
 * @param {Array<string | number>} ids
 * @returns {Promise<Array<CustomerDocument | null>>}
 */
const getCustomersByIds = async (
  ids: Array<string | number>
): Promise<Array<CustomerDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Customer.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

/**
 * Toggle customer status by id
 * @param {string | number} customerId
 * @returns {Promise<CustomerDocument>}
 */
const toggleCustomerStatusById = async (
  customerId: string | number
): Promise<CustomerDocument> => {
  const customer = await getCustomerById(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
  }
  customer.isActive = !customer.isActive;
  await customer.save();
  return customer;
};

/**
 * Update customer by id
 * @param {string | number} customerId
 * @param {Object} updateBody
 * @returns {Promise  <CustomerDocument>}
 */
const updateCustomerById = async (
  customerId: string | number,
  updateBody: any
): Promise<CustomerDocument> => {
  const customer = await getCustomerById(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
  }
  let customerUpdated = await Customer.findByIdAndUpdate(
    { _id: customerId },
    { ...updateBody },
    { new: true }
  );
  if (!customerUpdated) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Something went wrong while updating customer."
    );
  }
  let userDataToUpdate = JSON.parse(JSON.stringify(customerUpdated));
  userDataToUpdate["userType"] = UserEnum.Customer;
  userDataToUpdate["userName"] = customerUpdated.email;
  userDataToUpdate["password"] = customerUpdated.phone;
  userDataToUpdate["name"] = customerUpdated.customerName;
  // console.log("update users data==============>",userDataToUpdate)
  // const user = await userService.updateUserById(customerId, {
  //   userDataToUpdate,
  // });

  return customerUpdated;
};

/**
 * Delete customer by id
 * @param {string | number} customerId
 * @returns {Promise<CustomerDocument>  }
 */
const deleteCustomerById = async (
  customerId: string | number
): Promise<CustomerDocument> => {
  const customer = await getCustomerById(customerId);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
  }
  if (customer?.customerType === CustomerTypeEnum.walkin) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Walkin Customer can't be deleted"
    );
  }
  await Customer.deleteOne({ _id: customer._id });
  await userService.deleteUserById(customerId);
  return customer;
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
 * @param {Array<FilterObject>  } filterArray - Array of filters to check
 * @param {Array  <string>} exceptIds - Array of IDs to exclude from checks
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

const importExcel = async (file: Express.Multer.File): Promise<void> => {
  if (!file) throw new Error('No file uploaded');

  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data: any[] = XLSX.utils.sheet_to_json(sheet);

  for (const customer of data) {
    const {
      email,
      ...restFields
    } = customer;

    if (!email) continue;

    const customerObj = {
      ...restFields,
      email,
    };

    await Customer.findOneAndUpdate(
      { email },
      { $set: customerObj },
      { upsert: true, new: true }
    );
  }
};


// =================== EXPORT CUSTOMER EXCEL =====================
const exportExcel = async () => {
  const customers = await Customer.find({ isDeleted: false }).limit(10);

  const formattedData = customers.map((cust) => ({
    CustomerName: cust.customerName,
    Phone: cust.phone,
    Email: cust.email,
    Address: cust.address,
    City: cust.city,
    Region: cust.region,
    Country: cust.country,
    TaxNo: cust.taxNo,
    DateOfBirth: cust.dateOfBirth ? new Date(cust.dateOfBirth).toLocaleDateString() : '',
    Gender: cust.gender,
    LoyaltyPoints: cust.loyaltyPoints || 0,
    CustomerType: cust.customerType,
    IsActive: cust.isActive ? 'Active' : 'Inactive',
    BookingCustomerId: cust.bookingCustomerId || '',
    CashBackAmount: cust.cashBackAmount || 0
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};


export {
  createCustomer,
  queryCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
  getCustomersByIds,
  isExists,
  toggleCustomerStatusById,
  findCustomerByBookingId,
  importExcel,
  exportExcel
};
