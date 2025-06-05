import { IconPlus, IconTrash } from '@tabler/icons-react';
import { FieldArray, FormikProps } from 'formik';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMDatePicker from 'src/components/atoms/FormElements/ATMDatePicker/ATMDatePicker';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { PurchaseOrderFormValues } from '../models/PurchaseOrder.model';
import { ReactNode } from 'react';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetSupplierListingQuery } from 'src/modules/Supplier/service/SupplierServices';
import { useGetProductsQuery } from 'src/modules/Product/service/ProductServices';
import ATMDiscount from 'src/components/atoms/FormElements/ATMDiscountField/ATMDiscountField';
import ATMDiscountField from 'src/components/atoms/FormElements/ATMDiscountField/ATMDiscountField';
import { CURRENCY } from 'src/utils/constants';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';

type Props = {
  formikProps: FormikProps<PurchaseOrderFormValues>;
};
export const calculateDiscount = ({
  amount,
  discount,
  discountType,
}: {
  amount: number;
  discount: number;
  discountType: 'FLAT' | 'PERCENT';
}) => {
  if (discountType === 'FLAT') {
    return discount;
  } else {
    return ((amount || 0) * (discount || 0)) / 100;
  }
};
export const calculateTaxAmount = ({
  amount,
  discountAmount,
  taxPercent,
}: {
  amount: number;
  discountAmount: number;
  taxPercent: number;
}) => {
  return ((amount || 0) * (taxPercent || 0)) / 100;
};

export const calculateTotalAmount = ({
  amount,
  discountAmount,
  taxAmount,
}: {
  amount: number;
  discountAmount: number;
  taxAmount: number;
}) => {
  return (amount || 0) - (discountAmount || 0) + (taxAmount || 0);
};
const SupplierDetailField = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => {
  return (
    <div className="flex items-center text-sm font-medium text-slate-800 ">
      <span className="text-slate-700 w-[100px] ">{label}</span>
      {value}
    </div>
  );
};

const PurchaseOrderFormLayout = ({ formikProps }: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  const { data: suppliers, isLoading: isSuppliersLoading } = useFetchData(
    useGetSupplierListingQuery,
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

  const { data: products, isLoading: isProductsLoading } = useFetchData(
    useGetProductsQuery,
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

  return (
    <div className="flex flex-col h-full overflow-auto ">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
        <span className="text-lg font-semibold text-slate-700">
          Add Purchase Order
        </span>
      </div>
      <div className="flex flex-1 gap-4 p-4 overflow-auto">
        {/* Left Section */}
        <div className="flex flex-col flex-1 h-full gap-5 overflow-auto divide-y divide-gray-400 rounded divide-dashed hide-scrollbar">
          {/* Header */}
          <div className="flex gap-5 items-strech">
            {/* Supplier */}
            <div className="flex-1 space-y-4">
              <ATMSelect
                required
                name="supplier"
                value={values?.supplier}
                onChange={(newValue) => setFieldValue('supplier', newValue)}
                label="Supplier"
                placeholder="Select Supplier"
                options={suppliers}
                valueAccessKey="_id"
                onBlur={handleBlur}
                isValid={!errors?.supplier}
                getOptionLabel={(option: any) => option?.supplierName}
                isLoading={isSuppliersLoading}
              />

              <div className="space-y-1">
                <SupplierDetailField
                  label="Name"
                  value={values?.supplier?.supplierName}
                />
                <SupplierDetailField
                  label="Email"
                  value={values?.supplier?.email}
                />
                <SupplierDetailField
                  label="Phone"
                  value={values?.supplier?.phone}
                />
                <SupplierDetailField
                  label="Address"
                  value={values?.supplier?.address}
                />
              </div>
            </div>

            <div className="flex flex-col flex-1 gap-5">
              <div className="">
                <ATMDatePicker
                  required
                  name="orderDate"
                  value={values?.orderDate}
                  onChange={(newValue) => setFieldValue('orderDate', newValue)}
                  label="Order Date"
                  dateFormat="dd/MM/yyyy"
                  placeholder="Please select date"
                />
              </div>

              {/* Invoice */}
              <div className="">
                <ATMTextField
                  required
                  name="invoiceNumber"
                  value={values?.invoiceNumber}
                  onChange={(e) =>
                    setFieldValue('invoiceNumber', e.target.value)
                  }
                  label="Invoice"
                  placeholder="Enter Invoice"
                  onBlur={handleBlur}
                  isTouched={touched?.invoiceNumber}
                  errorMessage={errors?.invoiceNumber}
                  isValid={!errors?.invoiceNumber}
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="py-4">
            <div className="border-l-[3px] border-primary-40 px-2 py-1  font font-medium text-md bg-white text-primary-40">
              Product Details
            </div>
            <div className="py-2 space-y-3">
              <div className="flex gap-2 px-2 py-1 text-white rounded-t bg-primary-40">
                <div className="flex-1"> Item </div>
                <div className="min-w-[100px] max-w-[100px]"> Rate </div>
                <div className="min-w-[100px] max-w-[100px]"> Qty </div>
                <div className="min-w-[200px] max-w-[200px]"> Discount </div>
              </div>

              <FieldArray
                name="productDetails"
                render={({ push, remove }) => (
                  <div className="space-y-3">
                    {values?.productDetails?.map((product: any, index: any) => {
                      return (
                        <div
                          key={index}
                          className="border border-gray-300 rounded shadow group"
                        >
                          {values?.productDetails?.length > 1 && (
                            <div
                              className="flex justify-end p-1 cursor-pointer "
                              onClick={() => {
                                ShowConfirmation({
                                  title: 'Are you sure ?',
                                  message:
                                    'Do you really want to remove this product ?',
                                  onConfirm: (closeDialog) => {
                                    remove(index);
                                    closeDialog();
                                  },
                                });
                              }}
                            >
                              <IconTrash size={20} className="text-red-500 " />
                            </div>
                          )}

                          {/* Product */}
                          <div className="flex gap-2 px-2 py-1">
                            <div className="flex-1">
                              <ATMSelect
                                required
                                name={`productDetails[${index}].product`}
                                value={product?.product}
                                onChange={(newValue) => {
                                  setFieldValue(
                                    `productDetails[${index}].product`,
                                    newValue,
                                  );
                                  setFieldValue(
                                    `productDetails[${index}].rate`,
                                    newValue?.purchasePrice || '0',
                                  );
                                }}
                                placeholder="Select Product"
                                options={products}
                                valueAccessKey="_id"
                                onBlur={handleBlur}
                                isLoading={isProductsLoading}
                                getOptionLabel={(option) => option?.productName}
                              />
                            </div>

                            {/* Rate */}
                            <div className="min-w-[100px] max-w-[100px]">
                              <ATMNumberField
                                required
                                name={`productDetails[${index}].rate`}
                                value={product?.rate}
                                onChange={(newValue) => {
                                  setFieldValue(
                                    `productDetails[${index}].rate`,
                                    newValue,
                                  );
                                }}
                                placeholder="Enter Rate"
                                onBlur={handleBlur}
                                isAllowDecimal
                              />
                            </div>

                            {/* Quantity */}
                            <div className="min-w-[100px] max-w-[100px]">
                              <ATMNumberField
                                required
                                name={`productDetails[${index}].quantity`}
                                value={product?.quantity}
                                onChange={(newValue) =>
                                  setFieldValue(
                                    `productDetails[${index}].quantity`,
                                    newValue,
                                  )
                                }
                                placeholder="Enter Qty"
                                onBlur={handleBlur}
                                isAllowDecimal
                              />
                            </div>

                            {/* Discount */}
                            <div className="min-w-[200px] max-w-[200px]">
                              <ATMDiscountField
                                required
                                name={`productDetails[${index}].discount`}
                                value={product?.discount}
                                onChange={(newValue) =>
                                  setFieldValue(
                                    `productDetails[${index}].discount`,
                                    newValue,
                                  )
                                }
                                discountType={product?.discountType}
                                onDiscountTypeChange={(newValue) => {
                                  setFieldValue(
                                    `productDetails[${index}].discountType`,
                                    newValue,
                                  );
                                }}
                                placeholder="Discount"
                                onBlur={handleBlur}
                              />
                            </div>
                          </div>

                          {/* Summary */}
                          <div className="flex items-end justify-end px-2 py-2 mt-4 bg-gray-100 divide-x-2 rounded-b divide-slate-300">
                            <div className="flex items-center gap-2 px-2 text-sm font-medium text-slate-500">
                              <span>Tax Amt :</span>
                              {CURRENCY}{' '}
                              {calculateTaxAmount({
                                amount:
                                  (product?.rate || 0) *
                                  (product?.quantity || 0),

                                discountAmount: calculateDiscount({
                                  amount:
                                    (product?.rate || 0) *
                                      (product?.quantity || 0) +
                                    calculateTaxAmount({
                                      amount:
                                        (product?.rate || 0) *
                                        (product?.quantity || 0),
                                      discountAmount: 0,
                                      taxPercent: product?.product?.taxPercent,
                                    }),
                                  discount: product?.discount || 0,
                                  discountType: product?.discountType || 0,
                                }),

                                taxPercent: product?.product?.taxPercent || 0,
                              }).toFixed(2)}
                            </div>

                            <div className="flex items-center gap-2 px-2 text-sm font-medium text-slate-500">
                              <span>Discount :</span>
                              {CURRENCY}{' '}
                              {calculateDiscount({
                                amount:
                                  (product?.rate || 0) *
                                    (product?.quantity || 0) +
                                  calculateTaxAmount({
                                    amount:
                                      (product?.rate || 0) *
                                      (product?.quantity || 0),
                                    discountAmount: 0,
                                    taxPercent: product?.product?.taxPercent,
                                  }),
                                discount: product?.discount || 0,
                                discountType: product?.discountType,
                              }).toFixed(2)}
                            </div>

                            <div className="flex items-center gap-2 px-2 text-sm font-medium text-sky-500">
                              <span>Total Amt :</span>
                              {CURRENCY}{' '}
                              {calculateTotalAmount({
                                amount:
                                  (product?.rate || 0) *
                                  (product?.quantity || 0),
                                discountAmount: calculateDiscount({
                                  amount:
                                    (product?.rate || 0) *
                                      (product?.quantity || 0) +
                                    calculateTaxAmount({
                                      amount:
                                        (product?.rate || 0) *
                                        (product?.quantity || 0),
                                      discountAmount: 0,
                                      taxPercent: product?.product?.taxPercent,
                                    }),
                                  discount: product?.discount || 0,
                                  discountType: product?.discountType || 0,
                                }),
                                taxAmount: calculateTaxAmount({
                                  amount:
                                    (product?.rate || 0) *
                                    (product?.quantity || 0),

                                  discountAmount: calculateDiscount({
                                    amount:
                                      (product?.rate || 0) *
                                        (product?.quantity || 0) +
                                      calculateTaxAmount({
                                        amount:
                                          (product?.rate || 0) *
                                          (product?.quantity || 0),
                                        discountAmount: 0,
                                        taxPercent:
                                          product?.product?.taxPercent,
                                      }),
                                    discount: product?.discount || 0,
                                    discountType: product?.discountType || 0,
                                  }),

                                  taxPercent: product?.product?.taxPercent || 0,
                                }),
                              }).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-end my-4">
                      <p
                        className="text-link font-semibold text-base text-[16px] max-[1024px]:text-sm flex items-center cursor-pointer"
                        onClick={() =>
                          push({
                            product: '',
                            totalAmount: '',
                            quantity: '',
                            rate: '',
                            // ?.tax: '',
                            flatVat: '',
                            discount: '',
                            discountType: 'PERCENT',
                            productDescription: '',
                          })
                        }
                      >
                        <IconPlus size={18} color="#0064C4" className="mr-2" />
                        Add More
                      </p>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="p-4 space-y-4 bg-white border rounded shadow h-fit ">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between gap-4 text-sm font-medium text-slate-700">
              <span className="">Sub Total</span>
              {CURRENCY}{' '}
              {values?.productDetails
                ?.reduce((sum, product) => {
                  return (
                    sum +
                    Number(product?.quantity || 0) * Number(product?.rate || 0)
                  );
                }, 0)
                .toFixed(2)}
            </div>

            <div className="flex justify-between gap-4 text-sm font-medium text-slate-700">
              <span className="">Total Tax</span>
              {CURRENCY}{' '}
              {values?.productDetails
                ?.reduce((sum, product) => {
                  return (
                    sum +
                    calculateTaxAmount({
                      amount:
                        Number(product?.rate || 0) *
                        Number(product?.quantity || 0),

                      discountAmount: calculateDiscount({
                        amount:
                          Number(product?.rate || 0) *
                            Number(product?.quantity || 0) +
                          calculateTaxAmount({
                            amount:
                              Number(product?.rate || 0) *
                              Number(product?.quantity || 0),
                            discountAmount: 0,
                            taxPercent: product?.product?.taxPercent,
                          }),
                        discount: Number(product?.discount || 0),
                        discountType: product?.discountType || 0,
                      }),

                      taxPercent: product?.product?.taxPercent || 0,
                    })
                  );
                }, 0)
                .toFixed(2)}
            </div>

            <div className="flex justify-between gap-4 text-sm font-medium text-slate-700">
              <span className="">Total Discount</span>
              {CURRENCY}{' '}
              {values?.productDetails
                ?.reduce((sum, product) => {
                  return (
                    sum +
                    calculateDiscount({
                      amount:
                        Number(product?.rate || 0) *
                          Number(product?.quantity || 0) +
                        calculateTaxAmount({
                          amount:
                            Number(product?.rate || 0) *
                            Number(product?.quantity || 0),
                          discountAmount: 0,
                          taxPercent: product?.product?.taxPercent,
                        }),
                      discount: Number(product?.discount || 0),
                      discountType: product?.discountType || 0,
                    })
                  );
                }, 0)
                .toFixed(2)}
            </div>

            <div className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
              <span className="">Shipping Charges</span>
              <ATMNumberField
                name="shippingCharges"
                value={values?.shippingCharges}
                onChange={(newValue) =>
                  setFieldValue('shippingCharges', newValue)
                }
                placeholder="Charges"
                onBlur={handleBlur}
                isTouched={touched?.shippingCharges}
                errorMessage={errors?.shippingCharges}
                isValid={!errors?.shippingCharges}
                className="w-[10ch]"
                isAllowDecimal
              />
            </div>

            <div className="flex justify-between gap-4 font-medium text-md text-slate-700">
              <span className="">Grand Total</span>
              {CURRENCY}{' '}
              {(
                values?.productDetails?.reduce((sum, product) => {
                  return (
                    sum +
                    calculateTotalAmount({
                      amount:
                        Number(product?.rate || 0) *
                        Number(product?.quantity || 0),
                      discountAmount: calculateDiscount({
                        amount:
                          Number(product?.rate || 0) *
                            Number(product?.quantity || 0) +
                          calculateTaxAmount({
                            amount:
                              Number(product?.rate || 0) *
                              Number(product?.quantity || 0),
                            discountAmount: 0,
                            taxPercent: product?.product?.taxPercent,
                          }),
                        discount: Number(product?.discount || 0),
                        discountType: product?.discountType || 0,
                      }),
                      taxAmount: calculateTaxAmount({
                        amount:
                          Number(product?.rate || 0) *
                          Number(product?.quantity || 0),

                        discountAmount: calculateDiscount({
                          amount:
                            Number(product?.rate || 0) *
                              Number(product?.quantity || 0) +
                            calculateTaxAmount({
                              amount:
                                Number(product?.rate || 0) *
                                Number(product?.quantity || 0),
                              discountAmount: 0,
                              taxPercent: product?.product?.taxPercent,
                            }),
                          discount: Number(product?.discount || 0),
                          discountType: product?.discountType || 0,
                        }),

                        taxPercent: product?.product?.taxPercent || 0,
                      }),
                    })
                  );
                }, 0) + Number(values?.shippingCharges || 0)
              ).toFixed(2)}
            </div>

            <div className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
              <span className="">Amount Paid</span>
              <ATMNumberField
                name="amountPaid"
                value={values?.amountPaid}
                onChange={(newValue) => setFieldValue('amountPaid', newValue)}
                placeholder="Amount Paid"
                onBlur={handleBlur}
                isTouched={touched?.amountPaid}
                errorMessage={errors?.amountPaid}
                isValid={!errors?.amountPaid}
                className="w-[10ch]"
                isAllowDecimal
              />
            </div>
            {Number(values?.amountPaid) >
              values?.productDetails?.reduce((sum, product) => {
                return (
                  sum +
                  calculateTotalAmount({
                    amount:
                      Number(product?.rate || 0) *
                      Number(product?.quantity || 0),
                    discountAmount: calculateDiscount({
                      amount:
                        Number(product?.rate || 0) *
                          Number(product?.quantity || 0) +
                        calculateTaxAmount({
                          amount:
                            Number(product?.rate || 0) *
                            Number(product?.quantity || 0),
                          discountAmount: 0,
                          taxPercent: product?.product?.taxPercent,
                        }),
                      discount: Number(product?.discount || 0),
                      discountType: product?.discountType || 0,
                    }),
                    taxAmount: calculateTaxAmount({
                      amount:
                        Number(product?.rate || 0) *
                        Number(product?.quantity || 0),

                      discountAmount: calculateDiscount({
                        amount:
                          Number(product?.rate || 0) *
                            Number(product?.quantity || 0) +
                          calculateTaxAmount({
                            amount:
                              Number(product?.rate || 0) *
                              Number(product?.quantity || 0),
                            discountAmount: 0,
                            taxPercent: product?.product?.taxPercent,
                          }),
                        discount: Number(product?.discount || 0),
                        discountType: product?.discountType || 0,
                      }),

                      taxPercent: product?.product?.taxPercent || 0,
                    }),
                  })
                );
              }, 0) +
                Number(values?.shippingCharges || 0) && (
              <p className="text-xs font-medium text-red-500">
                {' '}
                Paid amount can not greater than Payable amount{' '}
              </p>
            )}

            <div className="flex justify-between gap-4 font-medium text-red-600 text-md">
              <span className="">Balance Amount</span>

              {(
                values?.productDetails?.reduce((sum, product) => {
                  return (
                    sum +
                    calculateTotalAmount({
                      amount:
                        Number(product?.rate || 0) *
                        Number(product?.quantity || 0),
                      discountAmount: calculateDiscount({
                        amount:
                          Number(product?.rate || 0) *
                            Number(product?.quantity || 0) +
                          calculateTaxAmount({
                            amount:
                              Number(product?.rate || 0) *
                              Number(product?.quantity || 0),
                            discountAmount: 0,
                            taxPercent: product?.product?.taxPercent,
                          }),
                        discount: Number(product?.discount || 0),
                        discountType: product?.discountType || 0,
                      }),
                      taxAmount: calculateTaxAmount({
                        amount:
                          Number(product?.rate || 0) *
                          Number(product?.quantity || 0),

                        discountAmount: calculateDiscount({
                          amount:
                            Number(product?.rate || 0) *
                              Number(product?.quantity || 0) +
                            calculateTaxAmount({
                              amount:
                                Number(product?.rate || 0) *
                                Number(product?.quantity || 0),
                              discountAmount: 0,
                              taxPercent: product?.product?.taxPercent,
                            }),
                          discount: Number(product?.discount || 0),
                          discountType: product?.discountType || 0,
                        }),

                        taxPercent: product?.product?.taxPercent || 0,
                      }),
                    })
                  );
                }, 0) +
                Number(values?.shippingCharges || 0) -
                Number(values?.amountPaid)
              ).toFixed(2)}
            </div>
          </div>
          <div className="">
            <ATMButton
              type="submit"
              isLoading={isSubmitting}
              disabled={
                Number(values?.amountPaid) >
                values?.productDetails?.reduce((sum, product) => {
                  return (
                    sum +
                    calculateTotalAmount({
                      amount:
                        Number(product?.rate || 0) *
                        Number(product?.quantity || 0),
                      discountAmount: calculateDiscount({
                        amount:
                          Number(product?.rate || 0) *
                            Number(product?.quantity || 0) +
                          calculateTaxAmount({
                            amount:
                              Number(product?.rate || 0) *
                              Number(product?.quantity || 0),
                            discountAmount: 0,
                            taxPercent: product?.product?.taxPercent,
                          }),
                        discount: Number(product?.discount || 0),
                        discountType: product?.discountType || 0,
                      }),
                      taxAmount: calculateTaxAmount({
                        amount:
                          Number(product?.rate || 0) *
                          Number(product?.quantity || 0),

                        discountAmount: calculateDiscount({
                          amount:
                            Number(product?.rate || 0) *
                              Number(product?.quantity || 0) +
                            calculateTaxAmount({
                              amount:
                                Number(product?.rate || 0) *
                                Number(product?.quantity || 0),
                              discountAmount: 0,
                              taxPercent: product?.product?.taxPercent,
                            }),
                          discount: Number(product?.discount || 0),
                          discountType: product?.discountType || 0,
                        }),

                        taxPercent: product?.product?.taxPercent || 0,
                      }),
                    })
                  );
                }, 0) +
                  Number(values?.shippingCharges || 0)
              }
            >
              Generate Order
            </ATMButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderFormLayout;
