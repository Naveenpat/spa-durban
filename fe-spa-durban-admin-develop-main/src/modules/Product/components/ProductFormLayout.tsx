import { FormikProps } from 'formik';
import React from 'react';
import { useDispatch } from 'react-redux';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import ATMFileUploader from 'src/components/atoms/FormElements/ATMFileUploader/ATMFileUploader';
import ATMMultiSelect from 'src/components/atoms/FormElements/ATMMultiSelect/ATMMultiSelect';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetBrandsQuery } from 'src/modules/Brand/service/BrandServices';
import { useGetCategoriesQuery } from 'src/modules/Category/service/CategoryServices';
import { useGetMeasurementUnitsQuery } from 'src/modules/MeasurmentUnit/service/MeasurmentUnitServices';
import { useGetSubCategoriesQuery } from 'src/modules/SubCategory/service/SubCategoryServices';
import { useGetTaxQuery } from 'src/modules/Tax/service/TaxServices';
import { setFieldCustomized } from 'src/slices/SideNavLayoutSlice';
import { AppDispatch } from 'src/store';

type Props = {
  formikProps: FormikProps<ProductFormValues>;
  onCancel: () => void;
  formType: 'ADD' | 'EDIT';
  isLoading?: boolean;
};

const ProductFormLayout = ({
  formikProps,
  onCancel,
  isLoading = false,
  formType,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    values,
    setFieldValue,
    isSubmitting,
    handleBlur,
    touched,
    errors,
    dirty,
  } = formikProps;
  React.useEffect(() => {
    if (dirty) {
      dispatch(setFieldCustomized(dirty));
    } else {
      dispatch(setFieldCustomized(dirty));
    }
  }, [dirty, setFieldCustomized]);
  const { data: brandsData, isLoading: brandsLoading } = useGetBrandsQuery({
    isPaginationRequired: false,
    filterBy: JSON.stringify([
      {
        fieldName: 'isActive',
        value: true,
      },
    ]),
  });
  const { data: taxData, isLoading: taxLoading } = useGetTaxQuery({
    isPaginationRequired: false,
    filterBy: JSON.stringify([
      {
        fieldName: 'isActive',
        value: true,
      },
    ]),
  });
  const { data: measurementData, isLoading: measurementLoading } =
    useGetMeasurementUnitsQuery({
      isPaginationRequired: false,
      filterBy: JSON.stringify([
        {
          fieldName: 'isActive',
          value: true,
        },
      ]),
    });
  const { data: categoryData, isLoading: categoryLoading } =
    useGetCategoriesQuery({
      isPaginationRequired: false,
      filterBy: JSON.stringify([
        {
          fieldName: 'isActive',
          value: true,
        },
      ]),
    });
  const { data: subCategoryData, isLoading: subCategoryLoading } = useFetchData(
    useGetSubCategoriesQuery,
    {
      body: {
        isPaginationRequired: false,
        filterBy: JSON.stringify([
          {
            fieldName: 'isActive',
            value: true,
          },
          {
            fieldName: 'categoryId',
            value: values?.categoryId?._id,
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
              {formType === 'ADD' ? 'Add Product' : 'Update Product'}
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
            <div>
              <ATMTextField
                required
                name="productName"
                value={values.productName}
                onChange={(e) => setFieldValue('productName', e.target.value)}
                label="Product Name"
                placeholder="Enter Product Name"
                onBlur={handleBlur}
                isTouched={touched?.productName}
                errorMessage={errors?.productName}
                isValid={!errors?.productName}
              />
            </div>

            <div className="">
              <ATMSelect
                required
                name="categoryId"
                value={values.categoryId}
                onChange={(newValue) => {
                  setFieldValue('categoryId', newValue),
                    setFieldValue('subCategoryId', null);
                }}
                label="Category"
                placeholder="Select  Category"
                options={categoryData?.data}
                valueAccessKey="_id"
                onBlur={handleBlur}
                isValid={!errors?.categoryId}
                getOptionLabel={(option: any) => option?.categoryName}
                isLoading={categoryLoading}
              />
            </div>
            <div className="">
              <ATMSelect
                required
                options={subCategoryData}
                name="subCategoryId"
                value={values.subCategoryId}
                onChange={(newValue) =>
                  setFieldValue('subCategoryId', newValue)
                }
                label="Sub Category"
                placeholder="Select sub category"
                // isValid={!errors?.subCategoryId}
                getOptionLabel={(option) => option?.subCategoryName}
                valueAccessKey="_id"
                isLoading={subCategoryLoading}
              />
            </div>
            <div className="">
              <ATMSelect
                required
                name="brandId"
                value={values.brandId}
                onChange={(newValue) => setFieldValue('brandId', newValue)}
                label="Brand"
                placeholder="Select Brand"
                options={brandsData?.data}
                valueAccessKey="_id"
                onBlur={handleBlur}
                isValid={!errors?.brandId}
                getOptionLabel={(option: any) => option?.brandName}
                isLoading={brandsLoading}
              />
            </div>
            <div className="">
              <ATMSelect
                required
                isLoading={measurementLoading}
                name="measurementUnitId"
                value={values.measurementUnitId}
                onChange={(newValue) =>
                  setFieldValue('measurementUnitId', newValue)
                }
                label="Measurement Unit"
                placeholder="Select Measurement Unit"
                options={measurementData?.data}
                valueAccessKey="_id"
                onBlur={handleBlur}
                isValid={!errors?.measurementUnitId}
                getOptionLabel={(option: any) => option?.unitName}
                isDisabled={measurementLoading}
              />
            </div>
            <div className="">
              <ATMNumberField
                required
                name="purchasePrice"
                value={values.purchasePrice}
                onChange={(newValue) =>
                  setFieldValue('purchasePrice', newValue)
                }
                label="Product Purchase  Price"
                placeholder="Enter Product Purchase Price"
                onBlur={handleBlur}
                isTouched={touched?.purchasePrice}
                errorMessage={errors?.purchasePrice}
                isValid={!errors?.purchasePrice}
                isAllowDecimal
              />
            </div>
            <div className="">
              <ATMNumberField
                required
                name="mrp"
                value={values.mrp}
                onChange={(newValue) => setFieldValue('mrp', newValue)}
                label="Product MRP"
                placeholder="Enter Product MRP"
                onBlur={handleBlur}
                isTouched={touched?.mrp}
                errorMessage={errors?.mrp}
                isValid={!errors?.mrp}
                isAllowDecimal
              />
            </div>
            <div className="">
              <ATMNumberField
                required
                name="sellingPrice"
                value={values.sellingPrice}
                onChange={(newValue) => setFieldValue('sellingPrice', newValue)}
                label="Product Selling Price"
                placeholder="Enter Product Selling Price"
                onBlur={handleBlur}
                isTouched={touched?.sellingPrice}
                errorMessage={errors?.sellingPrice}
                isValid={!errors?.sellingPrice}
                isAllowDecimal
              />
            </div>
            <div className="">
              <ATMSelect
                name="tax"
                value={values?.tax}
                isLoading={taxLoading}
                onChange={(newValue) => setFieldValue('tax', newValue)}
                label="Tax"
                options={taxData?.data}
                getOptionLabel={(options) =>
                  ` ${options?.taxType} @ ${options?.taxPercent}`
                }
                valueAccessKey="_id"
                placeholder="Please Select Taxes"
              />
            </div>

            <div className="">
              <ATMTextField
                required
                name="productCode"
                value={values.productCode}
                onChange={(e) => setFieldValue('productCode', e.target.value)}
                label="Product Code"
                placeholder="Enter Product Code"
                onBlur={handleBlur}
                isTouched={touched?.productCode}
                errorMessage={errors?.productCode}
                isValid={!errors?.productCode}
              />
            </div>
            <div className="">
              <ATMTextField
                required
                name="barcode"
                value={values.barcode}
                onChange={(e) => setFieldValue('barcode', e.target.value)}
                label="Barcode"
                placeholder="Enter Barcode"
                onBlur={handleBlur}
                isTouched={touched?.barcode}
                errorMessage={errors?.barcode}
                isValid={!errors?.barcode}
              />
            </div>
            <div className="col-span-3">
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
            {/* Image  */}
            <div className="">
              <ATMFileUploader
                name="productImageUrl"
                value={values.productImageUrl}
                onChange={(file: string) => {
                  console.log('----file',file)
                  setFieldValue('productImageUrl', file);
                }}
                label="Product Image"
                accept=".jpg, .jpeg, .png, .gif"
                folderName="products"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFormLayout;
