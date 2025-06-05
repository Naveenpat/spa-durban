import { ObjectId } from "mongoose";
import { customerService } from "../service.index";
import { TransactionTypeEnum } from "../../../utils/enumUtils";
const updateLoyaltyPoints = async (
  customerId: string,
  pointsCreditedOrUsed: number,
  transactionType: string
) => {
  if (transactionType === TransactionTypeEnum.credit) {
    return await customerService.updateCustomerById(customerId, {
      $inc: { loyaltyPoints: pointsCreditedOrUsed },
    });
  }
  if (transactionType === TransactionTypeEnum.debit) {
    return await customerService.updateCustomerById(customerId, {
      $inc: { loyaltyPoints: -pointsCreditedOrUsed },
    });
  }
  return null;
};
const updateCashBackamount = async (
  customerId: string,
  cashBackAmount: number,
  transactionType: string
) => {
  if (transactionType === "add") {
    return await customerService.updateCustomerById(customerId, {
      $inc: { cashBackAmount: cashBackAmount },
    });
  }
  if (transactionType === "remove") {
    return await customerService.updateCustomerById(customerId, {
      $inc: { cashBackAmount: -cashBackAmount },
    });
  }
  return null;
};

export { updateLoyaltyPoints, updateCashBackamount };
