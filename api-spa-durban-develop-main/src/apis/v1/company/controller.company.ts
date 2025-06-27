// company.controller.ts
import httpStatus from "http-status";
import catchAsync from "../../../../utilities/catchAsync";
import ApiError from "../../../../utilities/apiError";
import { Request, Response } from "express";
import {
  createCompany,
  getCompanyById,
  updateCompanyById,
  deleteCompanyById,
  toggleCompanyStatusById,
} from "./service.company";
import { AuthenticatedRequest, DateFilter, RangeFilter } from "../../../utils/interface";
import { pick } from "../../../../utilities/pick"
import {
  getFilterQuery,
  getRangeQuery,
  getSearchQuery,
  checkInvalidParams,
  getDateFilterQuery,
} from "../../../utils/utils"
import { companyService } from "../service.index";
import { allowedDateFilterKeys, searchKeys } from "./schema.company";
const createCompanys = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.userData
  if (!companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company ID is required");
  }
  req.body.companyId = companyId;
  const company = await createCompany(req.body);
  res.status(httpStatus.CREATED).send({
    message: "Company created successfully",
    data: company,
    status: true,
  });
});


const getComponies = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = pick(req.query, [])
    const options = pick(req.query, [
      "sortBy",
      "limit",
      "page",
      "searchValue",
      "searchIn",
      "dateFilter",
      "rangeFilterBy",
    ])
    // Extract searchValue from req.query
    const searchValue = req.query.searchValue as string | undefined
    const searchIn = req.query.searchIn as string[] | null
    const dateFilter = req.query.dateFilter as DateFilter | null
    const filterBy = req.query.filterBy as any[]
    const rangeFilterBy = req.query.rangeFilterBy as RangeFilter | undefined
    const isPaginationRequiredParam = req.query.isPaginationRequired

    if (isPaginationRequiredParam !== undefined) {
      const isPaginationRequired = isPaginationRequiredParam === "true"

      options.isPaginationRequired = isPaginationRequired as any
    }
    // Add searchValue to options if it exists
    if (searchValue) {
      let searchQueryCheck = checkInvalidParams(
        searchIn ? searchIn : [],
        searchKeys
      )

      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send({
          ...searchQueryCheck,
        })
      }
      // Extract search query from options
      const searchQuery = getSearchQuery(
        searchIn ? searchIn : [],
        searchKeys,
        searchValue
      )
      if (searchQuery !== null) {
        options["search"] = { $or: searchQuery } as any
      }
    }

    //date filter
    //date filter
    if (dateFilter) {
      const datefilterQuery = await getDateFilterQuery(
        dateFilter,
        allowedDateFilterKeys
      )

      if (datefilterQuery && datefilterQuery.length) {
        options["dateFilter"] = { $and: datefilterQuery } as any
      }
    }

    //range filter
    if (rangeFilterBy !== undefined) {
      const rangeQuery = getRangeQuery(rangeFilterBy)

      if (rangeQuery && rangeQuery.length) {
        options["rangeFilterBy"] = { $and: rangeQuery } as any
      }
    }

    //check filter by
    if (filterBy?.length) {
      const booleanFields: string[] = ["isActive"]
      const numberFileds: string[] = []
      const objectIdFileds: string[] = []

      const withoutRegexFields: string[] = []

      const filterQuery = getFilterQuery(
        filterBy,
        booleanFields,
        numberFileds,
        objectIdFileds,
        withoutRegexFields
      )
      if (filterQuery) {
        options["filterBy"] = { $and: filterQuery } as any
      }
    }
    const result = await companyService.queryRoles(filter, options)
    return res.status(httpStatus.OK).send(result)
  }
)

const getByIdCompanys = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const company = await getCompanyById(req.params.id);
  if (!company || company.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }
  res.status(httpStatus.OK).send({
    message: "Company fetched successfully",
    data: company,
    status: true,
  });
});

const updateByIdCompanys = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const company = await updateCompanyById(req.params.id, req.body);
  res.status(httpStatus.OK).send({
    message: "Company updated successfully",
    data: company,
    status: true,
  });
});

const removeCompanys = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const company = await deleteCompanyById(req.params.id);
  res.status(httpStatus.OK).send({
    message: "Company deleted successfully",
    data: company,
    status: true,
  });
});

const toggleStatusCompanys = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const company = await toggleCompanyStatusById(req.params.id);
  res.status(httpStatus.OK).send({
    message: `Company ${company.isActive ? "activated" : "deactivated"} successfully`,
    data: company,
    status: true,
  });
});

export {
  createCompanys,
  getComponies,
  getByIdCompanys,
  updateByIdCompanys,
  removeCompanys,
  toggleStatusCompanys,
};