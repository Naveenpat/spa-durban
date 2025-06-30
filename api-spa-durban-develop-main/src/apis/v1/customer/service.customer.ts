import httpStatus from "http-status";
import Customer, { CustomerDocument } from "./schema.customer"; // Adjust CustomerDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";
import { userService } from "./../service.index";
import { UserEnum, CustomerTypeEnum } from "../../../utils/enumUtils";
import XLSX from 'xlsx';
import { format, parse } from 'fast-csv';
import { Readable } from "stream";
import { isValid } from "date-fns";
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

/**
 * Create a customer
 * @param {Object} customerBody
 * @returns {Promise<CustomerDocument>}
 */

const createCustomer = async (customerBody: any): Promise<CustomerDocument> => {

  const existingCustomer = await Customer.findOne({
    $or: [
      { customerName: customerBody.customerName },
      { email: customerBody.email },
      { phone: customerBody.phone }
    ],
  });

  if (existingCustomer) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Customer with same name or email or phone already exists."
    );
  }

  //create a user
  customerBody["userType"] = UserEnum.Customer;
  customerBody["userName"] = customerBody.email;
  customerBody["password"] = customerBody.phone;
  customerBody["name"] = customerBody.customerName;
  customerBody['customerGroup'] = 'new user'
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

const getAllCustomers = async () => {
  return await Customer.find({ isDeleted: false }).select("_id customerName");
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

// const importCSV = async (file: Express.Multer.File): Promise<void> => {
//   if (!file) throw new Error('No file uploaded');

//   const stream = Readable.from(file.buffer);
//   const customers: any[] = [];

//   // Parse CSV rows
//   await new Promise<void>((resolve, reject) => {
//     stream
//       .pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
//       .on('data', (row:any) => customers.push(row))
//       .on('end', resolve)
//       .on('error', reject);
//   });

//   // Loop through customers
//   for (const customer of customers) {
//     const {
//       email,
//       ...restFields
//     } = customer;

//     if (!email) continue;

//     const customerObj = {
//       ...restFields,
//       email,
//     };

//     await Customer.findOneAndUpdate(
//       { email },
//       { $set: customerObj },
//       { upsert: true, new: true }
//     );
//   }
// };


const importCSV = async (file: Express.Multer.File): Promise<void> => {
  if (!file) throw new Error('No file uploaded');

  const stream = Readable.from(file.buffer);
  const customers: any[] = [];

  // Parse CSV rows
  await new Promise<void>((resolve, reject) => {
    stream
      .pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
      .on('data', (row: any) => customers.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  for (const customer of customers) {
    const { email, customerName, dateOfBirth, ...restFields } = customer;

    // Skip if no email or customerName
    if (!email || !customerName) continue;

    // Prepare filtered fields (remove undefined or empty strings)
    const validFields: Record<string, any> = {};
    for (const [key, value] of Object.entries({ email, customerName, ...restFields })) {
      if (value !== undefined && value !== '') {
        validFields[key] = value;
      }
    }

    // ✅ Parse dateOfBirth safely
    if (dateOfBirth) {
      const parsedDOB = dayjs(dateOfBirth, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
      if (parsedDOB.isValid()) {
        validFields.dateOfBirth = parsedDOB.toDate();
      } else {
        console.warn(`⚠️ Invalid dateOfBirth "${dateOfBirth}" for ${customerName} (${email}) - Skipped DOB`);
      }
    }

    // Check for existing by email or customerName
    const existing = await Customer.findOne({
      $or: [{ email }, { customerName }]
    });

    if (existing) {
      // Update only fields passed
      await Customer.updateOne(
        { _id: existing._id },
        { $set: validFields }
      );
    } else {
      // Insert new customer
      await Customer.create(validFields);
    }
  }
};



const exportCSV = async (): Promise<Buffer> => {
  const customers = await Customer.find({ isDeleted: false }).limit(10).lean();

  const rows = customers.map((cust) => ({
    CustomerName: cust.customerName,
    Phone: cust.phone,
    Email: cust.email,
    Address: cust.address,
    City: cust.city,
    Region: cust.region,
    Country: cust.country,
    TaxNo: cust.taxNo,
    DateOfBirth: cust.dateOfBirth
      ? new Date(cust.dateOfBirth).toLocaleDateString()
      : '',
    Gender: cust.gender,
    LoyaltyPoints: cust.loyaltyPoints || 0,
    CustomerType: cust.customerType,
    IsActive: cust.isActive ? 'Active' : 'Inactive',
    BookingCustomerId: cust.bookingCustomerId || '',
    CashBackAmount: cust.cashBackAmount || 0
  }));

  return new Promise((resolve, reject) => {
    const csvStream = format({ headers: true });
    const chunks: Buffer[] = [];

    csvStream.on('data', (chunk) => chunks.push(chunk));
    csvStream.on('end', () => resolve(Buffer.concat(chunks)));
    csvStream.on('error', reject);

    rows.forEach((row) => csvStream.write(row));
    csvStream.end();
  });
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
  importCSV,
  exportCSV,
  getAllCustomers
};
