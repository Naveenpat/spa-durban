import { Request, Response } from "express";
import httpStatus from "http-status";
import { pick } from "../../../../utilities/pick";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import { rewardsCouponService, outletService } from "../service.index";
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
import { searchKeys, allowedDateFilterKeys } from "./schema.rewardscoupon";
import mongoose from "mongoose";
import { UserEnum } from "../../../utils/enumUtils";

import crypto from "crypto";
import RewardsCoupon from "./schema.rewardscoupon"; // Adjust the import path if needed

const generateUniqueCouponCode = async (): Promise<string> => {
  let isUnique = false;
  let couponCode = "";

  while (!isUnique) {
    // Generate a random 10-character alphanumeric code
    // couponCode = crypto.randomBytes(5).toString("hex").toUpperCase();
     couponCode = `REWARD-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

    // Check if the code already exists in the database
    const existingCoupon = await RewardsCoupon.findOne({ couponCode });
    if (!existingCoupon) {
      isUnique = true;
    }
  }

  return couponCode;
};

const createRewardsCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    // Generate a unique coupon code
    req.body.couponCode = await generateUniqueCouponCode();

    const rewardsCoupon = await rewardsCouponService.createRewardsCoupon(
      req.body
    );

    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: rewardsCoupon,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getRewardsCoupons = catchAsync(
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
    const result = await rewardsCouponService.queryRewardsCoupons(
      filter,
      options
    );
    return res.status(httpStatus.OK).send(result);
  }
);

const updateRewardsCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    const rewardsCoupon = await rewardsCouponService.updateRewardsCouponById(
      req.params.rewardsCouponId,
      req.body
    );

    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: rewardsCoupon,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const deleteRewardsCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await rewardsCouponService.deleteRewardsCouponById(
      req.params.rewardsCouponId
    );
    return res.status(httpStatus.OK).send({
      message: "Deleted successfully!",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const toggleRewardsCouponStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const rewardsCoupon = await rewardsCouponService.getRewardsCouponById(
      req.params.rewardsCouponId
    );
    if (!rewardsCoupon) {
      throw new ApiError(httpStatus.NOT_FOUND, "RewardsCoupon not found");
    }
    rewardsCoupon.isActive = !rewardsCoupon.isActive;
    await rewardsCoupon.save();
    return res.status(httpStatus.OK).send({
      message: "Status updated successfully.",
      data: rewardsCoupon,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getRewardsCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const rewardsCoupon = await rewardsCouponService.getRewardsCouponById(
      req.params.rewardsCouponId
    );

    if (!rewardsCoupon || rewardsCoupon.isDeleted) {
      throw new ApiError(httpStatus.NOT_FOUND, "RewardsCoupon not found");
    }

    return res.status(httpStatus.OK).send({
      message: "Successful.",
      data: rewardsCoupon,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

export {
  createRewardsCoupon,
  getRewardsCoupons,
  updateRewardsCoupon,
  deleteRewardsCoupon,
  toggleRewardsCouponStatus,
  getRewardsCoupon,
};
