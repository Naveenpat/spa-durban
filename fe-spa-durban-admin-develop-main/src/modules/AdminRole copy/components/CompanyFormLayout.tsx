import { FormikProps } from 'formik';
import { ATMButton } from '../../../components/atoms/ATMButton/ATMButton';
import ATMTextField from '../../../components/atoms/FormElements/ATMTextField/ATMTextField';
import ATMFieldLabel from '../../../components/atoms/ATMFieldLabel/ATMFieldLabel';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { CompanyFormValues } from '../models/Company.model';

type Props = {
  formikProps: FormikProps<CompanyFormValues>;
  // onClose: () => void;
  formType?: 'ADD' | 'EDIT';
  isLoading?: boolean;
  onCancel: () => void;
};

const CompanyFormLayout = ({
  formikProps,
  // onClose,
  formType = 'ADD',
  onCancel,
  isLoading=false
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  const onSelect = ({
    context = 'feature',
    data,
    isSelected,
  }: {
    context?: 'module' | 'feature' | 'field';
    data: any;
    isSelected: boolean;
    moduleData?: any;
  }) => {
   
  };

  return (
  <>
   {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <ATMCircularProgress />
        </div>
      ) :( <div className="flex flex-col h-full gap-4 p-4">
        {/* Heading */}
        <div className="border-b">
          <div className="flex items-center justify-between py-4 mx-auto xl:w-2/3">
            <div className="text-xl font-semibold text-slate-700">
              {formType === 'ADD' ? 'Add Company' : 'Update Company'}
            </div>
            <div className="flex gap-2">
              <ATMButton variant="text" color="primary" onClick={onCancel}>
                Cancel
              </ATMButton>
              <ATMButton
                isLoading={isSubmitting}
                type="submit"
                variant="contained"
                color="primary"
              >
                Save
              </ATMButton>
            </div>
          </div>
        </div>
  
       <div className="flex flex-col w-full gap-4 mx-auto xl:w-2/3">
  <div>
    <ATMTextField
      name="companyName"
      value={values.companyName}
      onChange={(e) => setFieldValue('companyName', e.target.value)}
      label="Company Name"
      placeholder="Enter company name"
      onBlur={handleBlur}
      isTouched={touched?.companyName}
      errorMessage={errors?.companyName}
      isValid={!errors?.companyName}
    />
  </div>

  <div>
    <ATMTextField
      name="email"
      value={values.email}
      onChange={(e) => setFieldValue('email', e.target.value)}
      label="Email"
      placeholder="Enter email address"
      onBlur={handleBlur}
      isTouched={touched?.email}
      errorMessage={errors?.email}
      isValid={!errors?.email}
    />
  </div>

  <div>
    <ATMTextField
      name="phone"
      value={values.phone}
      onChange={(e) => setFieldValue('phone', e.target.value)}
      label="Phone"
      placeholder="Enter phone number"
      onBlur={handleBlur}
      isTouched={touched?.phone}
      errorMessage={errors?.phone}
      isValid={!errors?.phone}
    />
  </div>

  <div className="flex flex-col gap-2">
  <ATMTextField
    name="logo"
    value={values.logo || ''}
    onChange={(e) => setFieldValue('logo', e.target.value)}
    label="Logo URL"
    placeholder="Enter logo URL"
    onBlur={handleBlur}
    isTouched={touched?.logo}
    errorMessage={errors?.logo}
    isValid={!errors?.logo}
  />

  {/* Logo Preview Circle */}
  {values.logo && (
    <div className="flex">
      <img
        src={values.logo}
        alt="Logo Preview"
        onError={(e) => (e.currentTarget.src = '/images/default-logo.png')}
        className="h-20 w-20 object-contain rounded-full border shadow"
      />
    </div>
  )}
</div>

</div>

      </div>)}
  
    </>
  );
};

export default CompanyFormLayout;
