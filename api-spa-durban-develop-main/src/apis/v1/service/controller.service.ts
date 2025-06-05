import { Request, Response } from "express";
import httpStatus from "http-status";
import { pick } from "../../../../utilities/pick";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import {
  serviceService,
  categoryService,
  subCategoryService,
  outletService,
  productService,
  taxService,
} from "../service.index";
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
import { searchKeys, allowedDateFilterKeys } from "./schema.service";
import { UserEnum } from "../../../utils/enumUtils";
import mongoose from "mongoose";
import axios from "axios";
const createService = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { categoryId, subCategoryId, outletIds, products, taxId } = req.body;

    // category exists check
    let categoryExists = await categoryService.getCategoryById(categoryId);

    if (!categoryExists) {
      //throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category!")
    }

    // sub category exists check
    if (subCategoryId) {
      let subCategoryExists = await subCategoryService.getSubCategoryById(
        subCategoryId
      );
      if (!subCategoryExists) {
        // throw new ApiError(httpStatus.BAD_REQUEST, "Invalid sub category!")
      }
    }

    /*
     * check outlet exist
     */

    // Fetch all product by their IDs
    if (products.length) {
      const allProducts = await Promise.all(
        products.map((ele: any) =>
          productService.getProductById(ele?.productId)
        )
      );

      // Check if any product is not found
      const notFoundproducts = allProducts.filter((product) => !product);

      if (notFoundproducts.length > 0) {
        // throw new ApiError(httpStatus.NOT_FOUND, "Invalid products");
      }
    }

    // Fetch all product by their IDs
    const allProducts = await Promise.all(
      products.map((ele: any) => productService.getProductById(ele?.productId))
    );

    // Check if any product is not found
    const notFoundproducts = allProducts.filter((product) => !product);

    if (notFoundproducts.length > 0) {
      //throw new ApiError(httpStatus.NOT_FOUND, "Invalid products");
    }

    if (taxId) {
      // Fetch all outlets by their IDs
      const tax = await taxService.getTaxById(taxId);

      if (!tax) {
        //throw new ApiError(httpStatus.NOT_FOUND, "Invalid tax.");
      }
    }
    try {
      const otherData = await axios.post(
        `${process.env.BOOKING_API_BASE_URL}/customerData/treatment`,
        {
          name: req.body.serviceName,
          duration: req.body.duration,
          description: req.body.description,
          productTypeId: req.body.category,
        }
      );
      if (otherData?.data?.id) {
        req.body.bookingTreatmentsId = otherData.data.id;
      } else {
        console.warn("API response does not contain an ID.");
      }
    } catch (error) {
      console.error("Error adding booking customer:", error);

      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Status code:", error.response?.status);
      }
    }

    const service = await serviceService.createService(req.body);
    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: service,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getServices = catchAsync(
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

    let allOutlets = req?.userData?.outletsData?.map((ele: any) => {
      return new mongoose.Types.ObjectId(ele?._id);
    });

    if (!isAdmin) {
      outletQuery = {
        outletIds: {
          $in: allOutlets,
        },
      };
    }
    // Add searchValue to options if it exists
    if (searchValue) {
      let searchQueryCheck = checkInvalidParams(
        searchIn?.length ? searchIn : [],
        searchKeys
      );

      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send({
          ...searchQueryCheck,
        });
      }
      // Extract search query from options
      const searchQuery = getSearchQuery(
        searchIn?.length ? searchIn : [],
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
      const objectIdFileds: string[] = [
        "categoryId",
        "subCategoryId",
        "outletIds",
      ];

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
          from: "taxes", // The collection name in MongoDB
          localField: "taxId", // The field in the Service collection
          foreignField: "_id", // The field in the Outlet collection
          as: "tax", // The field name for the joined outlet data
          pipeline: [
            {
              $project: {
                _id: 1,
                taxType: 1,
                taxPercent: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "outlets", // The collection name in MongoDB
          localField: "outletIds", // The field in the Service collection
          foreignField: "_id", // The field in the Outlet collection
          as: "outletDetails", // The field name for the joined outlet data
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          outletNames: {
            $map: {
              input: "$outletDetails",
              as: "outlet",
              in: {
                outletId: "$$outlet._id",
                outletName: "$$outlet.name",
              },
            },
          },
        },
      },
      {
        $unset: ["outletDetails"],
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
          pipeline: [
            {
              $project: {
                _id: 1,
                productName: 1,
                productCode: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          products: {
            $map: {
              input: "$products",
              as: "originalProduct",
              in: {
                $mergeObjects: [
                  "$$originalProduct",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$productDetails",
                          as: "detail",
                          cond: {
                            $eq: [
                              "$$detail._id",
                              "$$originalProduct.productId",
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unset: "productDetails",
      },
      {
        $lookup: {
          from: "categories", // The collection name in MongoDB
          localField: "categoryId", // The field in the Service collection
          foreignField: "_id", // The field in the Category collection
          as: "categoryDetails", // The field name for the joined category data
          pipeline: [
            {
              $project: {
                categoryName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "subcategories", // The collection name in MongoDB
          localField: "subCategoryId", // The field in the Service collection
          foreignField: "_id", // The field in the Subcategory collection
          as: "subCategoryDetails", // The field name for the joined subcategory data
          pipeline: [
            {
              $project: {
                subCategoryName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          categoryName: {
            $arrayElemAt: ["$categoryDetails.categoryName", 0],
          },
          subCategoryName: {
            $arrayElemAt: ["$subCategoryDetails.subCategoryName", 0],
          },
          taxId: {
            $arrayElemAt: ["$tax._id", 0],
          },
          taxType: {
            $arrayElemAt: ["$tax.taxType", 0],
          },
          taxPercent: {
            $arrayElemAt: ["$tax.taxPercent", 0],
          },
        },
      },
      {
        $unset: ["categoryDetails", "subCategoryDetails", "outletIds", "tax"],
      },
    ];
    options["additionalQuery"] = additionalQuery as any;
    const result = await serviceService.queryServices(filter, options);
    return res.status(httpStatus.OK).send(result);
  }
);

const getService = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const service = await serviceService.getServiceById(req.params.serviceId);
    if (!service) {
      throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: service,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const updateService = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { categoryId, subCategoryId, outletIds, products, taxId } = req.body;

    // category exists check
    let categoryExists = await categoryService.getCategoryById(categoryId);
    if (!categoryExists) {
      //throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category!");
    }

    // sub category exists check
    if (subCategoryId) {
      let subCategoryExists = await subCategoryService.getSubCategoryById(
        subCategoryId
      );
      if (!subCategoryExists) {
        //throw new ApiError(httpStatus.BAD_REQUEST, "Invalid sub category!");
      }
    }
    /*
     * check outlet exist
     */

    // Fetch all outlets by their IDs
    const outlets = await Promise.all(
      outletIds.map((id: any) => outletService.getOutletById(id))
    );

    // Check if any outlet is not found
    const notFoundOutlets = outlets.filter((outlet) => !outlet);

    if (notFoundOutlets.length > 0) {
      //throw new ApiError(httpStatus.NOT_FOUND, "Invalid outlets");
    }

    // check product exists

    // Fetch all product by their IDs
    if (products.length) {
      const allProducts = await Promise.all(
        products.map((ele: any) =>
          productService.getProductById(ele?.productId)
        )
      );

      // Check if any product is not found
      const notFoundproducts = allProducts.filter((product) => !product);

      if (notFoundproducts.length > 0) {
        // throw new ApiError(httpStatus.NOT_FOUND, "Invalid products");
      }
    }

    if (taxId) {
      // Fetch all outlets by their IDs
      const tax = await taxService.getTaxById(taxId);

      if (!tax) {
        // throw new ApiError(httpStatus.NOT_FOUND, "Invalid tax.");
      }
    }

    const service = await serviceService.updateServiceById(
      req.params.serviceId,
      req.body
    );

    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: service,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);
const addServiceToTop = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { type } = req.body;
    let service = {};
    if (type === "add") {
      service = await serviceService.addServiceToTopData(req.params.serviceId);
    } else {
      service = await serviceService.removeServiceFromTopData(
        req.params.serviceId
      );
    }
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: service,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);
const deleteService = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await serviceService.deleteServiceById(req.params.serviceId);
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const toggleServiceStatus = catchAsync(async (req: Request, res: Response) => {
  const updatedService = await serviceService.toggleServiceStatusById(
    req.params.serviceId
  );
  return res.status(httpStatus.OK).send({
    message: "Status updated successfully.",
    data: updatedService,
    status: true,
    code: "OK",
    issue: null,
  });
});
export {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  toggleServiceStatus,
  addServiceToTop,
};
