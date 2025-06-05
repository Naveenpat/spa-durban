import { taxService } from "../service.index";
import { DiscountTypeEnum } from "../../../utils/enumUtils";

export const purchaseCalculation = async (
  products: any,
  shippingCharges: number
) => {
  let orignalPayableAmount = 0;
  let myPayableAmount = shippingCharges;
  let amount = 0;
  let totalTax = 0;
  let totalDiscount = 0;
  const newProducts = await Promise.all(
    products?.map(async (element: any) => {
      let taxFound = await taxService?.getTaxById(element?.tax);

      if (taxFound) {
        let totalAmt = element?.quantity * element?.rate;

        let taxAmount = (totalAmt * taxFound?.taxPercent) / 100;
        let discountAmount =
          element?.discountType === DiscountTypeEnum.percent
            ? ((totalAmt + taxAmount) * element?.discount) / 100
            : element?.discount;
        let totalPurchaseAmount = totalAmt + taxAmount - discountAmount;
        orignalPayableAmount += totalAmt;
        amount = totalPurchaseAmount;
        myPayableAmount += amount;
        totalTax += taxAmount;
        totalDiscount += discountAmount;
      }

      return {
        ...element,
        amount,
      };
    })
  );

  return {
    products: newProducts,
    totalTax,
    totalDiscount,
    myPayableAmount,
    orignalPayableAmount,
  };
};
