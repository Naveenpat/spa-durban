import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { SubCategoryFormValues } from '../models/SubCategory.model';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetCategoriesQuery } from 'src/modules/Category/service/CategoryServices';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  formikProps: FormikProps<SubCategoryFormValues>;
  onClose: () => void;
  formType: 'ADD' | 'EDIT';
  isLoading?: boolean;
};

const SubCategoryFormLayout = ({
  formikProps,
  onClose,
  formType,
  isLoading = false,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  const { data } = useFetchData(useGetCategoriesQuery);
  return (
    <MOLFormDialog
      title={formType === 'ADD' ? 'Add Sub Category' : 'Update Sub Category'}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {' '}
      {isLoading ? (
        <div className="flex justify-center items-center  h-[185px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="">
            {/* Category Name*/}
            <ATMSelect
              required
              name="categoryName"
              value={values.categoryName}
              onChange={(newValue) => setFieldValue('categoryName', newValue)}
              label="Category Name"
              placeholder="Select Category Name"
              options={data}
              valueAccessKey="_id"
              getOptionLabel={(option) => option?.categoryName}
            />
          </div>

          {/* Name */}
          <div className="">
            <ATMTextField
              required
              name="subCategoryName"
              value={values.subCategoryName}
              onChange={(e) => setFieldValue('subCategoryName', e.target.value)}
              label="Sub Category Name"
              placeholder="Enter Sub Category"
              onBlur={handleBlur}
              isTouched={touched?.subCategoryName}
              errorMessage={errors?.subCategoryName}
              isValid={!errors?.subCategoryName}
            />
          </div>
          {/* Desciption */}
          <div className="">
            <ATMTextArea
              required
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

export default SubCategoryFormLayout;
