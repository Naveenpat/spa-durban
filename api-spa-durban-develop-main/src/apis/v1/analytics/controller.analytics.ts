import { Request, Response } from "express";
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  isBefore,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import httpStatus from "http-status";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import { analyticsService } from "../service.index";
import { DateFilter, AuthenticatedRequest } from "../../../utils/interface";
import mongoose from "mongoose";
import { searchKeys, allowedDateFilterKeys } from "../invoice/schema.invoice";
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
} from "../../../utils/utils";
import { pick } from "../../../../utilities/pick";

//-----------------------------------------------

const getTopItems = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const limit = (req.query.limit ? req.query.limit : 10) as number;
    const page = (req.query.page ? req.query.page : 1) as number;
    const sortByValue = (
      req.query.sortByValue ? req.query.sortByValue : -1
    ) as number;

    let startDate = req.query.startDate as string;
    let endDate = req.query.endDate as string;
    let dateFilterKey = req.query.dateFilterKey as string;
    let outletId = req.query.outletId as string;
    let itemType = req.query.itemType as string[];
    let matchArray = [];

    if (outletId && outletId !== "") {
      matchArray.push({
        outletId: new mongoose.Types.ObjectId(outletId),
      });
    }

    if (!startDate || startDate === "") {
      startDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!endDate || endDate === "") {
      endDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!dateFilterKey || dateFilterKey === "") {
      dateFilterKey = "createdAt";
    }

    //date filter
    const datefilterQuery = await analyticsService.getDateFilterQuery(
      {
        startDate,
        endDate,
        dateFilterKey,
      },
      allowedDateFilterKeys
    );

    if (!datefilterQuery || !datefilterQuery.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "something went wrong");
    }

    matchArray.push(...datefilterQuery);

    let matchQuery = { $and: matchArray };

    let result = await analyticsService.getTopProducts(
      matchQuery,
      itemType,
      limit,
      page,
      sortByValue
    );
    return res.status(httpStatus.OK).send({
      message: "All OK",
      status: true,
      ...result,
    });
  }
);
//-----------------------------------------------

const getTopCustomer = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const limit = (req.query.limit ? req.query.limit : 10) as number;
    const page = (req.query.page ? req.query.page : 1) as number;
    const sortByValue = (
      req.query.sortByValue ? req.query.sortByValue : -1
    ) as number;

    let startDate = req.query.startDate as string;
    let endDate = req.query.endDate as string;
    let dateFilterKey = req.query.dateFilterKey as string;
    let outletId = req.query.outletId as string;
    let matchArray = [];
    matchArray.push({
      isDeleted: false,
    });

    if (outletId && outletId !== "") {
      matchArray.push({
        outletId: new mongoose.Types.ObjectId(outletId),
      });
    }

    if (!startDate || startDate === "") {
      startDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!endDate || endDate === "") {
      endDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!dateFilterKey || dateFilterKey === "") {
      dateFilterKey = "createdAt";
    }

    //date filter
    const datefilterQuery = await analyticsService.getDateFilterQuery(
      {
        startDate,
        endDate,
        dateFilterKey,
      },
      allowedDateFilterKeys
    );

    if (!datefilterQuery || !datefilterQuery.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "something went wrong");
    }

    matchArray.push(...datefilterQuery);
    let matchQuery = { $and: matchArray };
    let result = await analyticsService.getTopCustomer(
      matchQuery,
      limit,
      page,
      sortByValue
    );
    return res.status(httpStatus.OK).send({
      message: "All OK",
      status: true,
      ...result,
    });
  }
);
//-----------------------------------------------

const getTopOutlet = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const limit = (req.query.limit ? req.query.limit : 10) as number;
    const page = (req.query.page ? req.query.page : 1) as number;
    const sortByValue = (
      req.query.sortByValue ? req.query.sortByValue : -1
    ) as number;

    let startDate = req.query.startDate as string;
    let endDate = req.query.endDate as string;
    let dateFilterKey = req.query.dateFilterKey as string;
    let matchArray = [];
    matchArray.push({
      isDeleted: false,
    });

    if (!startDate || startDate === "") {
      startDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!endDate || endDate === "") {
      endDate = format(new Date(), "yyyy-MM-dd");
    }

    if (!dateFilterKey || dateFilterKey === "") {
      dateFilterKey = "createdAt";
    }

    //date filter
    const datefilterQuery = await analyticsService.getDateFilterQuery(
      {
        startDate,
        endDate,
        dateFilterKey,
      },
      allowedDateFilterKeys
    );

    if (!datefilterQuery || !datefilterQuery.length) {
      throw new ApiError(httpStatus.NOT_FOUND, "something went wrong");
    }

    matchArray.push(...datefilterQuery);
    let matchQuery = { $and: matchArray };
    let result = await analyticsService.getTopOutlet(
      matchQuery,
      limit,
      page,
      sortByValue
    );
    return res.status(httpStatus.OK).send({
      message: "All OK",
      status: true,
      ...result,
    });
  }
);
//-----------------------------------------------

const getOutletReport = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const reportDuration = req.query.reportDuration as string;

    let result = await analyticsService.getOutletReportData(reportDuration);
    //

    res.status(httpStatus.OK).send({
      message: "Successfull!",
      data: result,
      status: true,
    });
  }
);

const getOutletDailyReport = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const reportDuration = req.query.reportDuration as string;
    const { outletId } = req.query; 
    let result = await analyticsService.getDailyOutletReportSingleDay(outletId);
    //

    res.status(httpStatus.OK).send({
      message: "Successfull!",
      data: result,
      status: true,
    });
  }
);
//-----------------------------------------------
export {
  getTopItems,
  getTopCustomer,
  getTopOutlet,
  getOutletReport,
  getOutletDailyReport,
};
