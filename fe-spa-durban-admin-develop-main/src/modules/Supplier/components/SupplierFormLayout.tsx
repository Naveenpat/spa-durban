import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { SupplierFormValues } from '../models/Supplier.model';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import { countries } from 'src/modules/Customer/components/CustomerFormLayout';

type Props = {
  formikProps: FormikProps<SupplierFormValues>;
  onCancel: () => void;
  formType: 'ADD' | 'EDIT';
  isLoading?: boolean;
};

const SupplierFormLayout = ({
  formikProps,
  onCancel,
  formType,
  isLoading = false,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between w-[70%] m-auto">
            <div className="font-semibold ">
              {formType === 'ADD' ? 'Add Supplier' : 'Update Supplier'}
            </div>
            <div className="flex items-center gap-2">
              <div>
                <ATMButton
                  children="Cancel"
                  variant="outlined"
                  onClick={onCancel}
                />
              </div>
              <div>
                <ATMButton
                  type="submit"
                  isLoading={isSubmitting}
                  children="Submit"
                />
              </div>
            </div>
          </div>
          <div className="border-t"></div>
          <div className="grid grid-cols-3 gap-4 w-[70%] m-auto">
            {/* Name */}
            <div className="col-span-3">
              <ATMTextField
                required
                name="supplierName"
                value={values.supplierName}
                onChange={(e) => setFieldValue('supplierName', e.target.value)}
                label="Name"
                placeholder="Enter Name"
                onBlur={handleBlur}
                isTouched={touched?.supplierName}
                errorMessage={errors?.supplierName}
                isValid={!errors?.supplierName}
              />
            </div>
            {/* Phone */}
            <div className="">
              <ATMNumberField
                required
                name="phone"
                value={values?.phone}
                onChange={(newValue) => setFieldValue('phone', newValue)}
                label="Phone"
                placeholder="Enter Phone"
                onBlur={handleBlur}
                isTouched={touched?.phone}
                errorMessage={errors?.phone}
                isValid={!errors?.phone}
              />
            </div>
            {/* TaxID */}
            <div className="">
              <ATMTextField
                required
                name="taxId"
                value={values?.taxId}
                onChange={(e) => setFieldValue('taxId', e.target.value)}
                label="Tax No."
                placeholder="Enter Tax No."
                onBlur={handleBlur}
                isTouched={touched?.taxId}
                errorMessage={errors?.taxId}
                isValid={!errors?.taxId}
              />
            </div>
            {/* Email */}
            <div className="">
              <ATMTextField
                required
                name="email"
                value={values?.email}
                onChange={(e) => setFieldValue('email', e.target.value)}
                label="Email"
                placeholder="Enter Email"
                onBlur={handleBlur}
                isTouched={touched?.email}
                errorMessage={errors?.email}
                isValid={!errors?.email}
              />
            </div>

            {/* City */}
            <div className="">
              <ATMTextField
                required
                name="city"
                value={values?.city}
                onChange={(e) => setFieldValue('city', e.target.value)}
                label="City"
                placeholder="Enter City"
                onBlur={handleBlur}
                isTouched={touched?.city}
                errorMessage={errors?.city}
                isValid={!errors?.city}
              />
            </div>
            {/* Region */}
            <div className="">
              <ATMTextField
                required
                name="region"
                value={values?.region}
                onChange={(e) => setFieldValue('region', e.target.value)}
                label="Region"
                placeholder="Enter Region"
                onBlur={handleBlur}
                isTouched={touched?.region}
                errorMessage={errors?.region}
                isValid={!errors?.region}
              />
            </div>
            {/*country */}
            <div className="">
              <ATMSelect
                name="country"
                value={values?.country}
                onChange={(newValue) => setFieldValue('country', newValue)}
                label="Country"
                placeholder="Select Country"
                options={countries}
                valueAccessKey="label"
                onBlur={handleBlur}
              />
            </div>
            {/* Address */}
            <div className="col-span-3 ">
              <ATMTextArea
                required
                name="address"
                value={values?.address}
                onChange={(e) => setFieldValue('address', e.target.value)}
                label="Address"
                placeholder="Enter Address"
                onBlur={handleBlur}
                isTouched={touched?.address}
                errorMessage={errors?.address}
                isValid={!errors?.address}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupplierFormLayout;
