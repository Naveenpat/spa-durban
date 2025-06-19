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
import Customer from "../customer/schema.customer";
import Service from "../service/schema.service";
import { sendEmail } from "../../../helper/sendEmail";

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

    const { customerId, serviceId } = req.body;
    const customers = await Customer.find({ _id: { $in: customerId } });
    const services = await Service.find({ _id: { $in: serviceId } });
    const serviceListHTML = services.map(s => `<li>${s.serviceName}</li>`).join('');

    for (const user of customers) {
      const emailData = {
        sendTo: user.email,
        emailSubject: `🎉 You're Eligible for Spa Rewards!`,
        emailBody: `
  <p>Hi ${user.customerName || 'Customer'},</p>

  <p>We're excited to offer you an exclusive <strong>${req.body.discountByPercentage}% OFF</strong> on the following premium services:</p>

  <ul>${serviceListHTML}</ul>

  <p>Use the coupon code below during checkout to claim your discount:</p>

  <div style="margin: 16px 0; font-size: 20px; font-weight: bold; color: #d63384;">
    ${promotionCoupon.couponCode}
  </div>

  <p>Click the button below to copy the coupon code:</p>

  <button 
    onclick="navigator.clipboard.writeText('${promotionCoupon.couponCode}')"
    style="padding: 10px 20px; background: #d63384; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;"
  >
    Copy Coupon Code
  </button>

  <br/><br/>

  <p>This offer is valid for a limited time only, so don't miss out!</p>

  <p>Cheers,</p>
  <p><em>The Spa Durban Team</em></p>
`,
      };

      const outlet = {}; // or fetch outlet info if required
      // await sendEmail(emailData, outlet);
    }

    console.log('-----customers', customers)
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

const getAllTypeCoupons = async (req: Request, res: Response) => {
  try {
    const customerId = req.query.customerId as string;
    const items = req.query.items as string[];
    const coupons = await promotionCouponService.aggregateAllCoupons(customerId, items);
    return res.status(httpStatus.OK).json({ success: true, data: coupons });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false
    });
  }
};

export {
  createPromotionCoupon,
  getPromotionCoupons,
  updatePromotionCoupon,
  deletePromotionCoupon,
  togglePromotionCouponStatus,
  getPromotionCoupon,
  getAllTypeCoupons
};
