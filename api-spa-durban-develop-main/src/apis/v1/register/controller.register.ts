import { Request, Response } from "express";
import httpStatus from "http-status";
import { pick } from "../../../../utilities/pick";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import { registerService } from "../service.index";
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
} from "../../../utils/utils";
import { searchKeys, allowedDateFilterKeys } from "./schema.register";
import { UserEnum } from "../../../utils/enumUtils";
import { AuthenticatedRequest } from "../../../utils/interface";
import Invoice from "../invoice/schema.invoice";

const createRegister = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const { outletId, date } = req.body;
    const userId = req.userData.Id;

    // Agar date na ho, to aaj ki date lo
    let inputDate = date ? new Date(date) : new Date();

    // Date validation (invalid format handle karo)
    if (isNaN(inputDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
    }

    // Start & End of Day set karo (00:00 - 23:59)
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check karo agar aaj ka register pehle se exist karta hai
    const existingRegister = await registerService.findRegister({
      createdBy: userId,
      outletId,
      startOfDay,
      endOfDay,
    });

    if (existingRegister) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Register entry already exists for this user and outlet today"
      );
    }

    // Naya register create karo
    const register = await registerService.createRegister({
      ...req.body,
      createdBy: userId,
      createdAt: new Date(), // Ensure current timestamp is stored
    });

    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: register,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);
const createCloseRegister = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const { outletId, date, closeRegister } = req.body;

    const userId = req.userData.Id;

    // Agar date na ho, to aaj ki date lo
    let inputDate = date ? new Date(date) : new Date();

    // Date validation (invalid format handle karo)
    if (isNaN(inputDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
    }

    // Start & End of Day set karo (00:00 - 23:59)
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check karo agar aaj ka register pehle se exist karta hai
    const existingRegister = await registerService.findCloseRegister({
      createdBy: userId,
      outletId,
      startOfDay,
      endOfDay,
    });

    if (existingRegister) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Register entry already exists for this user and outlet today"
      );
    }

    // Naya register create karo
    const register = await registerService.createCloseRegister({
      ...req.body,
      createdBy: userId,
      createdAt: new Date(), // Ensure current timestamp is stored
    });
    // return true;
    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: register,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getRegisters = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = pick(req.query, []);
    const options = pick(req.query, [
      "sortBy",
      "limit",
      "page",
      "searchValue",
      "searchIn",
      "dateFilter",
      "rangeFilterBy",
    ]);
    const searchValue = req.query.searchValue as string | undefined;
    const searchIn = req.query.searchIn as string[] | null;
    const dateFilter = req.query.dateFilter as any;
    const rangeFilterBy = req.query.rangeFilterBy as any;

    if (searchValue) {
      let searchQueryCheck = checkInvalidParams(searchIn || [], searchKeys);
      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send({ ...searchQueryCheck });
      }
      const searchQuery = getSearchQuery(
        searchIn || [],
        searchKeys,
        searchValue
      );
      if (searchQuery !== null) {
        options["search"] = { $or: searchQuery } as any;
      }
    }

    if (dateFilter) {
      const dateFilterQuery = await getDateFilterQuery(
        dateFilter,
        allowedDateFilterKeys
      );
      if (dateFilterQuery && dateFilterQuery.length) {
        options["dateFilter"] = { $and: dateFilterQuery } as any;
      }
    }

    if (rangeFilterBy !== undefined) {
      const rangeQuery = getRangeQuery(rangeFilterBy);
      if (rangeQuery && rangeQuery.length) {
        options["rangeFilterBy"] = { $and: rangeQuery } as any;
      }
    }

    const result = await registerService.queryRegisters(filter, options);
    return res.status(httpStatus.OK).send(result);
  }
);

const updateRegister = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    const register = await registerService.updateRegisterById(
      req.params.registerId,
      req.body
    );
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: register,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const deleteRegister = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await registerService.deleteRegisterById(req.params.registerId);
    return res.status(httpStatus.OK).send({
      message: "Deleted successfully!",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const toggleRegisterStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const register = await registerService.getRegisterById(
      req.params.registerId
    );
    if (!register) {
      throw new ApiError(httpStatus.NOT_FOUND, "Register not found");
    }
    register.isActive = !register.isActive;
    await register.save();
    return res.status(httpStatus.OK).send({
      message: "Status updated successfully.",
      data: register,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getRegisterById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const register = await registerService.getRegisterById(
      req.params.registerId
    );
    if (!register || register.isDeleted) {
      throw new ApiError(httpStatus.NOT_FOUND, "Register not found");
    }
    return res.status(httpStatus.OK).send({
      message: "Successful.",
      data: register,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getRegisterCurentDate = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    const outletId = req.params.outletId;
    const userId = req.userData.Id;
    let inputDate = new Date();
    if (isNaN(inputDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
    }
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Aaj ke din ka start time
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Next day ka start time

    const pipeline = [
      {
        $addFields: {
          createdAtDate: {
            $dateFromString: {
              dateString: "$createdAt",
              format: "%Y-%m-%d %H:%M:%S", // Match your database format
            },
          },
        },
      },
      {
        $match: {
          createdAtDate: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      },
      { $unwind: "$amountReceived" }, // Separate each payment entry
      {
        $group: {
          _id: "$amountReceived.paymentModeId",
          totalAmount: { $sum: "$amountReceived.amount" },
        },
      },
      {
        $lookup: {
          from: "paymentmodes", // 👈 This is the collection name in MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "paymentModeData",
        },
      },
      {
        $unwind: "$paymentModeData", // Unwind to get single object
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          paymentModeName: "$paymentModeData.modeName", // 👈 Fetch name from PaymentMode
        },
      },
    ];

    const result = await Invoice.aggregate(pipeline);

    const existingRegister = await registerService.findRegister({
      createdBy: userId,
      outletId,
      startOfDay,
      endOfDay,
    });
    return res.status(httpStatus.OK).send({
      message: "Successful.",
      data: { existingRegister, result },
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getGivenChangeSum = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const outletId = req.params.outletId || req.body.outletId;
    if (!outletId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Outlet ID is required");
    }

    // Use current date or allow date override
    let inputDate = req.body.date ? new Date(req.body.date) : new Date();
    if (isNaN(inputDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
    }

    // Create start and end of the day
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Aggregate pipeline to sum givenChange
    const pipeline = [
      {
        $match: {
          outletId: outletId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalGivenChange: { $sum: "$givenChange" },
        },
      },
      {
        $project: {
          _id: 0,
          totalGivenChange: 1,
        },
      },
    ];

    const result = await Invoice.aggregate(pipeline);
    const totalGivenChange = result[0]?.totalGivenChange || 0;

    return res.status(httpStatus.OK).send({
      message: "Given change summed successfully.",
      data: { outletId, date: inputDate.toISOString(), totalGivenChange },
      status: true,
      code: "OK",
      issue: null,
    });
  }
);


export {
  createRegister,
  getRegisters,
  updateRegister,
  deleteRegister,
  toggleRegisterStatus,
  getRegisterById,
  getRegisterCurentDate,
  createCloseRegister,
  getGivenChangeSum
};
