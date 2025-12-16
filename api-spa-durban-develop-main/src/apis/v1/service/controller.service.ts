import { Request, response, Response } from "express";
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
import pool from "../../../../database/postgres";

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

// const createBookingSyncService = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     let { categoryId, subCategoryId, outletIds, products, taxId } = req.body;

//     // category exists check
//     let categoryExists = await categoryService.getCategoryById(categoryId);
//     if (!categoryExists) {
//       // throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category!")
//     }

//     // sub category exists check
//     if (subCategoryId) {
//       let subCategoryExists = await subCategoryService.getSubCategoryById(subCategoryId);
//       if (!subCategoryExists) {
//         // throw new ApiError(httpStatus.BAD_REQUEST, "Invalid sub category!")
//       }
//     }

//     // product check
//     if (products?.length) {
//       const allProducts = await Promise.all(
//         products.map((ele: any) => productService.getProductById(ele?.productId))
//       );

//       const notFoundproducts = allProducts.filter((product) => !product);
//       if (notFoundproducts.length > 0) {
//         // throw new ApiError(httpStatus.NOT_FOUND, "Invalid products");
//       }
//     }

//     // tax check
//     if (taxId) {
//       const tax = await taxService.getTaxById(taxId);
//       if (!tax) {
//         // throw new ApiError(httpStatus.NOT_FOUND, "Invalid tax.");
//       }
//     }

//     // 🔹 Booking API integration removed
//     // (Now only POS MongoDB me service create hogi)

//     const service = await serviceService.createService(req.body);

//     return res.status(httpStatus.CREATED).send({
//       message: "Added successfully!",
//       data: service,
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );


const createBookingSyncService = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { categoryId, subCategoryId, outletIds, products, taxId, productTypeId } = req.body;

    // 🔹 Agar bookingProductTypeId se category nikalni hai
    let bookingCategory: any = null;
    if (productTypeId) {
      bookingCategory = await categoryService.getCategoryByBookingProductTypeId(productTypeId);
    }

    // category exists check
    let categoryExists = null;
    if (categoryId) {
      categoryExists = await categoryService.getCategoryById(categoryId);
      if (!categoryExists) {
        // throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category!");
      }
    }

    // sub category exists check
    if (subCategoryId) {
      let subCategoryExists = await subCategoryService.getSubCategoryById(subCategoryId);
      if (!subCategoryExists) {
        // throw new ApiError(httpStatus.BAD_REQUEST, "Invalid sub category!");
      }
    }

    // product check
    if (products?.length) {
      const allProducts = await Promise.all(
        products.map((ele: any) => productService.getProductById(ele?.productId))
      );

      const notFoundproducts = allProducts.filter((product) => !product);
      if (notFoundproducts.length > 0) {
        // throw new ApiError(httpStatus.NOT_FOUND, "Invalid products");
      }
    }

    // tax check
    if (taxId) {
      const tax = await taxService.getTaxById(taxId);
      if (!tax) {
        // throw new ApiError(httpStatus.NOT_FOUND, "Invalid tax.");
      }
    }

    // 🔹 Prepare final payload for Mongo service creation
    const payload: any = {
      ...req.body,
    };

    // agar booking se category mili hai to usko categoryIds me daal do
    if (bookingCategory?._id) {
      payload.categoryIds = [bookingCategory._id];
    }

    const service = await serviceService.createService(payload);

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
          localField: "categoryIds", // The field in the Service collection
          foreignField: "_id", // The field in the Category collection
          as: "categoryDetails", // The field name for the joined category data
          pipeline: [
            {
              $project: {
                _id: 1,
                categoryName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "subcategories", // The collection name in MongoDB
          localField: "subCategoryIds", // The field in the Service collection
          foreignField: "_id", // The field in the Subcategory collection
          as: "subCategoryDetails", // The field name for the joined subcategory data
          pipeline: [
            {
              $project: {
                _id: 1,
                subCategoryName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          categoryName: {
            $map: {
              input: "$categoryDetails",
              as: "category",
              in: {
                catId: "$$category._id",
                categoryNames: "$$category.categoryName",
              },
            },
          },
          // categoryName: {
          //   $reduce: {
          //     input: "$categoryDetails.categoryName",
          //     initialValue: "",
          //     in: {
          //       $concat: [
          //         "$$value",
          //         { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
          //         "$$this"
          //       ]
          //     }
          //   }
          // },
          subCategoryName: {
            $map: {
              input: "$subCategoryDetails",
              as: "subcategory",
              in: {
                subId: "$$subcategory._id",
                subCategoryNames: "$$subcategory.subCategoryName",
              },
            },
          },
          // subCategoryName: {
          //   $reduce: {
          //     input: "$subCategoryDetails.subCategoryName",
          //     initialValue: "",
          //     in: {
          //       $concat: [
          //         "$$value",
          //         { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
          //         "$$this"
          //       ]
          //     }
          //   }
          // },
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

// const updateService = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     let { categoryId, subCategoryId, outletIds, products, taxId } = req.body;

//     // category exists check
//     let categoryExists = await categoryService.getCategoryById(categoryId);
//     if (!categoryExists) {
//       //throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category!");
//     }

//     // sub category exists check
//     if (subCategoryId) {
//       let subCategoryExists = await subCategoryService.getSubCategoryById(
//         subCategoryId
//       );
//       if (!subCategoryExists) {
//         //throw new ApiError(httpStatus.BAD_REQUEST, "Invalid sub category!");
//       }
//     }
//     /*
//      * check outlet exist
//      */

//     // Fetch all outlets by their IDs
//     const outlets = await Promise.all(
//       outletIds.map((id: any) => outletService.getOutletById(id))
//     );

//     // Check if any outlet is not found
//     const notFoundOutlets = outlets.filter((outlet) => !outlet);

//     if (notFoundOutlets.length > 0) {
//       //throw new ApiError(httpStatus.NOT_FOUND, "Invalid outlets");
//     }

//     // check product exists

//     // Fetch all product by their IDs
//     if (products.length) {
//       const allProducts = await Promise.all(
//         products.map((ele: any) =>
//           productService.getProductById(ele?.productId)
//         )
//       );

//       // Check if any product is not found
//       const notFoundproducts = allProducts.filter((product) => !product);

//       if (notFoundproducts.length > 0) {
//         // throw new ApiError(httpStatus.NOT_FOUND, "Invalid products");
//       }
//     }

//     if (taxId) {
//       // Fetch all outlets by their IDs
//       const tax = await taxService.getTaxById(taxId);

//       if (!tax) {
//         // throw new ApiError(httpStatus.NOT_FOUND, "Invalid tax.");
//       }
//     }

//     const service = await serviceService.updateServiceById(
//       req.params.serviceId,
//       req.body
//     );

//     return res.status(httpStatus.OK).send({
//       message: "Updated successfully!",
//       data: service,
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );

const updateService = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { categoryId, subCategoryId, outletIds, products, taxId } = req.body;

    // category exists check (only if provided)
    if (categoryId) {
      let categoryExists = await categoryService.getCategoryById(categoryId);
      if (!categoryExists) {
        // throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category!");
      }
    }

    // sub category exists check (only if provided)
    if (subCategoryId) {
      let subCategoryExists = await subCategoryService.getSubCategoryById(subCategoryId);
      if (!subCategoryExists) {
        // throw new ApiError(httpStatus.BAD_REQUEST, "Invalid sub category!");
      }
    }

    // check outlet exist (only if provided)
    if (Array.isArray(outletIds) && outletIds.length > 0) {
      const outlets = await Promise.all(
        outletIds.map((id: any) => outletService.getOutletById(id))
      );

      const notFoundOutlets = outlets.filter((outlet) => !outlet);
      if (notFoundOutlets.length > 0) {
        // throw new ApiError(httpStatus.NOT_FOUND, "Invalid outlets");
      }
    }

    // check products exist (only if provided)
    if (Array.isArray(products) && products.length > 0) {
      const allProducts = await Promise.all(
        products.map((ele: any) => productService.getProductById(ele?.productId))
      );

      const notFoundproducts = allProducts.filter((product) => !product);
      if (notFoundproducts.length > 0) {
        // throw new ApiError(httpStatus.NOT_FOUND, "Invalid products");
      }
    }

    // check taxId exist (only if provided)
    if (taxId) {
      const tax = await taxService.getTaxById(taxId);
      if (!tax) {
        // throw new ApiError(httpStatus.NOT_FOUND, "Invalid tax.");
      }
    }
    

    // finally update
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

// const updateBookingSyncService = catchAsync(
//   async (req: AuthenticatedRequest, res: Response) => {
//     let { categoryId, subCategoryId, outletIds, products, taxId } = req.body;

//     // category exists check (only if provided)
//     if (categoryId) {
//       let categoryExists = await categoryService.getCategoryById(categoryId);
//       if (!categoryExists) {
//         // throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category!");
//       }
//     }

//     // sub category exists check (only if provided)
//     if (subCategoryId) {
//       let subCategoryExists = await subCategoryService.getSubCategoryById(subCategoryId);
//       if (!subCategoryExists) {
//         // throw new ApiError(httpStatus.BAD_REQUEST, "Invalid sub category!");
//       }
//     }

//     // check outlet exist (only if provided)
//     if (Array.isArray(outletIds) && outletIds.length > 0) {
//       const outlets = await Promise.all(
//         outletIds.map((id: any) => outletService.getOutletById(id))
//       );

//       const notFoundOutlets = outlets.filter((outlet) => !outlet);
//       if (notFoundOutlets.length > 0) {
//         // throw new ApiError(httpStatus.NOT_FOUND, "Invalid outlets");
//       }
//     }

//     // check products exist (only if provided)
//     if (Array.isArray(products) && products.length > 0) {
//       const allProducts = await Promise.all(
//         products.map((ele: any) => productService.getProductById(ele?.productId))
//       );

//       const notFoundproducts = allProducts.filter((product) => !product);
//       if (notFoundproducts.length > 0) {
//         // throw new ApiError(httpStatus.NOT_FOUND, "Invalid products");
//       }
//     }

//     // check taxId exist (only if provided)
//     if (taxId) {
//       const tax = await taxService.getTaxById(taxId);
//       if (!tax) {
//         // throw new ApiError(httpStatus.NOT_FOUND, "Invalid tax.");
//       }
//     }

//     // 🔹 finally update by bookingTreatmentsId
//     const service = await serviceService.updateServiceByFilter(
//       { bookingTreatmentsId: req.params.bookingTreatmentsId }, // filter
//       req.body
//     );

//     if (!service) {
//       return res.status(httpStatus.NOT_FOUND).send({
//         message: "Service not found with given bookingTreatmentsId",
//         data: null,
//         status: false,
//         code: "NOT_FOUND",
//         issue: null,
//       });
//     }

//     return res.status(httpStatus.OK).send({
//       message: "Updated successfully!",
//       data: service,
//       status: true,
//       code: "OK",
//       issue: null,
//     });
//   }
// );

const updateBookingSyncService = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { categoryId, subCategoryId, outletIds, products, taxId, productTypeId } = req.body;

    // category exists check (only if provided)
    if (categoryId) {
      let categoryExists = await categoryService.getCategoryById(categoryId);
      if (!categoryExists) {
        // throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category!");
      }
    }

    // sub category exists check (only if provided)
    if (subCategoryId) {
      let subCategoryExists = await subCategoryService.getSubCategoryById(subCategoryId);
      if (!subCategoryExists) {
        // throw new ApiError(httpStatus.BAD_REQUEST, "Invalid sub category!");
      }
    }

    // check outlet exist (only if provided)
    if (Array.isArray(outletIds) && outletIds.length > 0) {
      const outlets = await Promise.all(
        outletIds.map((id: any) => outletService.getOutletById(id))
      );

      const notFoundOutlets = outlets.filter((outlet) => !outlet);
      if (notFoundOutlets.length > 0) {
        // throw new ApiError(httpStatus.NOT_FOUND, "Invalid outlets");
      }
    }

    // check products exist (only if provided)
    if (Array.isArray(products) && products.length > 0) {
      const allProducts = await Promise.all(
        products.map((ele: any) => productService.getProductById(ele?.productId))
      );

      const notFoundproducts = allProducts.filter((product) => !product);
      if (notFoundproducts.length > 0) {
        // throw new ApiError(httpStatus.NOT_FOUND, "Invalid products");
      }
    }

    // check taxId exist (only if provided)
    if (taxId) {
      const tax = await taxService.getTaxById(taxId);
      if (!tax) {
        // throw new ApiError(httpStatus.NOT_FOUND, "Invalid tax.");
      }
    }

    // 🔹 bookingProductTypeId → category mapping
    if (productTypeId) {
      const bookingCategory = await categoryService.getCategoryByBookingProductTypeId(productTypeId);
      if (bookingCategory?._id) {
        req.body.categoryIds = [bookingCategory._id];
      }
    }

    // 🔹 finally update by bookingTreatmentsId
    const service = await serviceService.updateServiceByFilter(
      { bookingTreatmentsId: req.params.bookingTreatmentsId }, // filter
      req.body
    );

    if (!service) {
      return res.status(httpStatus.NOT_FOUND).send({
        message: "Service not found with given bookingTreatmentsId",
        data: null,
        status: false,
        code: "NOT_FOUND",
        issue: null,
      });
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

const deleteServiceByBookingId = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { bookingTreatmentsId } = req.params;

    // 1. Apne booking DB se delete/update mark karo
    await serviceService.deleteServiceByBookingTreatmentsId(bookingTreatmentsId);

    // 2. POS me bhi delete sync karna
    // await axios.delete(
    //   `${process.env.POS_API_BASE_URL}/service/booking-sync/delete/${bookingTreatmentsId}`
    // );

    return res.status(httpStatus.OK).send({
      message: "Service deleted successfully",
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

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const { storeId, mobile, email, serviceName, startDate, endDate, page = 1, limit = 10 } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  let conditions: string[] = [];
  let values: any[] = [];
  let idx = 1;

  if (storeId) {
    conditions.push(`b."StoreId" = $${idx++}`);
    values.push(storeId);
  }

  if (mobile) {
    conditions.push(`c."mobile" ILIKE $${idx++}`);
    values.push(`%${mobile}%`);
  }

  if (email) {
    conditions.push(`c."email" ILIKE $${idx++}`);
    values.push(`%${email}%`);
  }

  if (serviceName) {
    conditions.push(`t."name" ILIKE $${idx++}`);
    values.push(`%${serviceName}%`);
  }

  if (startDate) {
    conditions.push(`b."bookingDateTimeStamp" >= $${idx++}`);
    values.push(startDate);
  }

  if (endDate) {
    conditions.push(`b."bookingDateTimeStamp" <= $${idx++}`);
    values.push(endDate);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // main query with pagination
  const query = `
    SELECT 
      b."id" AS "bookingId",
      b."bookingNumber",
      b."invoiceNumber",
      b."duration",
      b."bookingDateTimeStamp",
      b."startTime",
      b."endTime",
      b."createdAt",
      b."createdByUser",

      -- customer info
      c."firstName" || ' ' || c."lastName" AS "customerName",
      c."email" AS "customerEmail",
      c."mobile" AS "customerPhone",

      -- branch/store info
      s."name" AS "branchName",

      -- treatment info
      json_agg(t."name") AS "services"
      
    FROM public."Bookings" b
    LEFT JOIN public."Customers" c ON c."id" = b."CustomerId"
    LEFT JOIN public."Stores" s ON s."id" = b."StoreId"
    LEFT JOIN public."BookingsTreatment" bt ON bt."BookingId" = b."id"
    LEFT JOIN public."Treatments" t ON t."id" = bt."TreatmentId"
    ${whereClause}
    GROUP BY b."id", c."firstName", c."lastName", c."email", c."mobile", s."name"
    ORDER BY b."bookingDateTimeStamp" DESC
    LIMIT $${idx++} OFFSET $${idx++};
  `;

  values.push(limit);
  values.push(offset);

  // total count query (without pagination)
  const countQuery = `
    SELECT COUNT(DISTINCT b."id") AS total
    FROM public."Bookings" b
    LEFT JOIN public."Customers" c ON c."id" = b."CustomerId"
    LEFT JOIN public."Stores" s ON s."id" = b."StoreId"
    LEFT JOIN public."BookingsTreatment" bt ON bt."BookingId" = b."id"
    LEFT JOIN public."Treatments" t ON t."id" = bt."TreatmentId"
    ${whereClause};
  `;

  const result = await pool.query(query, values);
  const countResult = await pool.query(countQuery, values.slice(0, idx - 3)); // count query me limit+offset nahi dena

  const totalCount = Number(countResult.rows[0].total);

  res.status(200).json({
    success: true,
    count: totalCount,
    currentPage: Number(page),
    totalPages: Math.ceil(totalCount / Number(limit)),
    data: result.rows,
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
  getAllBookings,
  createBookingSyncService,
  updateBookingSyncService,
  deleteServiceByBookingId
};
