import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { CategoryFormValues } from '../models/Category.model';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { SketchPicker } from 'react-color';
type Props = {
  formikProps: FormikProps<CategoryFormValues>;
  onClose: () => void;
  formType: 'ADD' | 'EDIT';
  isLoading?: boolean;
};

const CategoryFormLayout = ({
  formikProps,
  onClose,
  formType,
  isLoading = false,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  return (
    <MOLFormDialog
      title={formType === 'ADD' ? 'Add Category' : 'Update Category'}
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
              name="categoryName"
              value={values.categoryName}
              onChange={(e) => setFieldValue('categoryName', e.target.value)}
              label="Category Name"
              placeholder="Enter Category Name"
              onBlur={handleBlur}
              isTouched={touched?.categoryName}
              errorMessage={errors?.categoryName}
              isValid={!errors?.categoryName}
            />
          </div>
          {/* Description */}
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
          <div className="">
            <SketchPicker
              color={values.colorCode}
              onChangeComplete={(e) => setFieldValue('colorCode', e.hex)}
            />
          </div>
        </div>
      )}
    </MOLFormDialog>
  );
};

export default CategoryFormLayout;
