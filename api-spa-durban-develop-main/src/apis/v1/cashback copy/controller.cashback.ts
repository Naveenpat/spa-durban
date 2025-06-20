import { Request, Response } from "express";
import httpStatus from "http-status";
import { pick } from "../../../../utilities/pick";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import { cashbackService, outletService } from "../service.index";
import {
  DateFilter,
  RangeFilter,
  AuthenticatedRequest,
} from "../../../utils/interface";
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
} from "../../../utils/utils";
import { searchKeys, allowedDateFilterKeys } from "./schema.cashback";
import mongoose from "mongoose";
import { UserEnum } from "../../../utils/enumUtils";

const createCashback = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    if (req.body.activeDays && req.body.activeDays.length > 0) {
      req.body.cashBackDate = null;
      req.body.cashBackEndDate = null;
    } else {
      req.body.activeDays = [];
      req.body.startTime = null;
      req.body.endTime = null;
    }

    const cashback = await cashbackService.createCashback(req.body);

    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: cashback,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getCashbacks = catchAsync(
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
    const dateFilter = req.query.dateFilter as DateFilter | null;
    const rangeFilterBy = req.query.rangeFilterBy as RangeFilter | undefined;
    const isAdmin = req?.userData?.userType === UserEnum.Admin;
    let outletQuery = {};
    if (!isAdmin) {
      outletQuery = {
        outletsId: {
          $in: req?.userData?.outletsData,
        },
      };
    }
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
      const searchQuery = getSearchQuery(
        searchIn ? searchIn : [],
        searchKeys,
        searchValue
      );
      if (searchQuery !== null) {
        options["search"] = { $or: searchQuery } as any;
      }
    }
    if (dateFilter) {
      const datefilterQuery = await getDateFilterQuery(
        dateFilter,
        allowedDateFilterKeys
      );
      if (datefilterQuery && datefilterQuery.length) {
        options["dateFilter"] = { $and: datefilterQuery } as any;
      }
    }
    if (rangeFilterBy !== undefined) {
      const rangeQuery = getRangeQuery(rangeFilterBy);
      if (rangeQuery && rangeQuery.length) {
        options["rangeFilterBy"] = { $and: rangeQuery } as any;
      }
    }
    let additionalQuery = [{ $match: outletQuery }];
    options["additionalQuery"] = additionalQuery as any;
    const result = await cashbackService.queryCashbacks(filter, options);
    return res.status(httpStatus.OK).send(result);
  }
);

const updateCashback = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    if (req.body.activeDays && req.body.activeDays.length > 0) {
      req.body.cashBackDate = null;
      req.body.cashBackEndDate = null;
    } else {
      req.body.activeDays = [];
      req.body.startTime = null;
      req.body.endTime = null;
    }

    const cashback = await cashbackService.updateCashbackById(
      req.params.cashBackId,
      req.body
    );

    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: cashback,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const deleteCashback = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await cashbackService.deleteCashbackById(req.params.cashBackId);
    return res.status(httpStatus.OK).send({
      message: "Deleted successfully!",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);
// const toggleCashbackStatus = async (cashbackId: string | number) => {
//   const cashback = await cashbackService.getCashbackById(cashbackId);
//   if (!cashback) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Cashback not found");
//   }
//   cashback.isActive = !cashback.isActive;
//   await cashback.save();
//   return cashback;
// };

const toggleCashbackStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const cashback = await cashbackService.getCashbackById(
      req.params.cashBackId
    );
    if (!cashback) {
      throw new ApiError(httpStatus.NOT_FOUND, "Cashback not found");
    }
    cashback.isActive = !cashback.isActive;
    await cashback.save();
    return res.status(httpStatus.OK).send({
      message: "Status updated successfully.",
      data: cashback,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);
const getCashback = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const cashback = await cashbackService.getCashbackById(
      req.params.cashBackId
    );

    if (!cashback || cashback.isDeleted) {
      throw new ApiError(httpStatus.NOT_FOUND, "Cashback not found");
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: cashback,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);
export {
  createCashback,
  getCashbacks,
  updateCashback,
  deleteCashback,
  toggleCashbackStatus,
  getCashback,
};
