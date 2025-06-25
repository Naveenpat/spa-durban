import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import { UserProfileFormValues } from '../models/UserProfile.model';
import ATMFileUploader from 'src/components/atoms/FormElements/ATMFileUploader/ATMFileUploader';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import { countries } from 'src/modules/Customer/components/CustomerFormLayout';

type Props = {
  formikProps: FormikProps<UserProfileFormValues>;
};

const EditUserProfileForm = ({ formikProps }: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  return (
    <div className="relative p-4">
      <div className="sticky flex items-center justify-between py-2 bg-white -top-2">
        <span className="text-lg font-semibold text-slate-700 text-primary-50">
          Update Your Profile{' '}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1">
        {/* Name */}
        <div className="">
          <ATMTextField
            required
            name="name"
            value={values?.name}
            onChange={(e) => setFieldValue('name', e.target.value)}
            label="Name"
            placeholder="Enter Name"
            onBlur={handleBlur}
            isTouched={touched?.name}
            errorMessage={errors?.name}
            isValid={!errors?.name}
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
        {/* Mobile */}
        <div className="">
          <ATMTextField
            required
            name="mobile"
            value={values?.mobile}
            onChange={(e) => setFieldValue('mobile', e.target.value)}
            label="Mobile"
            placeholder="Enter Mobile"
            onBlur={handleBlur}
            isTouched={touched?.mobile}
            errorMessage={errors?.mobile}
            isValid={!errors?.mobile}
          />
        </div>
        {/* Alternate Mobile */}
        {/* <div className="">
          <ATMTextField
            required
            name="altMobile"
            value={values?.altMobile}
            onChange={(e) => setFieldValue('altMobile', e.target.value)}
            label="Alternate Mobile"
            placeholder="Enter Alternate Mobile"
            onBlur={handleBlur}
            isTouched={touched?.altMobile}
            errorMessage={errors?.altMobile}
            isValid={!errors?.altMobile}
          />
        </div> */}
        {/* Address */}
        <div>
          <ATMTextField
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
        {/* City */}
        <div>
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
        {/* Post Box */}
        {/* <div>
          <ATMTextField
            required
            name="postBox"
            value={values?.postBox}
            onChange={(e) => setFieldValue('postBox', e.target.value)}
            label="Post Box"
            placeholder="Enter Post Box"
            onBlur={handleBlur}
            isTouched={touched?.postBox}
            errorMessage={errors?.postBox}
            isValid={!errors?.postBox}
          />
        </div> */}
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
        {/* Language */}
        {/* <div>
          <ATMTextField
            required
            name="language"
            value={values?.language}
            onChange={(e) => setFieldValue('language', e.target.value)}
            label="Language"
            placeholder="Enter Language"
            onBlur={handleBlur}
            isTouched={touched?.language}
            errorMessage={errors?.language}
            isValid={!errors?.language}
          />
        </div> */}
      </div>
      <div className="grid gap-4 mt-3 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1">
        {/* Photo */}
        <div>
          <ATMFileUploader
            required
            name="photoUrl"
            value={values?.photoUrl}
            label="Photo"
            onChange={(newValue) => {
              setFieldValue('photoUrl', newValue);
            }}
            folderName='users'
          />
        </div>
        {/* Signature */}
        <div>
          <ATMFileUploader
            required
            name="signatureUrl"
            value={values?.signatureUrl}
            label="Signature"
            onChange={(newValue) => {
              setFieldValue('signatureUrl', newValue);
            }}
          />
        </div>
      </div>
      <div className="sticky bottom-0 flex items-center justify-end gap-2 px-4 py-3 bg-white">
        <ATMButton type="submit" isLoading={isSubmitting}>
          Submit
        </ATMButton>
      </div>
    </div>
  );
};

export default EditUserProfileForm;
