import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { CouponFormValues } from '../models/Coupon.model';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMDatePicker from 'src/components/atoms/FormElements/ATMDatePicker/ATMDatePicker';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetCustomersQuery } from 'src/modules/Customer/service/CustomerServices';

const typeOptions = [
  {
    label: 'Coupon Code',
    value: 'COUPON_CODE',
  },
  {
    label: 'Referral Code',
    value: 'REFERRAL_CODE',
  },
];

type Props = {
  formikProps: FormikProps<CouponFormValues>;
  onClose: () => void;
  formType: 'ADD' | 'EDIT';
  isLoading?: boolean;
};

const CouponFormLayout = ({
  formikProps,
  onClose,
  formType,
  isLoading,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  const formHeading = formType === 'ADD' ? 'Add Coupon' : 'Edit Coupon';
  const { data: customerData, isLoading: customerIsLoading } = useFetchData(
    useGetCustomersQuery,
    {
      body: {},
    },
  );
  const handleValidPercent = (event: any): boolean => {
    return !isNaN(event) && event >= 0 && event <= 100;
  };
  return (
    <MOLFormDialog
      title={formHeading}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-[280px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/*  type */}
          {/* <div className="col-span-2">
            <ATMSelect
              required
              name="type"
              value={values.type}
              onChange={(newValue) => setFieldValue('type', newValue)}
              label="Type"
              options={typeOptions}
              valueAccessKey="value"
              placeholder="Please Select Type"
            />
          </div> */}
          {/* referralCode */}
          <div className="">
            <ATMTextField
              required
              name="referralCode"
              value={values.referralCode}
              onChange={(e) => setFieldValue('referralCode', e.target.value)}
              label="Referral Code"
              placeholder="Enter Referral Code"
              onBlur={handleBlur}
              isTouched={touched?.referralCode}
              errorMessage={errors?.referralCode}
              isValid={!errors?.referralCode}
            />
          </div>
          {/* discountAmount */}
          <div className="">
            <ATMNumberField
              required
              name="discountAmount"
              value={values.discountAmount}
              onChange={(newValue) =>
                handleValidPercent(newValue) &&
                setFieldValue('discountAmount', newValue)
              }
              label="Discount (in %)"
              placeholder="Enter Discount (in %)"
              onBlur={handleBlur}
              isTouched={touched?.discountAmount}
              errorMessage={errors?.discountAmount}
              isValid={!errors?.discountAmount}
            />
          </div>
          {/*  User  */}
          {values?.type?.value === 'REFERRAL_CODE' ? (
            <div>
              <ATMSelect
                required
                name="user"
                value={values.user}
                onChange={(newValue) => setFieldValue('user', newValue)}
                label="User"
                options={customerData}
                valueAccessKey="_id"
                placeholder="Please Select User"
                getOptionLabel={(options) => options?.customerName}
                isLoading={customerIsLoading}
              />
            </div>
          ) : null}
          {/*  User Earn Point */}
          {values?.type?.value === 'REFERRAL_CODE' ? (
            <div className="">
              <ATMNumberField
                required
                name="earnPoint"
                value={values.earnPoint}
                onChange={(newValue) => setFieldValue('earnPoint', newValue)}
                label="Earn Point"
                placeholder="Enter Earn Point"
                onBlur={handleBlur}
                // isTouched={touched?.earnPoint}
                // errorMessage={errors?.earnPoint}
                isValid={!errors?.earnPoint}
              />
            </div>
          ) : null}

          {/* QTY */}
          <div className="">
            <ATMNumberField
              required
              name="quantity"
              value={values.quantity}
              onChange={(newValue) => setFieldValue('quantity', newValue)}
              label="Qty."
              placeholder="Enter Qty"
              onBlur={handleBlur}
              isTouched={touched?.quantity}
              errorMessage={errors?.quantity}
              isValid={!errors?.quantity}
            />
          </div>
          {/* Valid */}
          <div className="">
            <ATMDatePicker
              required
              name="valid"
              value={values?.valid}
              onChange={(newValue) => setFieldValue('valid', newValue)}
              label="Valid Till"
              dateFormat="dd/MM/yyyy"
              placeholder="Please Select Date"
            />
          </div>
          <div className="z-auto col-span-2">
            <ATMTextArea
              required
              name="note"
              value={values.note}
              onChange={(e) => setFieldValue('note', e.target.value)}
              label="Note"
              placeholder="Short Note"
              onBlur={handleBlur}
              isTouched={touched?.note}
              errorMessage={errors?.note}
              isValid={!errors?.note}
            />
          </div>
        </div>
      )}
    </MOLFormDialog>
  );
};

export default CouponFormLayout;
