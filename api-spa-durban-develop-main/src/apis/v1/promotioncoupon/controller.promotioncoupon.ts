import { Request, Response } from "express";
import httpStatus from "http-status";
import { pick } from "../../../../utilities/pick";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import { promotionCouponService, outletService } from "../service.index";
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
import { searchKeys, allowedDateFilterKeys } from "./schema.promotioncoupon";
import mongoose from "mongoose";
import { UserEnum } from "../../../utils/enumUtils";

import crypto from "crypto";
import PromotionCoupon from "./schema.promotioncoupon"; // Adjust the import path if needed

const generateUniqueCouponCode = async (): Promise<string> => {
  let isUnique = false;
  let couponCode = "";

  while (!isUnique) {
    // Generate a random 10-character alphanumeric code
    couponCode = crypto.randomBytes(5).toString("hex").toUpperCase();

    // Check if the code already exists in the database
    const existingCoupon = await PromotionCoupon.findOne({ couponCode });
    if (!existingCoupon) {
      isUnique = true;
    }
  }

  return couponCode;
};

const createPromotionCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    // Generate a unique coupon code
    req.body.couponCode = await generateUniqueCouponCode();

    const promotionCoupon = await promotionCouponService.createPromotionCoupon(
      req.body
    );

    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: promotionCoupon,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getPromotionCoupons = catchAsync(
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
    const result = await promotionCouponService.queryPromotionCoupons(
      filter,
      options
    );
    return res.status(httpStatus.OK).send(result);
  }
);

const updatePromotionCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    const promotionCoupon =
      await promotionCouponService.updatePromotionCouponById(
        req.params.promotionCouponId,
        req.body
      );

    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: promotionCoupon,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const deletePromotionCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await promotionCouponService.deletePromotionCouponById(
      req.params.promotionCouponId
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

const togglePromotionCouponStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const promotionCoupon = await promotionCouponService.getPromotionCouponById(
      req.params.promotionCouponId
    );
    if (!promotionCoupon) {
      throw new ApiError(httpStatus.NOT_FOUND, "PromotionCoupon not found");
    }
    promotionCoupon.isActive = !promotionCoupon.isActive;
    await promotionCoupon.save();
    return res.status(httpStatus.OK).send({
      message: "Status updated successfully.",
      data: promotionCoupon,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getPromotionCoupon = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const promotionCoupon = await promotionCouponService.getPromotionCouponById(
      req.params.promotionCouponId
    );

    if (!promotionCoupon || promotionCoupon.isDeleted) {
      throw new ApiError(httpStatus.NOT_FOUND, "PromotionCoupon not found");
    }

    return res.status(httpStatus.OK).send({
      message: "Successful.",
      data: promotionCoupon,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

export {
  createPromotionCoupon,
  getPromotionCoupons,
  updatePromotionCoupon,
  deletePromotionCoupon,
  togglePromotionCouponStatus,
  getPromotionCoupon,
};
