import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { TaxFormValues } from '../models/Tax.model';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import { isValidNumber } from 'src/utils';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  formikProps: FormikProps<TaxFormValues>;
  onClose: () => void;
  formType: 'ADD' | 'EDIT';
  isLoading?: boolean;
};

const taxTypeOptions = [
  {
    label: 'VAT',
    value: 'VAT',
  },
  {
    label: 'CGST',
    value: 'CGST',
  },
  {
    label: 'SGST',
    value: 'SGST',
  },
  {
    label: 'IGST',
    value: 'IGST',
  },
];

const TaxFormLayout = ({ formikProps, onClose, formType, isLoading = false }: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  const formHeading = formType === 'ADD' ? 'Add Tax' : 'Edit Tax';

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
        <div className="flex justify-center items-center max-w-[500px] h-[140px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Tax Type */}
          <div>
            <ATMSelect
              name="taxType"
              value={values.taxType}
              onChange={(newValue) => setFieldValue('taxType', newValue)}
              label="Tax Type"
              options={taxTypeOptions}
              valueAccessKey="value"
              placeholder="Please Select Tax Type"
            />
          </div>

          {/* Tax Percent */}
          <div className="">
            <ATMNumberField
              required
              name="taxPercent"
              value={values.taxPercent}
              onChange={(newValue) =>
                handleValidPercent(newValue) &&
                setFieldValue('taxPercent', newValue)
              }
              isAllowDecimal
              label="Tax Percent (%)"
              placeholder="Enter tax percent"
              onBlur={handleBlur}
              isTouched={touched?.taxPercent}
              errorMessage={errors?.taxPercent}
              isValid={!errors?.taxPercent}
            />
          </div>
        </div>
      )}
    </MOLFormDialog>
  );
};

export default TaxFormLayout;
