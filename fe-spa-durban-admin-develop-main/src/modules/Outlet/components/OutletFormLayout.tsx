import { FormikProps } from 'formik';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMFileUploader from 'src/components/atoms/FormElements/ATMFileUploader/ATMFileUploader';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import { OutletFormValues } from '../models/Outlet.model';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import { onlyCapitalAlphabetAllow } from 'src/utils';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetAccountsQuery } from 'src/modules/Account/service/AccountServices';
import { countries } from 'src/modules/Customer/components/CustomerFormLayout';
import { useGetCompaniesQuery } from 'src/modules/AdminRole copy/service/CompanyServices';

type Props = {
  formikProps: FormikProps<OutletFormValues>;
  oncancel: () => void;
  formType: 'ADD' | 'EDIT';
  isLoading?: boolean;
};

const OutletFormLayout = ({
  formikProps,
  oncancel,
  formType,
  isLoading = false,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  const { data: companyData } = useFetchData(
    useGetCompaniesQuery
  )

  const { data, isLoading: accountsLoading } = useFetchData(
    useGetAccountsQuery,
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
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between w-[70%] m-auto">
            <div className="font-semibold ">
              {formType === 'ADD' ? 'Add Outlet' : 'Update Outlet'}
            </div>
            <div className="flex items-center gap-2">
              <div>
                <ATMButton
                  children="Cancel"
                  variant="outlined"
                  onClick={oncancel}
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
            <div className="">
              <ATMTextField
                required
                name="name"
                value={values.name}
                onChange={(e) => setFieldValue('name', e.target.value)}
                label="Name"
                placeholder="Enter Name"
                onBlur={handleBlur}
                isTouched={touched?.name}
                errorMessage={errors?.name}
                isValid={!errors?.name}
              />
            </div>
            {/* phone */}
            <div className="">
              <ATMNumberField
                required
                name="phone"
                value={values.phone}
                onChange={(newValue) => setFieldValue('phone', newValue)}
                label="Phone"
                placeholder="Enter phone"
                onBlur={handleBlur}
                isTouched={touched?.phone}
                errorMessage={errors?.phone}
                isValid={!errors?.phone}
              />
            </div>
            {/* email */}
            <div className="">
              <ATMTextField
                name="email"
                required
                value={values.email}
                onChange={(e) => setFieldValue('email', e.target.value)}
                label="Email"
                placeholder="Enter email"
                onBlur={handleBlur}
                isTouched={touched?.email}
                errorMessage={errors?.email}
                isValid={!errors?.email}
              />
            </div>
            {/* Address */}
            <div className="col-span-3 ">
              <ATMTextArea
                name="address"
                required
                value={values.address}
                onChange={(e) => setFieldValue('address', e.target.value)}
                label="Address"
                placeholder="Enter address"
                onBlur={handleBlur}
                isTouched={touched?.address}
                errorMessage={errors?.address}
                isValid={!errors?.address}
              />
            </div>
            {/* city */}
            <div className="">
              <ATMTextField
                required
                name="city"
                value={values.city}
                onChange={(e) => setFieldValue('city', e.target.value)}
                label="City"
                placeholder="Enter city"
                onBlur={handleBlur}
                isTouched={touched?.city}
                errorMessage={errors?.city}
                isValid={!errors?.city}
              />
            </div>
            {/* region */}
            <div className="">
              <ATMTextField
                required
                name="region"
                value={values.region}
                onChange={(e) => setFieldValue('region', e.target.value)}
                label="Region"
                placeholder="Enter region"
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

            {/* Tax Id */}
            <div className="">
              <ATMTextField
                required
                name="taxID"
                value={values.taxID}
                onChange={(e) => setFieldValue('taxID', e.target.value)}
                label="Tax ID"
                placeholder="Enter Tax ID"
                onBlur={handleBlur}
                isTouched={touched?.taxID}
                errorMessage={errors?.taxID}
                isValid={!errors?.taxID}
              />
            </div>
            {/* Invoice Prefix */}
            <div className="">
              <ATMTextField
                required
                name="invoicePrefix"
                value={values.invoicePrefix}
                onChange={(e) => setFieldValue('invoicePrefix', e.target.value)}
                label="Invoice Prefix"
                placeholder="Enter Invoice Prefix"
                onBlur={handleBlur}
                isTouched={touched?.invoicePrefix}
                errorMessage={errors?.invoicePrefix}
                isValid={!errors?.invoicePrefix}
              />
            </div>
            {/* Invoice Number */}
            <div className="">
              <ATMNumberField
                required
                name="invoiceNumber"
                value={values.invoiceNumber}
                onChange={(newValue) =>
                  setFieldValue('invoiceNumber', newValue)
                }
                label="Invoice Number"
                placeholder="Enter Invoice Number"
                onBlur={handleBlur}
                isTouched={touched?.invoiceNumber}
                errorMessage={errors?.invoiceNumber}
                isValid={!errors?.invoiceNumber}
                disabled={formType === 'EDIT'}
              />
            </div>
            {/* defaultAccount  */}
            <div>
              <ATMSelect
                required
                name="onlinePaymentAccountId"
                value={values?.onlinePaymentAccountId}
                onChange={(newValue) =>
                  setFieldValue('onlinePaymentAccountId', newValue)
                }
                label="Online Bank Account"
                options={data}
                valueAccessKey="_id"
                getOptionLabel={(option) => option?.accountName}
                placeholder="Please Select  Account"
                isLoading={accountsLoading}
              />
            </div>

            <div>
              <ATMSelect
                required
                name="companyId"
                value={values?.companyId}
                onChange={(newValue) => setFieldValue('companyId', newValue)}
                label="Company"
                getOptionLabel={(options) => options?.companyName}
                options={companyData}
                valueAccessKey="_id"
                placeholder="Please Select Company"
              />
            </div>

            <div className="">


              <div className="relative h-36 w-36 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center overflow-hidden">
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFieldValue('logo', reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                {!values.logo ? (
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="text-xs text-gray-500 mb-1">324 Px * 313 Px</div>
                    <span className="text-4xl text-gray-400 z-0">+</span>
                  </div>
                ) : (
                  <img
                    src={values.logo}
                    alt="Logo Preview"
                    className="h-full w-full object-contain z-0"
                  />
                )}
              </div>
            </div>


            {/* <div className="">
              <ATMFileUploader
                name="logo"
                value={values.logo}
                onChange={(file: string) => {
                  setFieldValue('logo', file);
                }}
                label="Outlet Logo"
                accept=".jpg, .jpeg, .png, .gif"
              />
            </div>
          </div> */}

            <div className="grid grid-cols-3 w-[70%] m-auto gap-4">
              {/* <div className="hidden ">
          <ATMFileUploader
            required
            name="companyLogo"
            value={values?.companyLogo}
            onChange={(newValue) => setFieldValue('companyLogo', newValue)}
            label="Company Logo"
          />
        </div> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OutletFormLayout;
