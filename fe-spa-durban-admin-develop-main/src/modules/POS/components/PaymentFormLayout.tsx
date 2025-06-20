import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { FieldArray, FormikProps } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMCheckbox from 'src/components/atoms/FormElements/ATMCheckbox/ATMCheckbox';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetPaymntModesQuery } from 'src/modules/PaymentMode/service/PaymentModeServices';
import { useGetAllTypeCouponsQuery } from 'src/modules/PromotionCoupons/service/PromotionCouponsServices';
import { CURRENCY } from 'src/utils/constants';

type Props = {
  formikProps: FormikProps<any>;
  onClose: () => void;
  payAbleAmount: number;
  handleApplyPayment: any;
  onDraft: any;
  previewData: any;
  isPreviewed: boolean;
  onModify: () => void;
  previewIsLoading: boolean;
  isDraftSubmitting: boolean;
  loyaltyPoints: number;
  cashBackAmount: number;
};

type Coupon = {
  type: 'GiftCard' | 'Promotional' | 'Birthday' | 'Reward'
  code: string
  discount?: number
  discountPercent?: number
  validTill: string
}


const PaymentFormLayout = ({
  formikProps,
  onClose,
  onDraft,
  payAbleAmount,
  handleApplyPayment,
  previewData,
  isPreviewed,
  onModify,
  previewIsLoading,
  loyaltyPoints,
  isDraftSubmitting,
  cashBackAmount,
}: Props) => {
  const { values, setFieldValue, isSubmitting } = formikProps;
  const customerId = values?.customer?._id;
  const serviceIds = values?.items.map((item: any) => item._id);
  const { data: allCoupans, isLoading, refetch } = useGetAllTypeCouponsQuery({ customerId, items: serviceIds });

  const { data: paymentData, isLoading: paymentLoading } = useFetchData(
    useGetPaymntModesQuery,
    {
      body: {
        isPaginationRequired: false,
        filterBy: JSON.stringify([
          {
            fieldName: 'isActive',
            value: true,
          },
        ]),
      },
    },
  );

  const calculateGivenChange = () => {
    const total = previewData?.invoiceData?.totalAmount || 0;
    const received = calculateTotalReceived();
    const change = received - total;
    return change > 0 ? change : 0;
  };


  const calculateTotalReceived = useCallback(() => {
    return values.amountReceived.reduce(
      (total: number, payment: any) => total + (Number(payment.amount) || 0),
      0,
    );
  }, [values.amountReceived]);

  const isLastPaymentModeFilled = () => {
    if (values?.amountReceived?.length === 0) {
      return true;
    }
    const lastPaymentMode =
      values?.amountReceived?.[values.amountReceived.length - 1];
    return (
      lastPaymentMode && lastPaymentMode.paymentModeId && lastPaymentMode.amount
    );
  };

  // Get the paymentModeId for Cash
  const showPaymentData = () => {
    const totalAmount = previewData?.invoiceData?.totalAmount || 0;

    // Get all non-cash payments and sum them
    const nonCashTotal = values.amountReceived.reduce(
      (acc: number, curr: any) => {
        const modeType = paymentData?.find(
          (mode: any) => mode._id === curr.paymentModeId?._id,
        )?.type;

        const amount = parseFloat(curr.amount) || 0;

        if (modeType !== 'cash') {
          return acc + amount;
        }

        return acc;
      },
      0,
    );

    return nonCashTotal > totalAmount;
  };

  const [selectedCode, setSelectedCode] = useState<string>('')

  useEffect(() => {
    refetch()
  }, [])

  return (
    <>
      <MOLFormDialog
        title="Payment"
        onClose={onClose}
        isSubmitting={isSubmitting}
        isSubmitButtonDisabled={false}
        isDraftSubmitting={isDraftSubmitting}
        draftbtn
        onDraft={() => onDraft(values)}
      >
        <div className="flex gap-4">
          <div className="border rounded-lg  w-[300px] h-[400px] flex flex-col justify-between overflow-x-auto">
            <div className="flex flex-col gap-2">
              {/* payAbleAmount */}
              <div className="flex items-center justify-between p-2 text-sm font-medium tracking-wide border-b">
                <span> Summary</span>
                <span>
                  {' '}
                  {/* Modify */}
                  {isPreviewed && (
                    <div className="flex justify-end text-xs font-medium text-blue-500 ">
                      <div
                        className="flex gap-1 cursor-pointer"
                        onClick={() => {
                          onModify();
                          setFieldValue('amountReceived', [
                            { paymentModeId: '', amount: '' },
                          ]);
                        }}
                      >
                        <IconEdit size={18} /> Modify
                      </div>
                    </div>
                  )}
                </span>
              </div>

              {/* Shipping Charges */}
              <div className="flex flex-col gap-1 px-2">
                <div className="flex items-center justify-between p-1 text-xs font-regular">
                  <div className=" text-neutral-40"> Sub Total</div>{' '}
                  <div className="font-medium">
                    {CURRENCY} {payAbleAmount.toFixed(2)}
                  </div>
                </div>
                {/* <div className="">
                  {isPreviewed ? (
                    <div className="flex items-center justify-between p-1 text-xs font-regular">
                      <div className=" text-neutral-40"> Shipping Charges</div>{' '}
                      <div className="font-medium">
                        {CURRENCY} {values?.shippingCharges}
                      </div>
                    </div>
                  ) : (
                    <ATMNumberField
                      name="shippingCharges"
                      value={values?.shippingCharges}
                      onChange={(newValue) =>
                        setFieldValue('shippingCharges', newValue)
                      }
                      placeholder="Enter Shipping Charges"
                      label="Shipping Charges"
                    />
                  )}
                </div> */}

                {/* Coupon Discount */}
                <div className="">
                  {isPreviewed ? (
                    previewData?.invoiceData?.couponDiscount ? (
                      <div className="flex justify-between p-1 text-xs font-regular">
                        <div className="flex flex-col gap-1 text-neutral-40">
                          Coupon Applied{' '}
                          <div className="px-2 py-[2px] font-semibold text-green-800 bg-green-100 rounded-md w-fit text-[10px]">
                            {values?.couponCode}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-medium text-green-600">
                            - {CURRENCY}{' '}
                            {previewData?.invoiceData?.couponDiscount.toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      </div>
                    ) : null
                  ) : (
                    <ATMTextField
                      name="couponCode"
                      value={values?.couponCode}
                      onChange={(e) => {
                        setFieldValue('couponCode', e.target.value),
                          setFieldValue('useCashBackAmount', false),
                          setFieldValue(
                            'usedCashBackAmount',
                            0,
                          );
                      }}
                      placeholder="Enter Coupon Code"
                      label="Coupon Code"
                    />
                  )}
                </div>

                {/* GiftCard Discount */}
                <div className="">
                  {isPreviewed ? (
                    previewData?.invoiceData?.giftCardDiscount ? (
                      <div className="flex justify-between p-1 text-xs font-regular">
                        <div className="flex flex-col gap-1 text-neutral-40">
                          GiftCard Amount{' '}
                          <div className="px-2 py-[2px] text-green-800 bg-green-100 rounded-md w-fit text-[10px]">
                            {values?.giftCardCode}
                          </div>
                        </div>
                        <span className="font-medium text-green-600">
                          - {CURRENCY}{' '}
                          {previewData?.invoiceData?.giftCardDiscount.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    ) : null
                  ) : (
                    <ATMTextField
                      name="giftCardCode"
                      value={values?.giftCardCode}
                      onChange={(e) =>
                        setFieldValue('giftCardCode', e.target.value)
                      }
                      placeholder="Enter Gift Card Code"
                      label="Gift Card Code"
                    />
                  )}
                </div>
                <div className="">
                  {isPreviewed ? (
                    previewData?.invoiceData?.promotionCoupanCodeDiscount ? (
                      <div className="flex justify-between p-1 text-xs font-regular">
                        <div className="flex flex-col gap-1 text-neutral-40">
                          Promotion Coupon Code Amount{' '}
                          <div className="px-2 py-[2px] text-green-800 bg-green-100 rounded-md w-fit text-[10px]">
                            {values?.promotionCoupanCode}
                          </div>
                        </div>
                        <span className="font-medium text-green-600">
                          - {CURRENCY}{' '}
                          {previewData?.invoiceData?.promotionCoupanCodeDiscount.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    ) : null
                  ) : (
                    <ATMTextField
                      name="promotionCoupanCode"
                      value={values?.promotionCoupanCode}
                      onChange={(e) =>
                        setFieldValue('promotionCoupanCode', e.target.value)
                      }
                      placeholder="Enter Promotion Coupon Code"
                      label="Promotion Coupon Code"
                    />
                  )}
                </div>
                {/* Loyalty Point */}
                <div className="">
                  {isPreviewed ? (
                    previewData?.invoiceData?.loyaltyPointsDiscount ? (
                      <div className="flex items-center justify-between p-1 text-xs font-regular">
                        <div className=" text-neutral-40"> Loyalty Points</div>{' '}
                        <span className="font-medium text-green-600">
                          - {CURRENCY}{' '}
                          {previewData?.invoiceData?.loyaltyPointsDiscount.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    ) : null
                  ) : (
                    <div className="flex items-center justify-between">
                      {/* <ATMCheckbox
                        checked={values?.useLoyaltyPoints}
                        onChange={() =>
                          setFieldValue(
                            'useLoyaltyPoints',
                            !values?.useLoyaltyPoints,
                          )
                        }
                        size="small"
                        label="Use Loyalty Points"
                        disabled={isPreviewed}
                      />
                      <div className="text-[12px] font-medium text-blue-800">
                        {loyaltyPoints ? loyaltyPoints.toFixed(2) : null}
                      </div> */}
                    </div>
                  )}
                </div>
                {!isPreviewed && (<div className="mt-1">
                  <div className="flex flex-row-reverse overflow-x-auto max-w-full space-x-2 space-x-reverse pb-2">
                    {allCoupans?.data?.map((coupon: any, index: any) => (
                      <label
                        key={index}
                        className={`min-w-[240px] border p-3 rounded-md shadow-sm text-xs cursor-pointer transition duration-200 ease-in-out ${selectedCode === coupon.code
                          ? 'border-[#006972] bg-[#e6f5f4]'
                          : 'border-gray-200 bg-white'
                          } hover:shadow-md`}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="radio"
                            name="coupon"
                            value={coupon.code}
                            checked={selectedCode === coupon.code}
                            // onChange={() => {
                            //   if (coupon.type === 'Promotional') {
                            //     setFieldValue('promotionCoupanCode', coupon.code);
                            //     setFieldValue('couponCode', '');
                            //     setFieldValue('giftCardCode', '');
                            //   } else if (coupon.type === 'GiftCard') {
                            //     setFieldValue('giftCardCode', coupon.code);
                            //     setFieldValue('couponCode', '');
                            //     setFieldValue('promotionCoupanCode', '');
                            //   } else {
                            //     setFieldValue('couponCode', coupon.code);
                            //     setFieldValue('giftCardCode', '');
                            //     setFieldValue('promotionCoupanCode', '');
                            //   }
                            //   setSelectedCode(coupon.code);
                            // }}
                            onChange={() => {
                              if (coupon.type === 'Promotional') {
                                setFieldValue('promotionCoupanCode', coupon.code);
                                setFieldValue('couponCode', '');
                                setFieldValue('giftCardCode', '');
                                setFieldValue('rewardCoupan', '');
                                setFieldValue('useCashBackAmount', false);
                              } else if (coupon.type === 'GiftCard') {
                                setFieldValue('giftCardCode', coupon.code);
                                setFieldValue('couponCode', '');
                                setFieldValue('promotionCoupanCode', '');
                                setFieldValue('rewardCoupan', '');
                                setFieldValue('useCashBackAmount', false);
                              } else if (coupon.type === 'Reward') {
                                setFieldValue('rewardCoupan', coupon.code);
                                setFieldValue('couponCode', '');
                                setFieldValue('promotionCoupanCode', '');
                                setFieldValue('giftCardCode', '');
                                setFieldValue(
                                  'usedCashBackAmount',
                                  coupon?.discount,
                                );
                                setFieldValue('useCashBackAmount', true);
                              } else {
                                // Assuming all other types fall under regular coupon
                                setFieldValue('couponCode', coupon.code);
                                setFieldValue('giftCardCode', '');
                                setFieldValue('promotionCoupanCode', '');
                                setFieldValue('rewardCoupan', '');
                                setFieldValue('useCashBackAmount', false);
                              }

                              setSelectedCode(coupon.code);

                            }}

                            className="accent-[#006972] mt-1"
                          />

                          <div className="flex flex-col gap-1">
                            <div className="font-medium text-sm">
                              {coupon.type === 'GiftCard' && '🎁 Gift Card'}
                              {coupon.type === 'Promotional' && '💥 Promo Coupon'}
                              {coupon.type === 'Birthday' && '🎂 Birthday Coupon'}
                              {coupon.type === 'Reward' && '🏅 Reward Coupon'}
                            </div>

                            <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                              <span className="text-gray-600">Discount</span>
                              {coupon.type === 'Reward' ? (
                                <span className="ml-2 text-[10px] font-semibold text-white bg-[#006972] px-2 py-[2px] rounded-full">
                                  🎯 {coupon.discount} Points
                                </span>
                              ) : (
                                <span className="ml-2 text-[10px] font-semibold text-white bg-[#006972] px-2 py-[2px] rounded-full">
                                  {coupon.discountPercent
                                    ? `${coupon.discountPercent}% Off`
                                    : `R${coupon.discount} Off`}
                                </span>
                              )}
                            </div>



                            <div className="text-[11px] text-gray-500">
                              Valid Till: {new Date(coupon.validTill).toDateString()}
                            </div>

                            <div className="text-[10px] text-white bg-[#006972] px-2 py-[2px] rounded w-fit">
                              Code: {coupon.code}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>)}



                <div className="">
                  {isPreviewed ? (
                    previewData?.invoiceData?.usedCashBackAmount ? (
                      <div className="flex items-center justify-between p-1 text-xs font-regular">
                        <div className=" text-neutral-40">
                          Cash Back Discount
                        </div>
                        <span className="font-medium text-green-600">
                          - {CURRENCY}{' '}
                          {previewData?.invoiceData?.usedCashBackAmount.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    ) : null
                  ) : (
                    <div className="flex items-center justify-between">
                      <ATMCheckbox
                        checked={values?.useCashBackAmount}
                        onChange={() => {
                          const newUseCashBackAmount =
                            !values?.useCashBackAmount; // Toggle value
                          setFieldValue(
                            'useCashBackAmount',
                            newUseCashBackAmount,
                          );

                          setFieldValue(
                            'usedCashBackAmount',
                            newUseCashBackAmount
                              ? cashBackAmount.toFixed(2)
                              : 0,
                          );
                        }}
                        size="small"
                        label="Use Cash Back"
                        disabled={isPreviewed}
                      />
                      <div className="text-[12px] font-medium text-blue-800">
                        {!values?.useCashBackAmount && cashBackAmount
                          ? cashBackAmount.toFixed(2)
                          : null}
                        {values?.useCashBackAmount && (
                          <ATMNumberField
                            name="usedCashBackAmount"
                            value={values?.usedCashBackAmount}
                            onChange={(newValue) =>
                              setFieldValue('usedCashBackAmount', newValue)
                            }
                            placeholder="Enter Amount"
                            className={'!w-[80px]'}
                            isAllowDecimal={true}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>


            <div>
              {/* Loyalty Points Earned */}
              {isPreviewed && previewData?.pointsToAdd ? (
                <div className="px-4 py-1 text-xs font-medium text-green-900">
                  Loyalty Points Earned :{' '}
                  {(previewData?.pointsToAdd).toFixed(2)}
                </div>
              ) : null}
              {isPreviewed && previewData?.totalCashBack ? (
                <div className="px-4 py-1 text-xs font-medium text-green-900">
                  Cash Back Earned : {(previewData?.totalCashBack).toFixed(2)}
                </div>
              ) : null}

              {/* Payable Amount APPLY BUTTON */}
              <div>
                {isPreviewed && previewData?.invoiceData?.totalAmount ? (
                  <div className="flex gap-2 px-4 py-2 text-sm bg-yellow-100 rounded-b-lg">
                    <div className="flex-1 font-medium ">Payable Amount</div>
                    <div className="min-w-[60px]  font-medium text-slate-800 text-right">
                      {CURRENCY}{' '}
                      {previewData?.invoiceData?.totalAmount.toFixed(2) || 0}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end px-2 mb-2">
                    <ATMButton
                      onClick={() => {
                        handleApplyPayment(values, setFieldValue);
                      }}
                      isLoading={previewIsLoading}
                    >
                      Apply
                    </ATMButton>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isPreviewed ? (
            <div className=" w-[500px]"></div>
          ) : (
            <div className="flex flex-col justify-between p-2 border rounded-lg w-[500px]">
              <div className="flex flex-col gap-2 ">
                {/* Amount Received */}
                <div className="pb-2 text-sm font-medium tracking-wide border-b border-dashed text-slate-500">
                  Amount Received
                </div>
                <div className="grid items-end grid-cols-2 gap-2 text-xs font-medium tracking-wide text-slate-500 ">
                  <div className="col-span-1 ">Payment Mode</div>
                  <div className="">Amount</div>
                </div>
                {/* FieldArray For PaymentMode */}
                <FieldArray name="amountReceived">
                  {({ insert, remove, push }) => (
                    <div className="flex flex-col gap-5 ">
                      {values.amountReceived.length > 0 &&
                        values.amountReceived.map(
                          (payment: any, index: number) => (
                            <div
                              key={index}
                              className="grid items-end grid-cols-2 gap-2"
                            >
                              <div className="col-span-1">
                                <ATMSelect
                                  name={`amountReceived.${index}.paymentModeId`}
                                  value={
                                    values.amountReceived[index].paymentModeId
                                  }
                                  onChange={(newValue) => {
                                    // console.log(newValue, 'new value');

                                    setFieldValue(
                                      `amountReceived.${index}.paymentModeId`,
                                      newValue,
                                    );
                                  }}
                                  label=""
                                  options={paymentData}
                                  valueAccessKey="_id"
                                  placeholder="Payment mode"
                                  getOptionLabel={(option: any) =>
                                    option?.modeName
                                  }
                                  isOptionDisabled={(option) => {
                                    return (
                                      values?.amountReceived?.findIndex(
                                        (modes: any) =>
                                          modes?.paymentModeId?._id ===
                                          option._id,
                                      ) > -1
                                    );
                                  }}
                                  isLoading={paymentLoading}
                                />
                                {/* <h2>
                                  <strong>Amount to Pay</strong>
                                </h2> */}
                              </div>
                              <div className="flex items-center gap-2">
                                <ATMNumberField
                                  name={`amountReceived.${index}.amount`}
                                  value={values.amountReceived[index].amount}
                                  onChange={(newValue) => {
                                    setFieldValue(
                                      `amountReceived.${index}.amount`,
                                      newValue,
                                    );
                                  }}
                                  label=""
                                  placeholder="Enter Payment"
                                  isAllowDecimal
                                />
                                <div className="">
                                  <ATMButton
                                    type="button"
                                    onClick={() => remove(index)}
                                    variant="text"
                                    extraClasses=" text-red-500"
                                  >
                                    <IconTrash />
                                  </ATMButton>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      <div>
                        {showPaymentData() ? (
                          <div className="text-xs font-semibold text-red-500">
                            Total received amount cannot be greater than payable
                            amount.
                          </div>
                        ) : null}
                      </div>

                      <div
                        className={`flex items-center justify-center gap-1 py-2 border border-dashed rounded cursor-pointer bg-gray-50  ${!isLastPaymentModeFilled()
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                          }`}
                        onClick={() => {
                          if (isLastPaymentModeFilled()) {
                            push({ paymentModeId: '', amount: '' });
                          }
                        }}
                      >
                        <IconPlus className="size-[0.75rem]" />
                        <span className="text-xs font-semibold">
                          Add Payment Mode
                        </span>
                      </div>
                    </div>
                  )}
                </FieldArray>
              </div>
              {/* <div className="flex flex-wrap col-span-4 gap-4 py-4 h-fit">
                {paymentData?.map((product) => {
                  // console.log('product', product);
                  console.log('product', values?.amountReceived);

                  return (
                    <div
                      key={product?._id}
                      onClick={() => {
                        setFieldValue(
                          `amountReceived.${0}.paymentModeId`,
                          product,
                        );
                      }}
                      className=" rounded-md cursor-pointer min-w-[140px] max-w-[140px] shadow"
                    >
                      <div
                        className={`flex flex-col gap-2 px-2 py-1 pb-2 rounded-md ${values?.amountReceived && values?.amountReceived[0].paymentModeId?._id === product._id ? 'bg-[#b7b7b7]' : 'bg-[#3a1bff]'}  rounded-b-md h-[60px]`}
                      >
                        <div
                          title={product?.modeName}
                          className="flex items-center justify-center text-[12px] text-white line-clamp-2 font-medium capitalize h-full text-center"
                        >
                          {product?.modeName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div> */}
              {/*due balance */}
              <div className="flex items-center justify-end gap-2 pt-2 text-sm font-medium tracking-wide text-red-500 ">
                <div>
                  {(previewData?.invoiceData?.totalAmount -
                    calculateTotalReceived() || 0) < 0
                    ? 'Give Change : '
                    : 'Balance Due :'}
                </div>
                <div>
                  {CURRENCY}{' '}
                  {Math.abs(
                    previewData?.invoiceData?.totalAmount -
                    calculateTotalReceived() || 0,
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      </MOLFormDialog>
    </>
  );
};

export default PaymentFormLayout;
