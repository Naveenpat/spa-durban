import { Request, Response } from "express";
import httpStatus from "http-status";
import { pick } from "../../../../utilities/pick";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import { customerService } from "../service.index";
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
import Customer, { searchKeys, allowedDateFilterKeys } from "./schema.customer";

const createCustomer = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const customer = await customerService.createCustomer(req.body);
    return res.status(httpStatus.OK).status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: customer,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const createCustomerByBooking = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { bookingCustomerId } = req.body;
  console.log('-------bookingCustomerId',bookingCustomerId)
    const existingCustomer = await customerService.findCustomerByBookingId(
      bookingCustomerId
    );
    console.log(bookingCustomerId, "existingCustomer=====", existingCustomer);

    if (existingCustomer) {
      return res.status(httpStatus.CONFLICT).send({
        message: "Customer with this bookingCustomerId already exists!",
        data: existingCustomer,
        status: false,
        code: "DUPLICATE_ENTRY",
        issue: null,
      });
    }

    const customer = await customerService.createCustomer(req.body);

    return res.status(httpStatus.CREATED).send({
      message: "Added successfully!",
      data: customer,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const getCustomers = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = pick(req.query, []); // unused but kept for structure

    // Flexible object for internal use
    const options: Record<string, any> = pick(req.query, [
      "limit",
      "page",
      "searchValue",
      "searchIn",
      "dateFilter",
      "rangeFilterBy",
      "isPaginationRequired",
      "sortBy",
    ]);

    const searchValue = req.query.searchValue as string | undefined;
    const searchIn = req.query.searchIn as string[] | undefined;
    const dateFilter = req.query.dateFilter as DateFilter | undefined;
    const filterBy = req.query.filterBy as any[] | undefined;
    const rangeFilterBy = req.query.rangeFilterBy as RangeFilter | undefined;
    const isPaginationRequiredParam = req.query.isPaginationRequired;

    if (isPaginationRequiredParam !== undefined) {
      options.isPaginationRequired = isPaginationRequiredParam === "true";
    }
    if (searchValue) {
      let finalSearchIn: string[] = [];

      // Use provided searchIn or fallback to default
      if (searchIn?.length) {
        finalSearchIn = searchIn;
      } else {
        finalSearchIn = searchKeys;
      }

      const searchQueryCheck = checkInvalidParams(finalSearchIn, searchKeys);
      if (searchQueryCheck && !searchQueryCheck.status) {
        return res.status(httpStatus.OK).send(searchQueryCheck);
      }

      const searchQuery = getSearchQuery(finalSearchIn, searchKeys, searchValue);
      if (searchQuery?.length) {
        options.search = { $or: searchQuery };
      }
    }


    // 📅 Date filter
    if (dateFilter) {
      const datefilterQuery = await getDateFilterQuery(dateFilter, allowedDateFilterKeys);
      if (Array.isArray(datefilterQuery) && datefilterQuery.length) {
        options.dateFilter = { $and: datefilterQuery };
      }
    }

    // 🔢 Range filter
    if (rangeFilterBy) {
      const rangeQuery = getRangeQuery(rangeFilterBy);
      if (Array.isArray(rangeQuery) && rangeQuery.length) {
        options.rangeFilterBy = { $and: rangeQuery };
      }
    }

    // ✅ Generic filters
    if (Array.isArray(filterBy) && filterBy.length) {
      const booleanFields = ["isActive"];
      const numberFields: string[] = [];
      const objectIdFields: string[] = [];
      const withoutRegexFields: string[] = [];

      const filterQuery = getFilterQuery(
        filterBy,
        booleanFields,
        numberFields,
        objectIdFields,
        withoutRegexFields
      );

      if (Array.isArray(filterQuery) && filterQuery.length) {
        options.filterBy = { $and: filterQuery };
      }
    }

    const result = await customerService.queryCustomers(filter, options);
    return res.status(httpStatus.OK).send(result);
  }
);

const getCustomerDropdown = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let customerGroup = req.query.customerGroup;


    const customers = await Customer.find({
      isDeleted: false,
      customerGroup: { $in: customerGroup },
    }).select("_id customerName");

    const dropdownData = customers.map((cust: any) => ({
      value: cust._id,
      label: cust.customerName,
    }));

    return res.status(httpStatus.OK).send({ data: dropdownData });
  }
);


const getCustomer = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const customer = await customerService.getCustomerById(
      req.params.customerId
    );
    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: customer,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const updateCustomer = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const customer = await customerService.updateCustomerById(
      req.params.customerId,
      req.body
    );
    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
      data: customer,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const deleteCustomer = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await customerService.deleteCustomerById(req.params.customerId);
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    });
  }
);

const toggleCustomerStatus = catchAsync(async (req: Request, res: Response) => {
  const updatedCustomer = await customerService.toggleCustomerStatusById(
    req.params.customerId
  );
  return res.status(httpStatus.OK).send({
    message: "Status updated successfully.",
    data: updatedCustomer,
    status: true,
    code: "OK",
    issue: null,
  });
});

const importCustomerCsvSheet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    await customerService.importCSV(file); // CSV handler instead of Excel
    res.status(200).json({ success: true, message: 'Customers imported successfully' });
  } catch (error) {
    console.error('CSV Import Error:', error);
    res.status(500).json({ success: false, message: 'Import failed', error });
  }
};



const exportCustomerCsvSheet = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const buffer = await customerService.exportCSV();

    res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(buffer);
  }
);



export {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
  createCustomerByBooking,
  importCustomerCsvSheet,
  exportCustomerCsvSheet,
  getCustomerDropdown
};
