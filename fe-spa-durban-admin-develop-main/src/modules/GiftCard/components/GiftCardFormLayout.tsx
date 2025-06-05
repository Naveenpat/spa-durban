import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { GiftCardFormValues } from '../models/GiftCard.model';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMDatePicker from 'src/components/atoms/FormElements/ATMDatePicker/ATMDatePicker';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetCustomersQuery } from 'src/modules/Customer/service/CustomerServices';
type Props = {
  formikProps: FormikProps<GiftCardFormValues>;
  onClose: () => void;
  isLoading?: boolean;
  formType: 'ADD' | 'EDIT';
};

const GiftCardFormLayout = ({
  formikProps,
  onClose,
  isLoading = false,
  formType,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  const { data: customerData, isLoading: customerIsLoading } = useFetchData(
    useGetCustomersQuery,
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

  const formHeading = formType === 'ADD' ? 'Add Gift-Card' : 'Edit Gift-Card';
  return (
    <MOLFormDialog
      title={formHeading}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {isLoading ? (
        <div className="flex justify-center items-center  h-[185px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-[15px] text-slate-500 font-medium">
            <div>Select Type</div>
            <div className="flex gap-5 mt-2">
              <label>
                <input
                  type="radio"
                  name="type"
                  value="WHOEVER_BOUGHT"
                  checked={values?.type === 'WHOEVER_BOUGHT'}
                  onChange={() => setFieldValue('type', 'WHOEVER_BOUGHT')}
                />
              </label>
              <div className="text-[15px] font-semibold">Whoever Bought</div>
              <label>
                <input
                  type="radio"
                  name="type"
                  value="SPECIFIC_CUSTOMER"
                  checked={values?.type === 'SPECIFIC_CUSTOMER'}
                  onChange={() => setFieldValue('type', 'SPECIFIC_CUSTOMER')}
                />
              </label>
              <div className="text-[15px] font-semibold">Specific Customer</div>
            </div>
          </div>
          {/* Select Customer */}
          {values?.type === 'SPECIFIC_CUSTOMER' ? (
            <ATMSelect
              name="customerId"
              value={values.customerId}
              onChange={(newValue) => setFieldValue('customerId', newValue)}
              label="Customer Name"
              placeholder="Select Customer Name"
              options={customerData}
              valueAccessKey="_id"
              getOptionLabel={(options) => options?.customerName}
              isLoading={customerIsLoading}
            />
          ) : null}

          {/* GiftCardAmount */}
          <div>
            <ATMNumberField
              required
              name="giftCardAmount"
              value={values.giftCardAmount}
              onChange={(e) => setFieldValue('giftCardAmount', e)}
              label="Gift Card Amount"
              placeholder="Enter Gift Card Amount"
              onBlur={handleBlur}
            />
          </div>

          {/* GiftCard Code */}
          <div className="">
            <ATMTextField
              required
              name="giftCardName"
              value={values.giftCardName}
              onChange={(e) => setFieldValue('giftCardName', e.target.value)}
              label="Gift Card Code"
              placeholder="Enter Gift Card Code"
              onBlur={handleBlur}
              isTouched={touched?.giftCardName}
              errorMessage={errors?.giftCardName}
              isValid={!errors?.giftCardName}
            />
          </div>

          {/* Expiry Date */}
          <div className="">
            <ATMDatePicker
              required
              name="giftCardExpiryDate"
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              value={values?.giftCardExpiryDate}
              onChange={(newValue) =>
                setFieldValue('giftCardExpiryDate', newValue)
              }
              label="Gift Card Expiry Date"
              placeholder="dd/MM/yyyy"
            />
          </div>
        </div>
      )}
    </MOLFormDialog>
  );
};

export default GiftCardFormLayout;
