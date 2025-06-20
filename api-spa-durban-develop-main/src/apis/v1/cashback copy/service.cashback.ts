import httpStatus from "http-status";
import Cashback, { CashbackDocument } from "./schema.cashback"; // Adjust CashbackDocument based on your schema setup
import ApiError from "../../../../utilities/apiError";
import mongoose from "mongoose";
import { RangeFilter } from "../../../utils/interface";

const createCashback = async (cashbackBody: any): Promise<CashbackDocument> => {

  return Cashback.create(cashbackBody);
};

const queryCashbacks = async (
  filter: any,
  options: any
): Promise<{
  data: CashbackDocument[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  search: any;
  dateFilter: any;
  filterBy: any;
  rangeFilterBy: RangeFilter | undefined;
}> => {
  const cashbacks = await Cashback.paginate(filter, options);
  return cashbacks;
};

const updateCashbackById = async (
  cashbackId: string | number,
  updateBody: any
): Promise<CashbackDocument> => {
  const cashback = await getCashbackById(cashbackId);
  if (!cashback) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cashback not found");
  }

  Object.assign(cashback, updateBody);
  await cashback.save();
  return cashback;
};

const deleteCashbackById = async (
  cashBackId: string | number
): Promise<CashbackDocument> => {
  const cashback = await getCashbackById(cashBackId);
  if (!cashback) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cashback not found");
  }

  // Instead of deleting, update isDeleted field to true
  await Cashback.updateOne(
    { _id: cashback._id },
    { $set: { isDeleted: true } }
  );

  // Return updated cashback object
  return cashback;
};

const toggleCashbackStatusById = async (
  cashbackId: string | number
): Promise<CashbackDocument> => {
  const cashback = await getCashbackById(cashbackId);
  if (!cashback) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cashback not found");
  }
  cashback.isActive = !cashback.isActive;
  await cashback.save();
  return cashback;
};

interface FilterObject {
  [key: string]: any;
}

interface ExistsResult {
  exists: boolean;
  existsSummary: string;
}

const isExists = async (
  filterArray: FilterObject[],
  exceptIds: string[] = [],
  combined: boolean = false
): Promise<ExistsResult> => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray);
    if (exceptIds.length > 0) {
      combinedObj["_id"] = { $nin: exceptIds };
    }
    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`,
      };
    }
    return { exists: false, existsSummary: "" };
  }

  let mappedArray = await Promise.all(
    filterArray.map(async (element) => {
      if (exceptIds.length > 0) {
        element["_id"] = { $nin: exceptIds };
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] };
      }
      return { exists: false, fieldName: Object.keys(element)[0] };
    })
  );

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true;
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `;
      }
      return acc;
    },
    { exists: false, existsSummary: "" } as ExistsResult
  );
};

async function combineObjects(
  filterArray: FilterObject[]
): Promise<FilterObject> {
  return {} as FilterObject;
}

const getOneByMultiField = async (
  filter: FilterObject
): Promise<CashbackDocument | null> => {
  return Cashback.findOne({ ...filter, isDeleted: false });
};

const getCashbackById = async (
  id: string | number
): Promise<CashbackDocument | null> => {
  if (typeof id === "string" || typeof id === "number") {
    return Cashback.findById({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });
  }
  return null;
};

const getCashbackAggregate = async (
  aggregateQuery: any[]
): Promise<CashbackDocument | null> => {
  const result = await Cashback.aggregate(aggregateQuery).exec();
  return result.length > 0 ? result[0] : null;
};

const getCashbacksByIds = async (
  ids: Array<string | number>
): Promise<Array<CashbackDocument | null>> => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return Cashback.find({ _id: { $in: objectIds }, isDeleted: false }).exec();
};

export {
  createCashback,
  queryCashbacks,
  updateCashbackById,
  deleteCashbackById,
  isExists,
  getCashbackById,
  getCashbacksByIds,
  getOneByMultiField,
  toggleCashbackStatusById,
  getCashbackAggregate,
};
