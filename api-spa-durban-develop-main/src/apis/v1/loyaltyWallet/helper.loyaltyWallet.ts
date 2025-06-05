import ApiError from "../../../../utilities/apiError";
import httpStatus from "http-status";
import { ObjectId } from "mongoose";
import { loyaltyService, loyaltyWalletService } from "../service.index";
import {
  updateLoyaltyPoints,
  updateCashBackamount,
} from "../customer/helper.customer";
import { TransactionTypeEnum } from "../../..//utils/enumUtils";

const getTodayDayName = (): string => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: "long" };
  return today.toLocaleDateString("en-IN", options);
};

const fetchTodayLoyaltyPoints = (
  todayDay: string,
  currentOutlet: any
): {
  todaysPoints: number;
  todaysAmount: number;
} => {
  switch (todayDay) {
    case "Sunday":
      return {
        todaysPoints: currentOutlet.sundayEarnPoint || 0,
        todaysAmount: currentOutlet.sundaySpendAmount || 0,
      };
    case "Monday":
      return {
        todaysPoints: currentOutlet.mondayEarnPoint || 0,
        todaysAmount: currentOutlet.mondaySpendAmount || 0,
      };
    case "Tuesday":
      return {
        todaysPoints: currentOutlet.tuesdayEarnPoint || 0,
        todaysAmount: currentOutlet.tuesdaySpendAmount || 0,
      };

    case "Wednesday":
      return {
        todaysPoints: currentOutlet.wednesdayEarnPoint || 0,
        todaysAmount: currentOutlet.wednesdaySpendAmount || 0,
      };

    case "Thursday":
      return {
        todaysPoints: currentOutlet.thursdayEarnPoint || 0,
        todaysAmount: currentOutlet.thursdaySpendAmount || 0,
      };

    case "Friday":
      return {
        todaysPoints: currentOutlet.fridayEarnPoint || 0,
        todaysAmount: currentOutlet.fridaySpendAmount || 0,
      };

    case "Saturday":
      return {
        todaysPoints: currentOutlet.saturdayEarnPoint || 0,
        todaysAmount: currentOutlet.saturdaySpendAmount || 0,
      };

    default:
      return {
        todaysPoints: 0,
        todaysAmount: 0,
      };
  }
};

const calculateLoyaltyPoints = (
  spentAmount: number,
  spendThreshold: number,
  earnPoints: number
): number => {
  const validAmount = Math.floor(spentAmount / spendThreshold) * spendThreshold;
  return (validAmount / spendThreshold) * earnPoints;
};

export const getTodaysLoyaltyPoint = async (
  outletId: ObjectId,
  spentAmount: number
) => {
  const outletLoyalty = await loyaltyService.getOneByMultiField({
    "businessLocation.outletId": outletId,
  });

  if (!outletLoyalty) {
    return {
      todaysPoints: 0,
      todaysAmount: 0,
      pointsCreditedOrUsed: 0,
      amountCreditedOrUsed: 0,
    };
  }
  let { businessLocation } = outletLoyalty;
  const currentOutlet = businessLocation.find(
    (ele: any) => ele?.outletId.toString() === outletId.toString()
  );

  if (currentOutlet) {
    const todayDay = getTodayDayName();

    const fetchedPoints = fetchTodayLoyaltyPoints(todayDay, currentOutlet);

    let { todaysPoints, todaysAmount } = fetchedPoints;

    if (!todaysPoints) {
      return {
        todaysPoints,
        todaysAmount,
        pointsCreditedOrUsed: 0,
        amountCreditedOrUsed: 0,
      };
    }
    let spendThreshold = 0;
    switch (todayDay) {
      case "Sunday":
        spendThreshold = currentOutlet.sundaySpendAmount || 0;
        break;
      case "Monday":
        spendThreshold = currentOutlet.mondaySpendAmount || 0;
        break;
      case "Tuesday":
        spendThreshold = currentOutlet.tuesdaySpendAmount || 0;
        break;
      case "Wednesday":
        spendThreshold = currentOutlet.wednesdaySpendAmount || 0;
        break;
      case "Thursday":
        spendThreshold = currentOutlet.thursdaySpendAmount || 0;
        break;
      case "Friday":
        spendThreshold = currentOutlet.fridaySpendAmount || 0;
        break;
      case "Saturday":
        spendThreshold = currentOutlet.saturdaySpendAmount || 0;
        break;
    }

    const pointsCreditedOrUsed = calculateLoyaltyPoints(
      spentAmount,
      spendThreshold,
      todaysPoints
    );

    return {
      todaysPoints,
      todaysAmount,
      pointsCreditedOrUsed,
      amountCreditedOrUsed: 0,
    };
  }

  return {
    todaysPoints: 0,
    todaysAmount: 0,
    pointsCreditedOrUsed: 0,
    amountCreditedOrUsed: 0,
  };
};

export const getLoyaltyWalletCreditData = async (
  customerId: ObjectId,
  employeeId: ObjectId,
  outletId: ObjectId,
  spentAmount: number,
  isWalkinCustomer: boolean
) => {
  if (isWalkinCustomer) {
    return { walletCreditLog: null, pointsToAdd: 0 };
  }
  let {
    todaysPoints,
    todaysAmount,
    pointsCreditedOrUsed,
    amountCreditedOrUsed,
  } = await getTodaysLoyaltyPoint(outletId, spentAmount);

  if (!pointsCreditedOrUsed) {
    return { walletCreditLog: null, pointsToAdd: 0 };
  }
  return {
    walletCreditLog: {
      customerId,
      employeeId,
      outletId,
      spentAmount,
      todaysPoints,
      todaysAmount,
      pointsCreditedOrUsed,
      amountCreditedOrUsed,
      transactionType: TransactionTypeEnum.credit,
    },
    pointsToAdd: pointsCreditedOrUsed,
  };
};

export const getLoyaltyWalletDebitData = async (
  customerId: ObjectId,
  employeeId: ObjectId,
  outletId: ObjectId,
  spentAmount: number,
  pointsUsed: number
) => {
  if (!pointsUsed) {
    return { walletDebitLog: null, pointsToDebit: 0 };
  }

  return {
    walletDebitLog: {
      customerId,
      employeeId,
      outletId,
      spentAmount,
      todaysPoints: 0,
      todaysAmount: 0,
      pointsCreditedOrUsed: pointsUsed,
      amountCreditedOrUsed: pointsUsed,
      transactionType: TransactionTypeEnum.debit,
    },
    pointsToDebit: pointsUsed,
  };
};

export const updateWalletAndUpdateLog = async (
  logsData: any,
  points: number
) => {
  const { transactionType, customerId } = logsData;

  let loyaltyWallet = await loyaltyWalletService.createLoyaltyWallet({
    ...logsData,
  });
  if (!loyaltyWallet) {
    throw new ApiError(
      httpStatus.NOT_IMPLEMENTED,
      "Something went wrong loyalty wallet not updated!"
    );
  }
  const updateCustomer = await updateLoyaltyPoints(
    customerId,
    points,
    transactionType
  );
  if (!updateCustomer) {
    throw new ApiError(
      httpStatus.NOT_IMPLEMENTED,
      "Something went wrong loyalty wallet not updated!"
    );
  }
  return true;
};

export const updateCashBack = async (
  customerId: string,
  totalCashBack: number,
  type: string
) => {
  const updateCustomer = await updateCashBackamount(
    customerId,
    totalCashBack,
    type
  );
  if (!updateCustomer) {
    throw new ApiError(
      httpStatus.NOT_IMPLEMENTED,
      "Something went wrong loyalty wallet not updated!"
    );
  }
  return true;
};
