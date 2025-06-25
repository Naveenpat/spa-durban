import { IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';
import { FormikProps } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetCustomersQuery } from 'src/modules/Customer/service/CustomerServices';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import { AppDispatch, RootState } from 'src/store';
import { CURRENCY } from 'src/utils/constants';
import { showToast } from 'src/utils/showToaster';
import { useGetDraftByIdMutation } from '../service/POSServices';
import {
  setIsOpenAddDialog,
  setIsOpenCustomerDialog,
  setIsOpenDraftListDialog,
  setPreviewNewCustomerId,
} from '../slice/CartSlice';
import DraftList from './DraftList';
import PaymentFormWrapper from './PaymentFormWrapper';
import AddNotes from './AddNotes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import { BASE_URL } from '../../../utils/constants/index';
type AmountSummaryCardProps = {
  items: any[];
  customer: any;
};
interface Customer {
  _id: string;
  bookingCustomerId: string;
  customerName: string;
  email: string;
  phone: string;
  isActive: boolean;
  isDeleted: boolean;
}

// Define the structure of each option
interface SelectOption {
  label: string;
  value: string;
  data: Customer;
}
export const calculatedAmounts = (items: any) => {
  let taxes: {
    taxType: string;
    taxAmount: number;
    taxPercent: number;
  }[] = [];
  let totalAmount = 0;

  items?.forEach((item: any) => {
    const matchedIndex = taxes?.findIndex(
      (el: any) => el?.taxType === item?.taxType,
    );
    if (matchedIndex > -1) {
      taxes[matchedIndex].taxAmount +=
        (item?.quantity * item?.sellingPrice * item?.taxPercent || 0) / 100;
    } else {
      taxes?.push({
        taxType: item?.taxType,
        taxPercent: item?.taxPercent,
        taxAmount:
          (item?.quantity * item?.sellingPrice * item?.taxPercent || 0) / 100,
      });
    }

    totalAmount +=
      Number(item?.sellingPrice) *
      Number(item?.quantity) *
      ((100 + (Number(item?.taxPercent) || 0)) / 100);
  });

  return {
    taxes,
    totalAmount: totalAmount?.toFixed(2),
  };
};

const AmountSummaryCard = ({ items, customer }: AmountSummaryCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div className="flex flex-col gap-2 space-y-1">
      <div>
        <div className="">
          {calculatedAmounts(items)?.taxes?.map((tax: any, index) => (
            <div key={index} className="flex gap-2 p-4 py-1">
              <div className="flex-1 text-xs truncate text-slate-500">
                {tax?.taxType && tax?.taxPercent ? (
                  <div>
                    {' '}
                    {tax?.taxType} @ {tax?.taxPercent}%
                  </div>
                ) : null}
              </div>
              {tax?.taxAmount ? (
                <div className="min-w-[60px] text-sm  text-slate-600 text-right">
                  {CURRENCY} {tax?.taxAmount.toFixed(2)}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex gap-2 px-4 py-1 bg-yellow-100">
          <div className="flex-1 text-base font-medium ">Sub Total</div>
          <div className="min-w-[60px] text-base font-medium text-slate-800 text-right">
            {CURRENCY} {calculatedAmounts(items)?.totalAmount}
          </div>
        </div>
      </div>
      <div className="px-4 ">
        <ATMButton
          onClick={() => dispatch(setIsOpenAddDialog(true))}
          children="Pay Now"
          disabled={!customer}
        />
      </div>
    </div>
  );
};

type Props = {
  cartItems: any[];
  onRemove: (itemId: string) => void;
  onQuantityChange: (itemId: string, type: 'INCREMENT' | 'DECREMENT') => void;
  formikProps: FormikProps<any>;
};
const useDebounce = (callback: Function, delay: number) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: any[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
};
const CartSummarySection = ({
  cartItems,
  onRemove,
  onQuantityChange,
  formikProps,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookingCustomer = searchParams.get('customer');
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<SelectOption | null>(
    null,
  );
  const { values, setFieldValue } = formikProps;
  const [isOpenAddNotesDialog, setIsOpenAddNotesDialog] = useState(false);
  const { userData, outlet, accessToken } = useSelector(
    (state: RootState) => state.auth,
  );
  // console.log('token', accessToken);

  const { isOpenDraftListDialog, isOpenCustomerDialog } = useSelector(
    (state: RootState) => state.cart,
  );
  const navigate = useNavigate();
  const { data: outletData, isLoading: outletDataLoading }: any = useFetchData(
    useGetOutletsQuery,
    {
      body: { isPaginationRequired: false },
    },
  );
  const filterBy: any = [{ fieldName: 'isActive', value: true }];

  if (bookingCustomer) {
    filterBy.push({
      fieldName: 'bookingCustomerId',
      value: bookingCustomer,
    });
  }

  const { data: customerData, isLoading: customerLoading } = useFetchData(
    useGetCustomersQuery,
    {
      body: {
        isPaginationRequired: false,
        filterBy: JSON.stringify(filterBy),
      },
    },
  );

  // const { data: customerData, isLoading: customerLoading } = useFetchData(
  //   useGetCustomersQuery,
  //   {
  //     body: {
  //       isPaginationRequired: false,
  //       filterBy: JSON.stringify([
  //         {
  //           fieldName: 'isActive',
  //           value: true,
  //         },
  //         {
  //           fieldName: 'bookingCustomerId',
  //           value: bookingCustomer,
  //         },
  //       ]),
  //     },
  //   },
  // );

  const [getDraftData] = useGetDraftByIdMutation();

  const { isOpenAddDialog, previewNewCustomerId } = useSelector(
    (state: RootState) => state?.cart,
  );
  const dispatch = useDispatch<AppDispatch>();
  const handleGetDraftData = (draftId: string) => {
    getDraftData(draftId).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          setFieldValue('customer', { _id: res?.data?.data?.customerId });
          setFieldValue(
            'items',
            res?.data?.data?.items?.map((item: any) => {
              return {
                _id: item?.itemId,
                // itemCode: item?.itemId,
                itemName: item?.itemName,
                // itemUrl: item?.itemId,
                mrp: item?.mrp,
                // purchasePrice: item?.itemId,
                sellingPrice: item?.sellingPrice,
                quantity: item?.quantity,
                type: item?.itemType,
                taxId: item?.taxId,
                taxPercent: item?.taxPercent,
                taxType: item?.taxType,
              };
            }),
          );
          setFieldValue('couponCode', res?.data?.data?.couponCode);
          setFieldValue('shippingCharges', res?.data?.data?.shippingCharges);
          setFieldValue(
            'amountReceived',
            res?.data?.data?.amountReceived?.map((el: any) => ({
              paymentModeId: { _id: el?.paymentModeId },
              amount: el?.amount?.toFixed(2),
            })),
          );
          setFieldValue('giftCardCode', res?.data?.data?.giftCardCode);
          setFieldValue('useLoyaltyPoints', res?.data?.data?.useLoyaltyPoints);
          setFieldValue('referralCode', res?.data?.data?.referralCode);
          showToast('success', res?.data?.message);
          dispatch(setIsOpenDraftListDialog(false));
        } else {
          showToast('error', res?.data?.message);
        }
      }
      // setSubmitting(false);
    });
  };
  useEffect(() => {
    if (previewNewCustomerId) {
      setFieldValue('customer', previewNewCustomerId);
      dispatch(setPreviewNewCustomerId(''));
    }
  }, [previewNewCustomerId]);

  // useEffect(() => {
  //   if (bookingCustomer && customerData && customerData?.length > 0) {
  //     const selectCustomer = customerData.find(
  //       (item) => item?.bookingCustomerId === bookingCustomer,
  //     );
  //     setFieldValue('customer', selectCustomer);
  //   }
  // }, [bookingCustomer, customerData]);
  const fetchCustomerByBookingId = async (
    bookingCustomerId: string,
  ): Promise<SelectOption | null> => {
    const filterBy = JSON.stringify([
      {
        fieldName: 'bookingCustomerId',
        value: bookingCustomerId,
      },
    ]);

    try {
      const response = await fetch(
        `${BASE_URL}/customer/pagination?isPaginationRequired=false&filterBy=${filterBy}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = await response.json();

      if (result?.data?.length > 0) {
        const customer: Customer = result.data[0];

        return {
          label: `${customer.customerName} - ${customer.phone} - ${customer.email}`,
          value: customer._id,
          data: customer,
        };
      }

      return null; // No customer found
    } catch (error) {
      console.error('Error fetching customer by booking ID:', error);
      return null;
    }
  };
  useEffect(() => {
    if (bookingCustomer) {
      fetchCustomerByBookingId(bookingCustomer).then((customer) => {
        if (customer) {
          setSelectedCustomer(customer);
          setFieldValue('customer', customer.data); // ✅ Set form field value
        }
      });
    }
  }, [bookingCustomer, setFieldValue]);
  // const fetchOptions = async (inputValue: any): Promise<SelectOption[]> => {
  //   if (!inputValue) return [];

  //   const isNumber = /^\d+$/.test(inputValue.trim());

  //   try {
  //     const filterBy = JSON.stringify([
  //       {
  //         fieldName: isNumber ? 'phone' : 'customerName',
  //         value: inputValue,
  //       },
  //     ]);
  //     const response = await fetch(
  //       `${BASE_URL}/customer/pagination?isPaginationRequired=false&filterBy=${filterBy}`,
  //       {
  //         method: 'GET',
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );
  //     const data = await response.json();
  //     // console.log(data, 'data===============');

  //     return data?.data?.map((item: any) => ({
  //       label: `${item.customerName} - ${item?.phone} - ${item?.email}`,
  //       value: item._id,
  //       data: item,
  //     }));
  //   } catch (error) {
  //     console.error('Error fetching options:', error);
  //     return [];
  //   }
  // };

  const fetchOptions = async (inputValue: string): Promise<SelectOption[]> => {
  if (!inputValue?.trim()) return [];

  const query = inputValue.trim();
  let filterBy: any[] = [];

  const isNumber = /^\d+$/.test(query);
  const isEmail = query.includes('@');

  if (isNumber) {
    filterBy = [
      {
        fieldName: 'phone',
        value: query
      },
    ];
  } else if (isEmail) {
    filterBy = [
      {
        fieldName: 'email',
        value: query
      },
    ];
  } else {
    // Generic name/text input
    filterBy = [
      {
            fieldName: 'customerName',
            value: query
          }
    ];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/customer/pagination?isPaginationRequired=false&filterBy=${encodeURIComponent(
        JSON.stringify(filterBy)
      )}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    return (data?.data || []).map((item: any) => ({
      label: `${item.customerName || 'Unknown'} - ${item.phone || ''} - ${item.email || ''}`,
      value: item._id,
      data: item,
    }));
  } catch (error) {
    console.error('❌ Error fetching options:', error);
    return [];
  }
};

  const debouncedLoadOptions = useDebounce(
    async (inputValue: any, callback: (arg0: any[]) => void) => {
      setLoading(true);
      const options = await fetchOptions(inputValue);
      setLoading(false);
      callback(options);
    },
    1000,
  );

  return (
    <div className="flex flex-col w-full h-full gap-2 py-4">
      <div className="flex flex-col gap-4 px-4">
        {/* select outlet  */}
        {/* {userData?.userType === 'ADMIN' && (
          <div className="">
            <ATMSelect
              value={outlet}
              onChange={(newValue) => dispatch(setOutlet(newValue))}
              options={outletData}
              valueAccessKey="_id"
              getOptionLabel={(option) => option?.name}
              placeholder="Please Select Type"
              isClearable={false}
              isLoading={outletDataLoading}
            />
          </div>
        )} */}
        {/* <div className="">
          <ATMButton
            variant="outlined"
            color="error"
            onClick={() => dispatch(setIsOpenDraftListDialog(true))}
          >
            Pick from drafts
          </ATMButton>
        </div> */}

        {/* Customer Search Box and add new  */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {/* <ATMSelect
              value={values?.customer}
              onChange={(newValue) => {
                console.log(newValue, '======newValue====');

                setFieldValue('customer', newValue);
              }}
              placeholder="Select Customer"
              name="customer"
              options={customerData}
              label=""
              getOptionLabel={(option) =>
                `${option?.customerName} - ${option?.phone} - ${option?.email}`
              }
              valueAccessKey="_id"
              isLoading={customerLoading}
              searchKeys={['customerName', 'phone', 'email']}
              filterEnabled={true}
            /> */}
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={debouncedLoadOptions}
              value={selectedCustomer} // ✅ Set initial value
              onChange={(selectedOption: SelectOption | null) => {
                setSelectedCustomer(selectedOption);
                setFieldValue(
                  'customer',
                  selectedOption ? selectedOption.data : null,
                );
              }}
              placeholder="Search..."
              isLoading={loading}
              isClearable
            />
          </div>

          <div>
            <ATMButton
              compact
              extraClasses={`p-2.5`}
              onClick={() => dispatch(setIsOpenCustomerDialog(true))}
            >
              <IconPlus size={14} />
            </ATMButton>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-auto ">
        <div className="flex gap-2 p-4 py-1 text-sm font-medium text-slate-800">
          <div className="flex-1 truncate">Item</div>
          <div className="min-w-[60px]">Qty</div>
          <div className="min-w-[100px] text-right">Price</div>
          <div className="min-w-[20px]"></div>
        </div>

        <div className="flex-1 overflow-auto">
          {cartItems?.map((item) => {
            return (
              <div
                key={item?._id}
                className="flex items-center gap-2 p-4 py-2 text-slate-800 even:bg-gray-100"
              >
                <div className="flex-1 overflow-hidden text-xs">
                  <div className="w-full truncate">{item?.itemName}</div>
                  <div className="font-medium text-pink-800">
                    {item?.sellingPrice}
                  </div>
                </div>
                <div className="min-w-[60px] flex bg-primary rounded items-center p-0.5">
                  <IconMinus
                    onClick={() => onQuantityChange(item?._id, 'DECREMENT')}
                    size={14}
                    className="text-white cursor-pointer"
                  />
                  <div className="flex justify-center flex-1 text-xs text-white select-none ">
                    {item?.quantity}
                  </div>
                  <IconPlus
                    onClick={() => onQuantityChange(item?._id, 'INCREMENT')}
                    size={14}
                    className="text-white cursor-pointer"
                  />
                </div>
                <div className="min-w-[100px] text-xs font-medium select-none text-right ">
                  {(item?.sellingPrice * item?.quantity).toFixed(2)}
                </div>
                <div
                  className="min-w-[20px] text-right cursor-pointer"
                  onClick={() => onRemove(item?._id)}
                >
                  <IconTrash size={18} className="text-error" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Amount Calculation */}
      <div className="border-t">
        {/* Total */}
        <div className="flex justify-end gap-2 px-4 py-1">
          <div
            className="text-base font-medium "
            onClick={() => setIsOpenAddNotesDialog(true)}
          >
            Notes
          </div>
        </div>
        <div className="flex gap-2 p-4 py-1 text-sm font-medium text-slate-800">
          <div className="flex-1 truncate">Total {cartItems?.length}</div>
          <div className="min-w-[60px]">
            {cartItems?.reduce((sum, item) => {
              return sum + item?.quantity;
            }, 0)}
          </div>
          <div className="min-w-[100px] text-right">
            {/* {CURRENCY} */}
            {cartItems
              ?.reduce((sum, item) => {
                return sum + item?.quantity * item?.sellingPrice;
              }, 0)
              .toFixed(2)}
          </div>
        </div>

        <AmountSummaryCard items={cartItems} customer={values?.customer} />
        {isOpenAddDialog && (
          <PaymentFormWrapper
            onClose={() => dispatch(setIsOpenAddDialog(false))}
            items={cartItems}
            customerId={values?.customer}
            formikProps={formikProps}
          />
        )}

        {isOpenAddNotesDialog && (
          <AddNotes
            onClose={() => setIsOpenAddNotesDialog(false)}
            formType="ADD"
            formikProps={formikProps}
          />
        )}
        {isOpenDraftListDialog && (
          <DraftList
            onClose={() => dispatch(setIsOpenDraftListDialog(false))}
            onEdit={(item) => {
              handleGetDraftData(item?._id);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CartSummarySection;
