import { Request, Response } from "express";
import httpStatus from "http-status";
import { pick } from "../../../../utilities/pick";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import {
  employeeService,
  roleService,
  outletService,
  userService,
} from "../service.index"; // Adjusted import
import {
  AuthenticatedRequest,
  DateFilter,
  RangeFilter,
} from "../../../utils/interface";
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
} from "../../../utils/utils";
import { searchKeys, allowedDateFilterKeys } from "./schema.employee";
import { UserEnum } from "../../../utils/enumUtils";
import mongoose, { ObjectId } from "mongoose";

// const createEmployee = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     /*
//      * check role exist
//      */
//     const role = await roleService.getRoleById(req.body.userRoleId);
//     if (!role) {
//       throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
//     }
//     /*
//      * check outlet exist
//      */
//     const outletIds = req.body.outletsId; // Assuming this is an array of Object IDs

//     // Fetch all outlets by their IDs
//     const outlets = await Promise.all(
//       outletIds.map((id: any) => outletService.getOutletById(id))
//     );

//     // Check if any outlet is not found
//     const notFoundOutlets = outlets.filter((outlet) => !outlet);

//     if (notFoundOutlets.length > 0) {
//       throw new ApiError(httpStatus.NOT_FOUND, "One or more outlets not found");
//     }

//     const employee = await employeeService.createEmployee(req.body);
//     return res.status(httpStatus.CREATED).send({
//       message: "Added successfully!",
//       data: employee,
//       status: true,
//       code: "CREATED",
//       issue: null,
//     });
//   }
// );

const createEmployee = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { userRoleId, outletsId, companyId } = req.body;

    // console.log('----req body',req.body)
    // Validate role
    const role = await roleService.getRoleById(userRoleId);
    if (!role) {
      throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
    }

    // Normalize inputs
    const hasOutlets = Array.isArray(outletsId) && outletsId.length > 0;
    const hasCompany = !!companyId;

    // Clean up empty outletsId so it's not sent further
    if (!hasOutlets) {
      delete req.body.outletsId;
    }

    // Enforce only one source
    if (hasOutlets && hasCompany) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Only one of 'outletsId' or 'companyId' is allowed"
      );
    }
    // console.log('----111')
    if (!hasOutlets && !hasCompany) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "One of 'outletsId' or 'companyId' must be provided"
      );
    }

    // If outlets provided, validate them
    if (hasOutlets) {
      const outlets = await Promise.all(
        outletsId.map((id: any) => outletService.getOutletById(id))
      );

      const notFoundOutlets = outlets.filter((outlet) => !outlet);
      if (notFoundOutlets.length > 0) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "One or more outlets not found"
        );
      }
    }
    // console.log('----222-')
    const employee = await employeeService.createEmployee(req.body);
    //  console.log('----333-')
    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: employee,
      status: true,
      code: "CREATED",
      issue: null,
    });
  }
);



const createBookingEmployee = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // console.log(req.body, "==========createBookingEmployee============");

    // /*
    //  * check role exist
    //  */
    // const role = await roleService.getRoleById(req.body.userRoleId);
    // if (!role) {
    //   throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
    // }
    // /*
    //  * check outlet exist
    //  */
    // console.log("helooooo",req)
    const storeIds = req.body.storeIds; // Assuming this is an array of Object IDs
    // console.log(storeIds, "==========storeIds============");
    // // Fetch all outlets by their IDs
    const outlets = await Promise.all(
      storeIds.map((id: any) => outletService.getOutletByBookingStoreId(id))
    );
    // console.log(outlets, "==========outletsooo============");
    const filteredOutlets = outlets.filter((outlet) => outlet !== null);
    req.body.outletIds = filteredOutlets.map((outlet) => outlet._id);
    // console.log(req.body, "==========outletIds============");
    // // Check if any outlet is not found
    // const notFoundOutlets = outlets.filter((outlet) => !outlet);

    // if (notFoundOutlets.length > 0) {
    //   throw new ApiError(httpStatus.NOT_FOUND, "One or more outlets not found");
    // }

    const data = {
      userName: req.body.email,
      email: req.body.email,
      password: req.body.password,
      outletsId: req.body.outletIds,
      name: req.body.name,
      userRoleId: null,
      bookingUserId: req.body.id,
    };

    try {


      const employee = await employeeService.createEmployee(data);
      // console.log("Employee created successfully");

      const user = await userService.createUser(data);
      // console.log("User created successfully");

      return res.status(httpStatus.CREATED).send({
        message: "Added successfully!",
        data: employee,
        status: true,
        code: "CREATED",
        issue: null,
      });
    } catch (error) {
      console.error("Error creating user or employee:", error);

      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        message: "Failed to create user or employee",
        status: false,
        code: "CREATE_FAILED",
        issue: null,
      });
    }

    // const user = await userService.createUser(data);
    // console.log("user created successfully")
    // const employee = await employeeService.createEmployee(data);
    // return res.status(httpStatus.CREATED).send({
    //   message: "Added successfully!",
    //   data: employee,
    //   status: true,
    //   code: "CREATED",
    //   issue: null,
    // });
  }
);

const getEmployees = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = pick(req.query, ["outletsId"]);
    const options = pick(req.query, [
      "sortBy",
      "limit",
      "page",
      "searchValue",
      "searchIn",
      "dateFilter",
      "rangeFilterBy",
    ]);
    // Extract searchValue from req.query
    const searchValue = req.query.searchValue as string | undefined;
    const searchIn = req.query.searchIn as string[] | null;
    const dateFilter = req.query.dateFilter as DateFilter | null;
    const filterBy = req.query.filterBy as any[];
    const rangeFilterBy = req.query.rangeFilterBy as RangeFilter | undefined;
    const isPaginationRequiredParam = req.query.isPaginationRequired;
    const isAdmin = req?.userData?.userType === UserEnum.Admin;
    let outletQuery = {};
    if (!isAdmin) {
      outletQuery = {
        outletsId: {
          $in: req?.userData?.outletsData,
        },
      };
    }

    if (isPaginationRequiredParam !== undefined) {
      const isPaginationRequired = isPaginationRequiredParam === "true";

      if (isPaginationRequired) {
        options.isPaginationRequired = isPaginationRequired as any;
      }
    }
    // Add searchValue to options if it exists
    if (searchValue) {
      let searchQueryCheck = checkInvalidParams(
        searchIn ? searchIn : [],
        searchKeys
      );

      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send({
          ...searchQueryCheck,
        });
      }
      // Extract search query from options
      const searchQuery = getSearchQuery(
        searchIn ? searchIn : [],
        searchKeys,
        searchValue
      );
      if (searchQuery !== null) {
        options["search"] = { $or: searchQuery } as any;
      }
    }

    //date filter
    //date filter
    if (dateFilter) {
      const datefilterQuery = await getDateFilterQuery(
        dateFilter,
        allowedDateFilterKeys
      );

      if (datefilterQuery && datefilterQuery.length) {
        options["dateFilter"] = { $and: datefilterQuery } as any;
      }
    }

    //range filter
    if (rangeFilterBy !== undefined) {
      const rangeQuery = getRangeQuery(rangeFilterBy);

      if (rangeQuery && rangeQuery.length) {
        options["rangeFilterBy"] = { $and: rangeQuery } as any;
      }
    }

    //check filter by
    if (filterBy?.length) {
      const booleanFields: string[] = ["isActive"];
      const numberFileds: string[] = [];
      const objectIdFileds: string[] = ["userRoleId", "outletsId"];

      const withoutRegexFields: string[] = [];

      const filterQuery = getFilterQuery(
        filterBy,
        booleanFields,
        numberFileds,
        objectIdFileds,
        withoutRegexFields
      );
      if (filterQuery) {
        options["filterBy"] = { $and: filterQuery } as any;
      }
    }

    //additional query
    let additionalQuery = [
      { $match: outletQuery },
      {
        $lookup: {
          from: "roles", // The collection name in MongoDB
          localField: "userRoleId", // The field in the Employee collection
          foreignField: "_id", // The field in the Category collection
          as: "roleDetails", // The field name for the joined category data
          pipeline: [
            {
              $project: {
                roleName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          roleName: {
            $arrayElemAt: ["$roleDetails.roleName", 0],
          },
        },
      },
      {
        $unset: ["roleDetails"],
      },
      {
        $lookup: {
          from: "outlets", // The collection name in MongoDB
          localField: "outletsId", // The field in the Employee collection
          foreignField: "_id", // The field in the Outlet collection
          as: "outletDetails", // The field name for the joined outlet data
        },
      },
      {
        $addFields: {
          outletNames: "$outletDetails.name",
        },
      },
      {
        $unset: ["outletDetails"],
      },
      // ✅ Lookup for company
      {
        $lookup: {
          from: "companies", // MongoDB collection name
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetails",
          pipeline: [
            {
              $project: {
                companyName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          companyName: { $arrayElemAt: ["$companyDetails.companyName", 0] },
        },
      },
      { $unset: ["companyDetails"] },
    ];

    options["additionalQuery"] = additionalQuery as any;

    const result = await employeeService.queryEmployees(filter, options);
    return res.status(httpStatus.OK).send(result);
  }
);

const getEmployee = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const employee = await employeeService.getEmployeeById(
      req.params.employeeId
    );
    if (!employee) {
      throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: employee,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

// const getEmployeeRoles = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     const employee: any = await employeeService.getEmployeeById(
//       req?.userData?.Id as any
//     );

//     let isAdmin = false;
//     if (!employee) {
//       isAdmin = true;
//     }
//     const role = await roleService.getRoleById(
//       employee?.userRoleId.toString() as string
//     );
//     let allOutlets = await outletService.getOutletAggrigate([
//       { $match: { isDeleted: false } },
//     ]);
//     let allOutletsIds = allOutlets?.map((ele: any) => {
//       return {
//         _id: ele?._id,
//         name: ele?.name,
//         bookingStoreId: ele?.bookingStoreId,
//       };
//     });

//     let outletsData: any = await userService.getUserAggrigate([
//       { $match: { _id: new mongoose.Types.ObjectId(employee?._id) } },
//       {
//         $lookup: {
//           from: "employees",
//           localField: "_id",
//           foreignField: "_id",
//           as: "employeeData",
//           pipeline: [
//             {
//               $project: {
//                 outletsId: 1,
//               },
//             },
//             {
//               $lookup: {
//                 from: "outlets",
//                 localField: "outletsId",
//                 foreignField: "_id",
//                 as: "outletsData",
//                 pipeline: [
//                   {
//                     $project: {
//                       _id: 1,
//                       name: 1,
//                       bookingStoreId: 1,
//                     },
//                   },
//                 ],
//               },
//             },
//           ],
//         },
//       },

//       {
//         $project: {
//           outlets: {
//             $arrayElemAt: ["$employeeData.outletsData", 0],
//           },
//         },
//       },
//     ]);
//     return res.status(httpStatus.OK).send({
//       message: "Successfull.",
//       data: {
//         roleName: isAdmin ? UserEnum.Admin : role?.roleName,
//         permissions: isAdmin ? allOutletsIds : role?.permissions,
//         userdata: req?.userData,
//         outlets: isAdmin ? allOutletsIds : (outletsData?.outlets as any),
//       },
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );

// const updateEmployee = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     /*
//      * check role exist
//      */
//     const role = await roleService.getRoleById(req.body.userRoleId);
//     if (!role) {
//       throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
//     }
//     /*
//      * check outlet exist
//      */
//     const outletIds = req.body.outletsId; // Assuming this is an array of Object IDs

//     // Fetch all outlets by their IDs
//     const outlets = await Promise.all(
//       outletIds.map((id: any) => outletService.getOutletById(id))
//     );

//     // Check if any outlet is not found
//     const notFoundOutlets = outlets.filter((outlet) => !outlet);

//     if (notFoundOutlets.length > 0) {
//       throw new ApiError(httpStatus.NOT_FOUND, "One or more outlets not found");
//     }
//     const employee = await employeeService.updateEmployeeById(
//       req.params.employeeId,
//       req.body
//     );
//     return res.status(httpStatus.OK).send({
//       message: "Updated successfully!",
//       data: employee,
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );


const getEmployeeRoles = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const employee: any = await employeeService.getEmployeeById(
      req?.userData?.Id as any
    );

    let isAdmin = false;
    if (!employee) {
      isAdmin = true;
    }

    const role = await roleService.getRoleById(
      employee?.userRoleId?.toString() as string
    );

    const allOutlets = await outletService.getOutletAggrigate([
      { $match: { isDeleted: false } },
    ]);

    const allOutletsIds = allOutlets?.map((ele: any) => ({
      _id: ele?._id,
      name: ele?.name,
      bookingStoreId: ele?.bookingStoreId,
    }));

    let outlets;

    if (employee?.outletsId?.length > 0) {
      // Get outlets based on employee.outletsId
      const outletData = await outletService.getOutletAggrigate([
        {
          $match: {
            _id: { $in: employee.outletsId },
            isDeleted: false,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            bookingStoreId: 1,
          },
        },
      ]);
      outlets = outletData;
    } else if (employee?.companyId) {
      // Get all outlets under the companyId
      const companyOutlets = await outletService.getOutletAggrigate([
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(employee.companyId),
            isDeleted: false,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            bookingStoreId: 1,
          },
        },
      ]);
      outlets = companyOutlets;
    }

     // Attach roleName inside userdata
    const userDataWithRole = {
      ...req?.userData,
      roleName: isAdmin ? UserEnum.Admin : role?.roleName,
    };
    
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: {
        roleName: isAdmin ? UserEnum.Admin : role?.roleName,
        permissions: isAdmin ? allOutletsIds : role?.permissions,
        userdata: userDataWithRole,
        outlets: isAdmin ? allOutletsIds : outlets,
      },
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const updateEmployee = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { userRoleId, outletsId, companyId } = req.body;

    /*
     * Validate role
     */
    const role = await roleService.getRoleById(userRoleId);
    if (!role) {
      throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
    }

    /*
     * Enforce mutual exclusivity
     */
    const hasOutlets = Array.isArray(outletsId) && outletsId.length > 0;
    const hasCompany = !!companyId;

    // Remove empty arrays or nulls from body
    if (!hasOutlets) {
      req.body.outletsId = null;
    }

    if (!hasCompany) {
      req.body.companyId = null;
    }

    if (hasOutlets && hasCompany) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Only one of 'outletsId' or 'companyId' is allowed");
    }

    if (!hasOutlets && !hasCompany) {
      throw new ApiError(httpStatus.BAD_REQUEST, "One of 'outletsId' or 'companyId' must be provided");
    }

    /*
     * If outlets are provided, validate them
     */
    if (hasOutlets) {
      const outlets = await Promise.all(
        outletsId.map((id: any) => outletService.getOutletById(id))
      );

      const notFoundOutlets = outlets.filter((outlet) => !outlet);
      if (notFoundOutlets.length > 0) {
        throw new ApiError(httpStatus.NOT_FOUND, "One or more outlets not found");
      }
    }

    /*
     * Update employee
     */
    const employee = await employeeService.updateEmployeeById(
      req.params.employeeId,
      req.body
    );

    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: employee,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);


const deleteEmployee = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await employeeService.deleteEmployeeById(req.params.employeeId);
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const toggleEmployeeStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const updatedEmployee = await employeeService.toggleEmployeeStatusById(
      req.params.employeeId
    );
    return res.status(httpStatus.OK).send({
      message: "Status updated successfully.",
      data: updatedEmployee,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

export {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
  getEmployeeRoles,
  createBookingEmployee,
};
