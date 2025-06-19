import { IconPrinter } from '@tabler/icons-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetOutletsByCompanyIdQuery, useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import { calculatedAmounts } from 'src/modules/POS/components/CartSummarySection';
import { showToast } from 'src/utils/showToaster';
import {
  useGetInvoiceQuery,
  useSendPdfViaEmailMutation,
} from '../../service/InvoicesServices';
import { useRef } from 'react';
import { useGetCompanyByIdQuery } from 'src/modules/AdminRole copy/service/CompanyServices';

const Receipt = () => {
  const { id: invoiceId } = useParams();
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [uploadPdf, { isLoading: pdfLoading }] = useSendPdfViaEmailMutation();
  const { data, isLoading } = useFetchData(useGetInvoiceQuery, {
    body: invoiceId,
    dataType: 'VIEW',
  });


  const { data: companyData } = useGetCompanyByIdQuery((data as any)?.data?.companyId)
  const { data: outletData } = useGetOutletsByCompanyIdQuery((data as any)?.data?.companyId);
  //  console.log('----get all outlet by com id',outletData)
  const { data: outletsData } = useFetchData(useGetOutletsQuery, {
    body: {
      isPaginationRequired: false,
      filterBy: JSON.stringify([
        {
          fieldName: 'isActive',
          value: true,
        },
      ]),
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-lvh">
        <ATMCircularProgress />
      </div>
    );
  }

  const invoiceData = (data as any)?.data;

  if (!invoiceData) {
    return <div>No data available</div>;
  }

  const itemData = invoiceData?.items || [];
  const phoneNumber = invoiceData?.customerPhone;
  const email = invoiceData?.customerEmail;
  const name = invoiceData?.customerName;
  const youEarn = invoiceData?.loyaltyPointsEarned;
  const youHave = invoiceData?.customerLoyaltyPoints;
  const youEarnCashback = invoiceData?.cashBackEarned;
  const youHaveCashback = invoiceData?.customerCashBackAmount;

  const totalQty = itemData?.reduce(
    (acc: number, item: any) => acc + item?.quantity,
    0,
  );
  const totalPrice = itemData?.reduce(
    (acc: number, item: any) => acc + item.sellingPrice * item.quantity,
    0,
  );
  const totalTaxAmount = itemData?.reduce(
    (acc: number, item: any) => acc + item.taxAmount * item.quantity,
    0,
  );

  const subTotal = totalPrice + totalTaxAmount;
  const shippingCharges = invoiceData?.shippingCharges || 0;
  const loyaltyPointsUsed = invoiceData?.loyaltyPointsDiscount || 0;
  const cashBackDiscount = invoiceData?.useCashBackAmount
    ? invoiceData?.cashBackDiscount
    : 0 || 0;
  const couponDiscount = invoiceData?.couponDiscount || 0;
  const giftCardDiscount = invoiceData?.giftCardDiscount || 0;
  const promotionCoupanCodeDiscount = invoiceData?.promotionCoupanCodeDiscount || 0;
  const referralDiscount = invoiceData?.referralDiscount || 0;
  const grandTotal = invoiceData?.totalAmount || 0;
  const youPay = invoiceData?.amountPaid || 0;
  const balanceDue = invoiceData?.balanceDue || 0;
  const handleSendEmail = async () => {
    const receiptElement = document.querySelector('.receipt-print');

    if (receiptElement) {
      try {
        const canvas = await html2canvas(receiptElement as HTMLElement, {
          scale: 2,
        });
        const imgData = canvas.toDataURL('image/png', 0.6);
        let pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;
        const padding = 10;
        const imgWidth = pageWidth - 2 * padding;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', padding, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 2 * padding;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight - 10 - padding;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', padding, position, imgWidth, imgHeight);
          heightLeft -= pageHeight - 10 - padding;
        }

        let pdfBlob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
        const formData = new FormData();
        formData.append('file', pdfBlob, 'receipt.pdf');
        formData.append('emailBody', 'any');
        uploadPdf({ body: formData, invoiceId: invoiceId }).then((res: any) => {
          if (res?.error) {
            showToast('error', res?.error?.data?.message);
          } else {
            if (res?.data?.status) {
              showToast('success', res?.data?.message);
            } else {
              showToast('error', res?.data?.message);
            }
          }
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('error', 'Failed to generate or send PDF.');
      }
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const originalContent = document.body.innerHTML;
      const printContent = printRef.current.innerHTML;
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // To reapply any event listeners that might be lost after reassigning innerHTML
    }
  };

  const toTitleCase = (str: any) =>
    str
      ?.toLowerCase()
      .split(' ')
      .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');


  return (
    <>
      <div ref={printRef} className="py-2 mx-auto receipt-print w-[50%]">
        <div className="flex justify-center px-2 mb-2">
          <img className="h-20 w-30" src={companyData?.logo || "/spadurbanLogo.jpeg"} alt="Logo" />
        </div>
        <div className="px-2 text-[11px] font-medium text-center text-slate-600 ">
          {toTitleCase(invoiceData?.outletName)}
        </div>
        <div className="px-2 text-[11px] font-medium text-center text-slate-600 ">
          Served by : {invoiceData?.employeeName}
        </div>
        <div className="px-2 text-xs font-medium text-center text-slate-600 ">
          ∗ ∗ Reprint ∗ ∗
        </div>
        <div className="mt-2 mb-1 border-t border-dashed"></div>
        <div className=" text-[11px] font-medium text-slate-600   text-center ">
          <div>
            <span>Receipt / Tax Invoice </span>
            <span className="">{invoiceData?.invoiceNumber}</span>
          </div>
          <div className="">
            {format(new Date(invoiceData?.createdAt), 'dd MMM yyyy hh:mm a')}
          </div>
        </div>
        <div className="mt-2 border-t border-dashed"></div>

        <div className="text-[11px] font-base text-slate-600">
          <div className="grid grid-cols-5 gap-2 px-2 text-xs font-medium text-slate-900">
            <div className="col-span-3">Item</div>
            <div className="text-end">Qty</div>
            <div className="text-end">Price</div>
          </div>
          <div className="mt-2 border-t"></div>
          {itemData?.map((item: any, index: number) => (
            <div key={index} className="grid grid-cols-5 gap-2 px-2 py-1">
              <div className="col-span-3 max-w-[150px] break-words">
                {item.itemName}
              </div>
              <div className="text-end">{item.quantity}</div>
              <div className="text-end">
                {(item.sellingPrice * item.quantity)?.toFixed(2)}
              </div>
            </div>
          ))}
          <div className="mt-2 mb-1 border-t"></div>
          <div className="grid grid-cols-5 gap-2 px-2 text-xs font-medium text-slate-900">
            <div className="flex items-center col-span-3 gap-4">
              <div>Total</div>
              <div>( {itemData?.length} item )</div>
            </div>
            <div className="text-end">{totalQty}</div>
            <div className="text-end">{totalPrice?.toFixed(2)}</div>
          </div>
          <div className="mt-2 border-t"></div>
          <div className="text-[11px] font-base text-slate-600 leading-4">
            {calculatedAmounts(itemData)?.taxes?.map((tax: any, index) =>
              tax?.taxType && tax?.taxPercent && tax?.taxAmount ? (
                <div key={index} className="flex justify-between px-2 ">
                  <div>
                    {tax?.taxType} @ {tax?.taxPercent}%
                  </div>

                  <div>{tax?.taxAmount.toFixed(2)}</div>
                </div>
              ) : null,
            )}
            {/* <div className="flex justify-between px-2 ">
              <div>Shipping Charges</div>
              <div>{shippingCharges?.toFixed(2)}</div>
            </div> */}
            <div className="flex justify-between px-2 text-xs font-bold">
              <div>Sub Total</div>
              <div>{Number(shippingCharges + subTotal)?.toFixed(2)}</div>
            </div>
            {couponDiscount ? (
              <div className="flex justify-between px-2">
                <div>Coupon Discount</div>
                <div>- {couponDiscount.toFixed(2)}</div>
              </div>
            ) : null}
            {giftCardDiscount ? (
              <div className="flex justify-between px-2">
                <div>GiftCard Discount</div>
                <div>- {giftCardDiscount.toFixed(2)}</div>
              </div>
            ) : null}
            {promotionCoupanCodeDiscount ? (
              <div className="flex justify-between px-2">
                <div>Promotion Discount</div>
                <div>- {promotionCoupanCodeDiscount.toFixed(2)}</div>
              </div>
            ) : null}
            {referralDiscount ? (
              <div className="flex justify-between px-2">
                <div>Referral Discount</div>
                <div>- {referralDiscount.toFixed(2)}</div>
              </div>
            ) : null}
            {loyaltyPointsUsed ? (
              <div className="flex justify-between px-2">
                <div>Loyalty Points Used</div>
                <div>- {loyaltyPointsUsed.toFixed(2)}</div>
              </div>
            ) : null}
            {cashBackDiscount ? (
              <div className="flex justify-between px-2">
                <div>Cash Back Discount</div>
                <div>- {cashBackDiscount.toFixed(2)}</div>
              </div>
            ) : null}

            <div className="mt-2 mb-1 border-t"></div>
            <div className="flex justify-between px-2 text-sm font-bold">
              <div>Grand Total</div>
              <div>{grandTotal?.toFixed(2)}</div>
            </div>
            <div className="mt-2 mb-1 border-t"></div>
            <div>
              {invoiceData?.amountReceived?.map((payment: any) => {
                return (
                  <div className="flex justify-between px-2">
                    <div>{payment?.modeName}</div>
                    <div>{payment?.amount?.toFixed(2)}</div>
                  </div>
                );
              })}
              <div className="flex justify-between px-2 text-sm font-bold text-slate-700">
                <div>You Paid</div>
                <div>{youPay?.toFixed(2)}</div>
              </div>
              <div className="mt-2 mb-1 border-t"></div>
            </div>
            {balanceDue ? (
              <div className="flex justify-between px-2 pb-2 text-sm font-bold text-red-500 border-b">
                <div>Balance Due</div>
                <div>{balanceDue?.toFixed(2)}</div>
              </div>
            ) : null}
            <div>
              {' '}
              <div className="p-1 text-sm font-medium text-center uppercase">
                {name}
              </div>
              <div className="mt-2 mb-1 border-t border-dashed"></div>
              <div className="px-2 ">
                <div className="flex justify-between">
                  <div>You Earn Loyalty Pts</div>
                  <div>{youEarn && youEarn.toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div>Total Loyalty Pts</div>
                  <div>{youHave && youHave.toFixed(2)}</div>
                </div>
              </div>
              <div className="px-2 ">
                <div className="flex justify-between">
                  <div>You Earn Cashback Amount </div>
                  <div>{youEarnCashback && youEarnCashback.toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div>Total Cashback Amount</div>
                  <div>{youHaveCashback && youHaveCashback.toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-2 mb-1 border-t border-dashed"></div>
              <div className="px-2 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-20 ">
                  <div className="w-10">Email</div>
                  <div>{email}</div>
                </div>
                <div className="flex items-center gap-20 ">
                  <div className="w-10">Phone</div>
                  <div>{phoneNumber}</div>
                </div>
              </div>
              <div className="mt-2 mb-1 border-t"></div>
              <div className="px-2 font-semibold text-center text-slate-800">
                Thank you for Choosing {companyData?.data?.companyName}
                <br />
                Kindly Refer Your Friends and Family to us . <br />
                Come again soon !
                {outletData?.data?.map((outlet: any) => {
                  return (
                    <div className="mt-1 font-normal tracking-wider text-center text-slate-500">
                      <div>{toTitleCase(outlet?.name)}</div>
                      {/* <div>{outlet?.invoiceNumber}</div> */}
                    </div>
                  );
                })}
                {/* <div>
    {outletsData?.map((o:any) => toTitleCase(o?.name)).join(', ')}
  </div>
</div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sticky z-auto flex justify-end gap-2 px-4 my-1 bottom-1 print:hidden">
        <ATMButton
          extraClasses="w-fit"
          onClick={() =>
            navigate(
              location.state?.from ? location.state.from.pathname : '/pos',
            )
          }
          variant="text"
        >
          Back
        </ATMButton>
        <ATMButton
          extraClasses="w-[120px]"
          onClick={handleSendEmail}
          variant="contained"
          isLoading={pdfLoading}
        >
          Send Email
        </ATMButton>
        <ATMButton
          extraClasses="w-fit"
          onClick={handlePrint}
          variant="contained"
        >
          <span className="flex items-center gap-1">
            {' '}
            <IconPrinter /> Print
          </span>
        </ATMButton>
      </div>
    </>
  );
};

export default Receipt;
