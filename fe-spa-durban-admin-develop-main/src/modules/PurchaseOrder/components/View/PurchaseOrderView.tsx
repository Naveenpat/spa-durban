import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import MOLLoader from 'src/components/molecules/MOLLoader/MOLLoader';
import { useFetchData } from 'src/hooks/useFetchData';
import { CURRENCY } from 'src/utils/constants';
import { useGetPurchaseOrderbyIdQuery } from '../../service/PurchaseOrderServices';
import {
  calculateDiscount,
  calculateTaxAmount,
} from '../PurchaseOrderFormLayout';

const PurchaseOrderView = () => {
  const { id } = useParams();
  const { data, isLoading } = useFetchData(useGetPurchaseOrderbyIdQuery, {
    body: id,
    dataType: 'VIEW',
  });

  // const grandTotal =
  //   (data as any)?.data?.payableAmount -
  //   (data as any)?.data?.totalTax +
  //   (data as any)?.data?.totalDiscount +
  //   (data as any)?.data?.shippingCharges;

  const grandTotal =
    parseFloat(
      (
        (data as any)?.data?.payableAmount -
        (data as any)?.data?.totalTax +
        (data as any)?.data?.totalDiscount +
        (data as any)?.data?.shippingCharges
      ).toFixed(2)
    );
  const balanceDue =
    (data as any)?.data?.payableAmount - (data as any)?.data?.amountPaid

  return (
    <>
      {isLoading ? (
        <div className="h-ful">
          {' '}
          <MOLLoader />
        </div>
      ) : (
        <div className="flex gap-5 p-4 text-xs font-semibold">
          <div className="w-[70%] border p-2 rounded-lg flex flex-col gap-8">
            <div className="flex justify-between">
              <div className="flex flex-col gap-4 ">
                <div>Name : {(data as any)?.data?.supplierName}</div>
                <div>Email : {(data as any)?.data?.supplieremail}</div>
                <div>Phone : {(data as any)?.data?.supplierphone}</div>
                <div>Address : {(data as any)?.data?.supplieraddress}</div>
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  Date :
                  {(data as any)?.data?.createdAt
                    ? format(
                      new Date((data as any)?.data?.createdAt),
                      'dd MMM yyyy',
                    )
                    : null}
                </div>
                <div>Invoice Number : {(data as any)?.data?.invoiceNumber}</div>
              </div>
            </div>
            <div className="capitalize ">
              <div>Product Details :-</div>
              <div className="grid grid-cols-6 p-2 mt-2 border border-black rounded-lg">
                <div>Name</div>
                <div>Rate</div>
                <div>Qty.</div>
                <div>Discount</div>
                <div>Tax</div>
                <div>Total Amount</div>
              </div>
              {(data as any)?.data?.products?.map((product: any) => {
                return (
                  <div className="grid grid-cols-6 p-2 font-normal">
                    <div>{product?.productName}</div>
                    <div>
                      {CURRENCY} {product?.rate}
                    </div>
                    <div>{product?.quantity}</div>
                    <div>
                      {CURRENCY}{' '}
                      {calculateDiscount({
                        amount:
                          Number(product?.rate || 0) *
                          Number(product?.quantity || 0) +
                          calculateTaxAmount({
                            amount:
                              (product?.rate || 0) * (product?.quantity || 0),
                            discountAmount: 0,
                            taxPercent: product?.taxPercent || 0,
                          }),
                        discountType: product?.discountType,
                        discount: product?.discount,
                      })}
                    </div>
                    <div>{CURRENCY}{' '}{`${calculateTaxAmount({
                      amount:
                        (product?.rate || 0) * (product?.quantity || 0),
                      discountAmount: 0,
                      taxPercent: product?.taxPercent || 0,
                    })} (${product?.taxType})`}</div>
                    <div>
                      {CURRENCY} {product?.amount}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-[30%] flex flex-col gap-5 border rounded-lg p-2">
            <div className="flex justify-between">
              <div>Sub Total</div>
              <div>
                {CURRENCY}{' '}
                {(data as any)?.data?.products?.reduce(
                  (sum: number, product: any) => {
                    return (
                      sum +
                      Number(product?.quantity || 0) *
                      Number(product?.rate || 0)
                    );
                  },
                  0,
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Total Tax</div>
              <div>
                {CURRENCY} {(data as any)?.data?.totalTax}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Total Discount</div>
              <div>
                {CURRENCY} {(data as any)?.data?.totalDiscount}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Shipping Charges</div>
              <div>
                {CURRENCY} {(data as any)?.data?.shippingCharges}
              </div>
            </div>
            <div className="flex justify-between">
              <div>GrandTotal</div>
              <div>
                {CURRENCY} {grandTotal}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Amount Paid</div>
              <div>
                {CURRENCY} {(data as any)?.data?.amountPaid}
              </div>
            </div>
            <div className="flex justify-between text-red-500">
              <div>Balance amount</div>
              {/* <div>
                {CURRENCY} {grandTotal - (data as any)?.data?.amountPaid}
              </div> */}
              <div>
                {CURRENCY} {balanceDue < 0 ? 0 : balanceDue}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseOrderView;
