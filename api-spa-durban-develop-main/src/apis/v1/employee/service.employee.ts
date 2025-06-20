import httpStatus from "http-status";
import Employee, { EmployeeDocument } from "./schema.employee"; // Adjust EmployeeDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";
import { userService } from "./../service.index";
import { UserEnum } from "../../../utils/enumUtils";
import XLSX from 'xlsx';
import Outlet from "../outlet/schema.outlet";
import Company from "../company/schema.company";
import Role from "../role/schema.role";
import { format, parse } from 'fast-csv';
import { Readable } from 'stream';


/**
 * Create a employee
 * @param {Object} employeeBody
 * @returns {Promise<EmployeeDocument>}
 */
const createEmployee = async (employeeBody: any): Promise<EmployeeDocument> => {
  //create a user
  employeeBody["userType"] = UserEnum.Employee;
  const user = await userService.createUser(employeeBody);
  if (user) {
    employeeBody["_id"] = user._id;
    return Employee.create(employeeBody);
  } else {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Something went wrong while registering employee."
    );
  }
};

/**
 * Query for employees
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {any} [options.search] - Search value to perform text search
 * @param {any} [options.dateFilter] - dateFilter
 * @param {any} [options.filterBy] - dateFilter
 * @param {any} [options.isPaginationRequired] - isPaginationRequired
 * @returns {Promise  <{ data: EmployeeDocument[]; page: number; limit: number; totalPages: number; totalResults: number;  }>}
 */
const queryEmployees = async (
  filter: any,
  options: any
): Promise<{
  data: EmployeeDocument[];
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
  const employees = await Employee.paginate(filter, options);
  return employees;
};

/**
 * Get employee by id
 * @param {string | number} id
 * @returns {Promise  <EmployeeDocument | null>}
 */
const getEmployeeById = async (
  id: string | number
): Promise<EmployeeDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Employee.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    }).select("+password");
  }
  return null;
};

/**
 * Get employees by an array of IDs
 * @param {Array<string | number>} ids
 * @returns {Promise<Array<EmployeeDocument | null>>}
 */
const getEmployeesByIds = async (
  ids: Array<string | number>
): Promise<Array<EmployeeDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Employee.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

/**
 * Update employee by id
 * @param {string | number} employeeId
 * @param {Object} updateBody
 * @returns {Promise  <EmployeeDocument>}
 */
const updateEmployeeById = async (
  employeeId: string | number,
  updateBody: any
): Promise<EmployeeDocument> => {
  const employee = await getEmployeeById(employeeId);
  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  const user = await userService.updateUserById(employeeId, updateBody);
  if (user) {
    Object.assign(employee, updateBody);
    await employee.save();
    return employee;
  } else {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Something went wrong while registering employee."
    );
  }
};

/**
 * Toggle employee status by id
 * @param {string | number} employeeId
 * @returns {Promise<EmployeeDocument>}
 */
const toggleEmployeeStatusById = async (
  employeeId: string | number
): Promise<EmployeeDocument> => {
  const employee = await getEmployeeById(employeeId);
  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "employee not found");
  }
  employee.isActive = !employee.isActive;
  await employee.save();
  return employee;
};

/**
 * Delete employee by id
 * @param {string | number} employeeId
 * @returns {Promise<EmployeeDocument>  }
 */
const deleteEmployeeById = async (
  employeeId: string | number
): Promise<EmployeeDocument> => {
  const employee = await getEmployeeById(employeeId);
  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }
  await Employee.updateOne(
    { _id: employee._id, isDeleted: false },
    { $set: { isDeleted: true } }
  );
  await userService.deleteUserById(employeeId);
  return employee;
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


const importCSV = async (file: Express.Multer.File): Promise<void> => {
  if (!file) throw new Error('No file uploaded');

  const stream = Readable.from(file.buffer);

  const rows: any[] = [];

  await new Promise<void>((resolve, reject) => {
    stream
      .pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
      .on('error', reject)
      .on('data', (row:any) => rows.push(row))
      .on('end', resolve);
  });

  for (const emp of rows) {
    const {
      userName,
      roleName,
      companyName,
      outletNames,
      ...restFields
    } = emp;

    if (!userName) continue;

    // Find Role
    const role = await Role.findOne({ roleName: roleName?.trim() || '' });
    const userRoleId = role?._id;

    // Find Company
    let companyId = null;
    if (companyName) {
      const company = await Company.findOne({ companyName: companyName.trim() });
      companyId = company?._id || null;
    }

    // Find Outlets
    const outletsArray = outletNames
      ? outletNames.split(',').map((name: any) => name.trim())
      : [];

    const outlets = await Outlet.find({ name: { $in: outletsArray } });
    const outletsId = outlets.map((o) => o._id);

    // Prepare employee object
    const employeeObj = {
      ...restFields,
      userName,
      userRoleId,
      companyId,
      outletsId
    };

    console.log('Parsed Employee:', employeeObj);

    await Employee.findOneAndUpdate(
      { userName },
      { $set: employeeObj },
      { upsert: true, new: true }
    );
  }
};

const exportCSV = async (): Promise<Buffer> => {
  const employees = await Employee.find().lean();

  return new Promise((resolve, reject) => {
    const csvStream = format({
      headers: [
        'Name'.padEnd(25),
        'Email'.padEnd(35),
        'Phone'.padEnd(20),
        'Role'.padEnd(20),
      ],
    });

    const chunks: Buffer[] = [];

    csvStream.on('data', (chunk) => chunks.push(chunk));
    csvStream.on('end', () => resolve(Buffer.concat(chunks)));
    csvStream.on('error', reject);

    employees.forEach((emp) => {
      csvStream.write({
        ['Name'.padEnd(25)]: emp.name?.padEnd(25),
        ['Email'.padEnd(35)]: emp.email?.padEnd(35),
        ['Phone'.padEnd(20)]: emp.phone?.padEnd(20)
      });
    });

    csvStream.end();
  });
};

export {
  createEmployee,
  queryEmployees,
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
  getEmployeesByIds,
  isExists,
  toggleEmployeeStatusById,
  importCSV,
  exportCSV
};
