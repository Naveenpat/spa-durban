import { Request, Response } from "express";
import httpStatus from "http-status";
import { pick } from "../../../../utilities/pick";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import {
  loyaltyService,
  outletService,
  loyaltyLogService,
} from "../service.index";
import {
  DateFilter,
  FilterByItem,
  FilterQueryResult,
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
import { searchKeys, allowedDateFilterKeys } from "./schema.loyalty";
import * as loyaltyLogHelper from "../loyaltyLog/helper.loyaltyLog";
import mongoose from "mongoose";
import { UserEnum } from "../../../utils/enumUtils";

const createLoyalty = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    const { businessLocation } = req.body;
    // Fetch all outlets by their IDs
    const businessLocations = await Promise.all(
      businessLocation.map(async (ele: any) => {
        let outlet = await outletService.getOutletById(ele?.outletId);
        return outlet;
      })
    );

    // Check if any outlet is not found
    const notFoundoutlet = businessLocations.filter((outlet) => !outlet);

    if (notFoundoutlet.length > 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid branch");
    }
    const loyalty = await loyaltyService.createLoyalty(req.body);
    if (loyalty) {
      let loyaltyLogAdded = await loyaltyLogHelper.addToLoyaltyLog(
        loyalty,
        req.userData.Id
      );
    }
    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: loyalty,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getLoyaltys = catchAsync(
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
    // Extract searchValue from req.query
    const searchValue = req.query.searchValue as string | undefined;
    const searchIn = req.query.searchIn as string[] | null;
    const dateFilter = req.query.dateFilter as DateFilter | null;
    const filterBy = req.query.filterBy as any[];
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
      const objectIdFileds: string[] = [];

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
    // Additional query stages for lookup
    let additionalQuery = [
      { $match: outletQuery },

      {
        $unwind: "$businessLocation",
      },
      {
        $lookup: {
          from: "outlets",
          localField: "businessLocation.outletId",
          foreignField: "_id",
          as: "outletDetails",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$outletDetails",
      },
      {
        $addFields: {
          "businessLocation.outletName": "$outletDetails.name",
        },
      },
      {
        $group: {
          _id: "$_id",
          loyaltyProgramName: { $first: "$loyaltyProgramName" },
          businessLocation: { $push: "$businessLocation" },
          isDeleted: { $first: "$isDeleted" },
          isActive: { $first: "$isActive" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
    ];
    options["additionalQuery"] = additionalQuery as any;
    const result = await loyaltyService.queryLoyaltys(filter, options);
    return res.status(httpStatus.OK).send(result);
  }
);

// const getLoyalty = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     const loyalty = await loyaltyService.getLoyaltyAggrigate([
//       { $match: { _id: new mongoose.Types.ObjectId(req.params.loyaltyId) } },
//       {
//         $unwind: "$businessLocation",
//       },
//       {
//         $lookup: {
//           from: "outlets",
//           localField: "businessLocation.outletId",
//           foreignField: "_id",
//           as: "outletDetails",
//           pipeline: [
//             {
//               $match: {
//                 isDeleted: false,
//               },
//             },
//             {
//               $project: {
//                 name: 1,
//               },
//             },
//           ],
//         },
//       },
//       {
//         $unwind: "$outletDetails",
//       },
//       {
//         $addFields: {
//           "businessLocation.outletName": "$outletDetails.name",
//         },
//       },
//     ])
//     if (!loyalty) {
//       throw new ApiError(httpStatus.NOT_FOUND, "Loyalty not found")
//     }
//     return res.status(httpStatus.OK).send({
//       message: "Successfull.",
//       data: loyalty,
//       status: true,
//       code: "OK",
//       issue: null,
//     })
//   }
// )
const getLoyalty = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const loyalty = await loyaltyService.getLoyaltyAggrigate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.loyaltyId) } },
      {
        $lookup: {
          from: "outlets",
          localField: "businessLocation.outletId",
          foreignField: "_id",
          as: "outletDetails",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 0,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $set: {
          businessLocation: {
            $map: {
              input: "$businessLocation",
              as: "location",
              in: {
                $mergeObjects: [
                  "$$location",
                  {
                    outletName: {
                      $arrayElemAt: ["$outletDetails.name", 0],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          outletDetails: 0, // Unwanted field hatane ke liye
        },
      },
    ]);

    if (!loyalty) {
      throw new ApiError(httpStatus.NOT_FOUND, "Loyalty not found");
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: loyalty,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const updateLoyalty = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    const { businessLocation } = req.body;
    // Fetch all outlets by their IDs
    const businessLocations = await Promise.all(
      businessLocation.map((ele: any) =>
        outletService.getOutletById(ele?.outletId)
      )
    );

    // Check if any outlet is not found
    const notFoundoutlet = businessLocations.filter((outlet) => !outlet);

    if (notFoundoutlet.length > 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid branch");
    }
    const loyalty = await loyaltyService.updateLoyaltyById(
      req.params.loyaltyId,
      req.body
    );
    if (loyalty) {
      await loyaltyLogHelper.addToLoyaltyLog(loyalty, req.userData.Id);
    }
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: loyalty,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const deleteLoyalty = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await loyaltyService.deleteLoyaltyById(req.params.loyaltyId);
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const toggleLoyaltyStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const updatedLoyalty = await loyaltyService.toggleLoyaltyStatusById(
      req.params.loyaltyId
    );
    return res.status(httpStatus.OK).send({
      message: "Status updated successfully.",
      data: updatedLoyalty,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);
export {
  createLoyalty,
  getLoyaltys,
  getLoyalty,
  updateLoyalty,
  deleteLoyalty,
  toggleLoyaltyStatus,
};
