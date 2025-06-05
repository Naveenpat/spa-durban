import { Request, Response } from "express";
import httpStatus from "http-status";
import { pick } from "../../../../utilities/pick";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import * as serviceService from "../service/service.service";
import * as subcategorySerivce from "../subCategory/service.subCategory";
import * as measurementSerivce from "../measurementUnit/service.measurementUnit";
import {
  productService,
  subCategoryService,
  measurementUnitService,
  brandService,
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
import mongoose, { Document, Model, ObjectId } from "mongoose";
import { searchKeys, allowedDateFilterKeys } from "./schema.product";
import { availableMemory } from "process";
import { UserEnum } from "../../../utils/enumUtils";

const createProduct = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { taxId, subCategoryId, brandId, measurementUnitId } = req.body;
    /*
     * check sub - category exist
     */
    const subcategory = await subCategoryService.getSubCategoryById(
      subCategoryId
    );
    if (!subcategory) {
      //throw new ApiError(httpStatus.NOT_FOUND, "Sub-category not found")
    }
    req.body.categoryId = subcategory?.categoryId;

    /*
     * check brand exist
     */
    const brand = await brandService.getBrandById(brandId);
    if (!brand) {
      //throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
    }
    /*
     * check measurement unit exist
     */
    const measurementUnit = await measurementUnitService.getMeasurementUnitById(
      measurementUnitId
    );
    if (!measurementUnit) {
      // throw new ApiError(httpStatus.NOT_FOUND, "Measurement unit not found");
    }

    // Fetch all outlets by their IDs
    const tax = await taxService.getTaxById(taxId);

    if (!tax) {
      //throw new ApiError(httpStatus.NOT_FOUND, "Invalid tax.");
    }

    const product = await productService.createProduct(req.body);
    return res.status(httpStatus.CREATED).send({
      message: "Added Successfully!",
      data: product,
      status: true,
      code: "CREATED",
      issue: null,
    });
  }
);

const getProducts = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = pick(req.query, ["categoryId", "brandId", "subCategoryId"]);
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
    if (isPaginationRequiredParam !== undefined) {
      const isPaginationRequired = isPaginationRequiredParam === "true";

      options.isPaginationRequired = isPaginationRequired as any;
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
        "brandId",
        "measurementUnitId",
        "taxIds",
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
        $addFields: {
          taxes: {
            $map: {
              input: "$taxesDetails",
              as: "tax",
              in: {
                taxId: "$$tax._id",
                taxType: "$$tax.taxType",
                taxPercent: "$$tax.taxPercent",
              },
            },
          },
        },
      },
      {
        $unset: ["taxesDetails"],
      },
      {
        $lookup: {
          from: "categories", // The collection name in MongoDB
          localField: "categoryId", // The field in the Employee collection
          foreignField: "_id", // The field in the Category collection
          as: "categoryData", // The field name for the joined category data
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
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
          from: "subcategories",
          localField: "subCategoryId",
          foreignField: "_id",
          as: "subcategoryData",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                subCategoryName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brandData",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                brandName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "measurementunits",
          localField: "measurementUnitId",
          foreignField: "_id",
          as: "measurementUnitData",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                unitName: 1,
                unitCode: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          categoryName: {
            $arrayElemAt: ["$categoryData.categoryName", 0],
          },
          subCategoryName: {
            $arrayElemAt: ["$subcategoryData.subCategoryName", 0],
          },
          unitName: {
            $arrayElemAt: ["$measurementUnitData.unitName", 0],
          },
          unitCode: {
            $arrayElemAt: ["$measurementUnitData.unitCode", 0],
          },
          brandName: {
            $arrayElemAt: ["$brandData.brandName", 0],
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
        $unset: [
          "categoryData",
          "subcategoryData",
          "measurementUnitData",
          "brandData",
          "tax",
        ],
      },
    ];

    options["additionalQuery"] = additionalQuery as any;
    const result = await productService.queryProducts(filter, options);
    return res.status(httpStatus.OK).send(result);
  }
);

const searchInProductAndService = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Extract searchValue from req.query
    const productOptions = pick(req.query, ["searchValue"]);
    const serviceOptions = pick(req.query, ["searchValue"]);
    const searchValue = req.query.searchValue as string;

    const outletId = req.query.outletId as string;
    const filterBy = req.query.filterBy as any[];

    const searchIn = req.query.searchIn as string[] | null;

    let productMatchQuery: any = {
      $and: [{ isDeleted: false }],
    };
    let serviceMatchQuery: any = {
      $and: [
        { isDeleted: false },
        { outletIds: new mongoose.Types.ObjectId(outletId) },
      ],
    };
    // Add searchValue to options if it exists
    if (searchValue) {
      let searchQueryCheck = checkInvalidParams(searchIn ? searchIn : [], [
        "productName",
        "productCode",
      ]);

      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send({
          ...searchQueryCheck,
        });
      }
      // Extract search query from options
      const productsearchQuery = getSearchQuery(
        searchIn ? searchIn : [],
        ["productName", "productCode"],
        searchValue
      );
      if (productsearchQuery !== null) {
        productOptions["search"] = { $or: productsearchQuery } as any;
        productMatchQuery.$and.push({ $or: productsearchQuery });
      }
      // Extract search query from options
      const serviceSearchQuery = getSearchQuery(
        searchIn ? searchIn : [],
        ["serviceName", "serviceCode"],
        searchValue
      );
      if (serviceSearchQuery !== null) {
        serviceOptions["search"] = { $or: serviceSearchQuery } as any;
        serviceMatchQuery.$and.push({ $or: serviceSearchQuery });
      }
    }

    //check filter by
    if (filterBy?.length) {
      const booleanFields: string[] = ["isActive"];
      const numberFileds: string[] = [];
      const objectIdFileds: string[] = [
        "categoryId",
        "subCategoryId",
        "brandId",
        "measurementUnitId",
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
        productMatchQuery.$and.push({ $and: filterQuery });
        serviceMatchQuery.$and.push({ $and: filterQuery });
      }
    }

    const dataToSend: Array<{
      _id: mongoose.Schema.Types.ObjectId | null;
      itemName: string;
      itemCode: string;
      mrp: number;
      sellingPrice: number;
      purchasePrice: number;
      taxId: mongoose.Schema.Types.ObjectId | null;
      taxType: string;
      taxPercent: number;
      itemUrl: string;
      type: string;
      availableQuantity: number;
      bookingTreatmentsId: string;
      colorCode?: string;
      priority?: number;
      pinned?: boolean;
    }> = [];

    const productResult = await productService.aggregateQuery([
      { $match: productMatchQuery },
      {
        $lookup: {
          from: "inventories", // The collection name in MongoDB
          localField: "_id", // The field in the Service collection
          foreignField: "productId", // The field in the Outlet collection
          as: "inventoryExists", // The field name for the joined outlet data
          pipeline: [
            {
              $match: {
                isSoldOut: false,
                isDeleted: false,
                outletId: new mongoose.Types.ObjectId(outletId),
              },
            },
            {
              $project: {
                _id: 0,
                availableQantity: {
                  $subtract: ["$quantity", "$saleQuantity"],
                },
              },
            },
          ],
        },
      },
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
        $addFields: {
          taxes: {
            $map: {
              input: "$taxesDetails",
              as: "tax",
              in: {
                taxId: "$$tax._id",
                taxType: "$$tax.taxType",
                taxPercent: "$$tax.taxPercent",
              },
            },
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
          availableQuantity: {
            $sum: "$inventoryExists.availableQantity",
          },
        },
      },
      {
        $match: { availableQuantity: { $gt: 0 } },
      },
      {
        $unset: ["taxesDetails"],
      },
    ]);
    const serviceResult = await serviceService.aggregateQuery([
      {
        $match: {
          ...serviceMatchQuery,
        },
      },
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
          from: "categories", // The collection name in MongoDB
          localField: "categoryId", // The field in the Employee collection
          foreignField: "_id", // The field in the Category collection
          as: "categoryData", // The field name for the joined category data
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                colorCode: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          taxes: {
            $map: {
              input: "$taxesDetails",
              as: "tax",
              in: {
                taxId: "$$tax._id",
                taxType: "$$tax.taxType",
                taxPercent: "$$tax.taxPercent",
              },
            },
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
          colorCode: {
            $arrayElemAt: ["$categoryData.colorCode", 0],
          },
        },
      },
      {
        $unset: ["taxesDetails"],
      },
      {
        $sort: {
          pinned: -1, // Pinned services appear first
          priority: 1, // Lower priority value appears first
        },
      },
    ]);

    if (productResult.length) {
      for (let each in productResult) {
        let {
          _id,
          productName,
          productCode,
          mrp,
          sellingPrice,
          purchasePrice,
          barcode,
          taxId,
          taxType,
          taxPercent,
          productImageUrl,
          availableQuantity,
        } = productResult[each];
        dataToSend.push({
          _id: _id,
          itemName: productName,
          itemCode: productCode,
          mrp: mrp,
          sellingPrice: sellingPrice,
          purchasePrice: purchasePrice,
          taxId: taxId,
          taxType: taxType,
          taxPercent: taxPercent,
          itemUrl: productImageUrl,
          type: "PRODUCT",
          availableQuantity: availableQuantity,
          bookingTreatmentsId: "",
        });
      }
    }

    if (serviceResult.length) {
      for (let each in serviceResult) {
        let {
          _id,
          serviceName,
          serviceCode,
          sellingPrice,
          taxId,
          taxType,
          taxPercent,
          serviceImageUrl,
          bookingTreatmentsId,
          colorCode,
          pinned,
          priority,
        } = serviceResult[each];

        dataToSend.push({
          _id: _id,
          itemName: serviceName,
          itemCode: serviceCode,
          mrp: 0,
          sellingPrice: sellingPrice,
          purchasePrice: 0,
          taxId: taxId || null,
          taxType: taxType,
          taxPercent: taxPercent,
          itemUrl: serviceImageUrl,
          type: "SERVICE",
          availableQuantity: 0,
          bookingTreatmentsId: bookingTreatmentsId,
          colorCode: colorCode,
          pinned: pinned,
          priority: priority,
        });
      }
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: dataToSend,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const searchInProductAndServiceAll = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Extract searchValue from req.query
    const productOptions = pick(req.query, ["searchValue"]);
    const serviceOptions = pick(req.query, ["searchValue"]);
    const searchValue = req.query.searchValue as string;

    const outletId = req.query.outletId as string;
    const filterBy = req.query.filterBy as any[];

    const searchIn = req.query.searchIn as string[] | null;

    let productMatchQuery: any = {
      $and: [{ isDeleted: false }],
    };
    let serviceMatchQuery: any = {
      $and: [
        { isDeleted: false },
        // { outletIds: new mongoose.Types.ObjectId(outletId) },
      ],
    };
    // Add searchValue to options if it exists
    if (searchValue) {
      let searchQueryCheck = checkInvalidParams(searchIn ? searchIn : [], [
        "productName",
        "productCode",
      ]);

      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send({
          ...searchQueryCheck,
        });
      }
      // Extract search query from options
      const productsearchQuery = getSearchQuery(
        searchIn ? searchIn : [],
        ["productName", "productCode"],
        searchValue
      );
      if (productsearchQuery !== null) {
        productOptions["search"] = { $or: productsearchQuery } as any;
        productMatchQuery.$and.push({ $or: productsearchQuery });
      }
      // Extract search query from options
      const serviceSearchQuery = getSearchQuery(
        searchIn ? searchIn : [],
        ["serviceName", "serviceCode"],
        searchValue
      );
      if (serviceSearchQuery !== null) {
        serviceOptions["search"] = { $or: serviceSearchQuery } as any;
        serviceMatchQuery.$and.push({ $or: serviceSearchQuery });
      }
    }

    //check filter by
    if (filterBy?.length) {
      const booleanFields: string[] = ["isActive"];
      const numberFileds: string[] = [];
      const objectIdFileds: string[] = [
        "categoryId",
        "subCategoryId",
        "brandId",
        "measurementUnitId",
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
        productMatchQuery.$and.push({ $and: filterQuery });
        serviceMatchQuery.$and.push({ $and: filterQuery });
      }
    }

    const dataToSend: Array<{
      _id: mongoose.Schema.Types.ObjectId | null;
      itemName: string;
      itemCode: string;
      mrp: number;
      sellingPrice: number;
      purchasePrice: number;
      taxId: mongoose.Schema.Types.ObjectId | null;
      taxType: string;
      taxPercent: number;
      itemUrl: string;
      type: string;
      availableQuantity: number;
      bookingTreatmentsId: string;
      colorCode?: string;
      priority?: number;
      pinned?: boolean;
    }> = [];

    const productResult = await productService.aggregateQuery([
      { $match: productMatchQuery },
      {
        $lookup: {
          from: "inventories", // The collection name in MongoDB
          localField: "_id", // The field in the Service collection
          foreignField: "productId", // The field in the Outlet collection
          as: "inventoryExists", // The field name for the joined outlet data
          pipeline: [
            {
              $match: {
                isSoldOut: false,
                isDeleted: false,
                outletId: new mongoose.Types.ObjectId(outletId),
              },
            },
            {
              $project: {
                _id: 0,
                availableQantity: {
                  $subtract: ["$quantity", "$saleQuantity"],
                },
              },
            },
          ],
        },
      },
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
        $addFields: {
          taxes: {
            $map: {
              input: "$taxesDetails",
              as: "tax",
              in: {
                taxId: "$$tax._id",
                taxType: "$$tax.taxType",
                taxPercent: "$$tax.taxPercent",
              },
            },
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
          availableQuantity: {
            $sum: "$inventoryExists.availableQantity",
          },
        },
      },
      {
        $match: { availableQuantity: { $gt: 0 } },
      },
      {
        $unset: ["taxesDetails"],
      },
    ]);
    const serviceResult = await serviceService.aggregateQuery([
      {
        $match: {
          ...serviceMatchQuery,
        },
      },
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
          from: "categories", // The collection name in MongoDB
          localField: "categoryId", // The field in the Employee collection
          foreignField: "_id", // The field in the Category collection
          as: "categoryData", // The field name for the joined category data
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                colorCode: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          taxes: {
            $map: {
              input: "$taxesDetails",
              as: "tax",
              in: {
                taxId: "$$tax._id",
                taxType: "$$tax.taxType",
                taxPercent: "$$tax.taxPercent",
              },
            },
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
          colorCode: {
            $arrayElemAt: ["$categoryData.colorCode", 0],
          },
        },
      },
      {
        $unset: ["taxesDetails"],
      },
      {
        $sort: {
          pinned: -1, // Pinned services appear first
          priority: 1, // Lower priority value appears first
        },
      },
    ]);

    if (productResult.length) {
      for (let each in productResult) {
        let {
          _id,
          productName,
          productCode,
          mrp,
          sellingPrice,
          purchasePrice,
          barcode,
          taxId,
          taxType,
          taxPercent,
          productImageUrl,
          availableQuantity,
        } = productResult[each];
        dataToSend.push({
          _id: _id,
          itemName: productName,
          itemCode: productCode,
          mrp: mrp,
          sellingPrice: sellingPrice,
          purchasePrice: purchasePrice,
          taxId: taxId,
          taxType: taxType,
          taxPercent: taxPercent,
          itemUrl: productImageUrl,
          type: "PRODUCT",
          availableQuantity: availableQuantity,
          bookingTreatmentsId: "",
        });
      }
    }

    if (serviceResult.length) {
      for (let each in serviceResult) {
        let {
          _id,
          serviceName,
          serviceCode,
          sellingPrice,
          taxId,
          taxType,
          taxPercent,
          serviceImageUrl,
          bookingTreatmentsId,
          colorCode,
          pinned,
          priority,
        } = serviceResult[each];

        dataToSend.push({
          _id: _id,
          itemName: serviceName,
          itemCode: serviceCode,
          mrp: 0,
          sellingPrice: sellingPrice,
          purchasePrice: 0,
          taxId: taxId || null,
          taxType: taxType,
          taxPercent: taxPercent,
          itemUrl: serviceImageUrl,
          type: "SERVICE",
          availableQuantity: 0,
          bookingTreatmentsId: bookingTreatmentsId,
          colorCode: colorCode,
          pinned: pinned,
          priority: priority,
        });
      }
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: dataToSend,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getProduct = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const product = await productService.getProductById(req.params.productId);
    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: product,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getProductDetailByBarcode = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let aggregationQuery: any = [
      {
        $match: {
          barcode: req.params.barcode,
          isDeleted: false,
        },
      },
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
          from: "categories", // The collection name in MongoDB
          localField: "categoryId", // The field in the Employee collection
          foreignField: "_id", // The field in the Category collection
          as: "categoryData", // The field name for the joined category data
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
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
          from: "subcategories",
          localField: "subCategoryId",
          foreignField: "_id",
          as: "subcategoryData",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                subCategoryName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brandData",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                brandName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "measurementunits",
          localField: "measurementUnitId",
          foreignField: "_id",
          as: "measurementUnitData",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                unitName: 1,
                unitCode: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          categoryName: {
            $arrayElemAt: ["$categoryData.categoryName", 0],
          },
          subCategoryName: {
            $arrayElemAt: ["$subcategoryData.subCategoryName", 0],
          },
          unitName: {
            $arrayElemAt: ["$measurementUnitData.unitName", 0],
          },
          unitCode: {
            $arrayElemAt: ["$measurementUnitData.unitCode", 0],
          },
          brandName: {
            $arrayElemAt: ["$brandData.brandName", 0],
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
        $unset: [
          "categoryData",
          "subcategoryData",
          "measurementUnitData",
          "brandData",
          "tax",
        ],
      },
    ];
    const product = await productService.getProductDetails(aggregationQuery);
    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: product,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const updateProduct = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { taxId, subCategoryId, brandId, measurementUnitId } = req.body;
    /*
     * check sub - category exist
     */
    const subcategory = await subCategoryService.getSubCategoryById(
      subCategoryId
    );
    if (!subcategory) {
      //throw new ApiError(httpStatus.NOT_FOUND, "Sub-category not found");
    }
    req.body.categoryId = subcategory?.categoryId;

    /*
     * check brand exist
     */
    const brand = await brandService.getBrandById(brandId);
    if (!brand) {
      // throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
    }
    /*
     * check measurement unit exist
     */
    const measurementUnit = await measurementUnitService.getMeasurementUnitById(
      measurementUnitId
    );
    if (!measurementUnit) {
      //throw new ApiError(httpStatus.NOT_FOUND, "Measurement unit not found");
    }

    // Fetch all outlets by their IDs
    const tax = await taxService.getTaxById(taxId);
    if (!tax) {
      //throw new ApiError(httpStatus.NOT_FOUND, "Invalid tax.");
    }

    const product = await productService.updateProductById(
      req.params.productId,
      req.body
    );

    return res.status(httpStatus.OK).send({
      message: "Updated Successfully!",
      data: product,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const deleteProduct = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await productService.deleteProductById(req.params.productId);
    return res.status(httpStatus.OK).send({
      message: "Successfull",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const toggleProductStatus = catchAsync(async (req: Request, res: Response) => {
  const updatedProduct = await productService.toggleProductStatusById(
    req.params.productId
  );
  return res.status(httpStatus.OK).send({
    message: "Status updated successfully.",
    data: updatedProduct,
    status: true,
    code: "OK",
    issue: null,
  });
});

export {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductDetailByBarcode,
  searchInProductAndService,
  toggleProductStatus,
  searchInProductAndServiceAll,
};
