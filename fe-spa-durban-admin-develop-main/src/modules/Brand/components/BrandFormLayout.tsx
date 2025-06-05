import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { BrandFormValues } from '../models/Brand.model';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  formikProps: FormikProps<BrandFormValues>;
  onClose: () => void;
  formType: 'ADD' | 'EDIT';
  isLoading?: boolean;
};

const BrandFormLayout = ({
  formikProps,
  onClose,
  formType,
  isLoading = false,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  return (
    <MOLFormDialog
      title={formType === 'ADD' ? 'Add Brand' : 'Update Brand'}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {isLoading ? (
        <div className="flex justify-center items-center  h-[185px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Name */}
          <div className="">
            <ATMTextField
              required
              name="brandName"
              value={values.brandName}
              onChange={(e) => setFieldValue('brandName', e.target.value)}
              label="Brand Name"
              placeholder="Enter Brand Name"
              onBlur={handleBlur}
              isTouched={touched?.brandName}
              errorMessage={errors?.brandName}
              isValid={!errors?.brandName}
            />
          </div>
          <div className="">
            <ATMTextArea
              name="description"
              value={values.description}
              onChange={(e) => setFieldValue('description', e.target.value)}
              label="Description"
              placeholder="Enter Description"
              onBlur={handleBlur}
              isTouched={touched?.description}
              errorMessage={errors?.description}
              isValid={!errors?.description}
            />
          </div>
        </div>
      )}
    </MOLFormDialog>
  );
};

export default BrandFormLayout;
