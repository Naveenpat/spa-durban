import { IconPlus, IconTrash } from '@tabler/icons-react';
import { FieldArray, FormikProps } from 'formik';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import ATMFieldLabel from 'src/components/atoms/ATMFieldLabel/ATMFieldLabel';
import ATMFileUploader from 'src/components/atoms/FormElements/ATMFileUploader/ATMFileUploader';
import ATMMultiSelect from 'src/components/atoms/FormElements/ATMMultiSelect/ATMMultiSelect';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMQuantityWithUnit from 'src/components/atoms/FormElements/ATMQuantityWithUnit/ATMQuantityWithUnit';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetCategoriesQuery } from 'src/modules/Category/service/CategoryServices';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import { useGetProductsQuery } from 'src/modules/Product/service/ProductServices';
import { useGetSubCategoriesQuery } from 'src/modules/SubCategory/service/SubCategoryServices';
import { useGetTaxQuery } from 'src/modules/Tax/service/TaxServices';
import { ServiceFormValues } from '../models/Service.model';

type Props = {
  formikProps: FormikProps<ServiceFormValues>;
  onCancel: () => void;
  formType: 'ADD' | 'EDIT';
  isLoading?: boolean;
};

const ServiceFormLayout = ({
  formikProps,
  formType,
  onCancel,
  isLoading = false,
}: Props) => {
  const { values, setFieldValue, handleBlur, touched, errors, isSubmitting } =
    formikProps;

  const { data: categories, isLoading: isCategoriesLoading } = useFetchData(
    useGetCategoriesQuery,
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

  const { data: subCategories, isLoading: isSubCategoriesLoading } =
    useFetchData(useGetSubCategoriesQuery, {
      body: {
        isPaginationRequired: false,
        filterBy: JSON.stringify([
          {
            fieldName: 'isActive',
            value: true,
          },
          {
            fieldName: 'categoryId',
            value: values?.category?._id,
          },
        ]),
      },
    });

  // Outlets
  const { data: outlets, isLoading: isOutletsLoading } = useFetchData(
    useGetOutletsQuery,
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

  // Products
  const { data: products, isLoading: isProductsLoading } = useFetchData(
    useGetProductsQuery,
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

  // Taxes
  const { data: taxes, isLoading: isTaxesLoading } = useFetchData(
    useGetTaxQuery,
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

  const isLastProductFilled = () => {
    if (values?.products?.length === 0) {
      return true;
    }
    const lastProduct = values?.products?.[values.products.length - 1];
    return lastProduct && lastProduct.product && lastProduct.quantity;
  };
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
              {formType === 'ADD' ? 'Add' : 'Update'} Service
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
            {/*Service Name */}
            <div>
              <ATMTextField
                required
                name="serviceName"
                value={values.serviceName}
                onChange={(e) => setFieldValue('serviceName', e.target.value)}
                label="Service Name"
                placeholder="Enter Service Name"
                onBlur={handleBlur}
                isTouched={touched?.serviceName}
                errorMessage={errors?.serviceName}
                isValid={!errors?.serviceName}
              />
            </div>
            {/*Category */}
            <div>
              <ATMSelect
                required
                name="category"
                value={values.category}
                onChange={(newValue) => {
                  setFieldValue('category', newValue);
                  setFieldValue('subCategory', '');
                }}
                label="Category"
                placeholder="Select Category"
                options={categories}
                getOptionLabel={(option: any) => option?.categoryName}
                valueAccessKey="_id"
                onBlur={handleBlur}
                isValid={!errors?.category}
                isLoading={isCategoriesLoading}
              />
            </div>
            {/*Sub Category */}
            <div>
              <ATMSelect
                name="subCategory"
                value={values.subCategory}
                onChange={(newValue) => setFieldValue('subCategory', newValue)}
                label="Sub Category"
                placeholder="Select Sub Category"
                options={subCategories}
                valueAccessKey="_id"
                onBlur={handleBlur}
                isValid={!errors?.subCategory}
                getOptionLabel={(option: any) => option?.subCategoryName}
                isLoading={isSubCategoriesLoading}
              />
            </div>
            {/*Service code */}
            <div>
              <ATMTextField
                name="serviceCode"
                value={values.serviceCode}
                onChange={(e) => setFieldValue('serviceCode', e.target.value)}
                label="Service Code"
                placeholder="Enter Service Code"
                onBlur={handleBlur}
                isTouched={touched?.serviceCode}
                errorMessage={errors?.serviceCode}
                isValid={!errors?.serviceCode}
              />
            </div>
            {/*Sale Price */}
            <div>
              <ATMNumberField
                required
                name="sellingPrice"
                value={values.sellingPrice}
                onChange={(value) => setFieldValue('sellingPrice', value)}
                label="Selling Price"
                placeholder="Enter Seling Price"
                onBlur={handleBlur}
                isTouched={touched?.sellingPrice}
                errorMessage={errors?.sellingPrice}
                isValid={!errors?.sellingPrice}
                isAllowDecimal
              />
            </div>

            {/* Tax */}
            <div className="">
              <ATMSelect
                name="tax"
                value={values?.tax}
                onChange={(newValue) => setFieldValue('tax', newValue)}
                label="Tax"
                options={taxes}
                getOptionLabel={(options) =>
                  ` ${options?.taxType} @ ${options?.taxPercent}`
                }
                valueAccessKey="_id"
                placeholder="Please Select Taxes"
                isLoading={isTaxesLoading}
              />
            </div>
            <div className="col-span-1">
              <ATMNumberField
                required
                name="duration"
                value={values.duration}
                onChange={(value) => setFieldValue('duration', value)}
                label="Duration"
                placeholder="Enter Duration (number in mins)"
                onBlur={handleBlur}
                isTouched={touched?.duration}
                errorMessage={errors?.duration}
                isValid={!errors?.duration}
                // isAllowDecimal
              />
            </div>
            <div className="col-span-1">
              <ATMNumberField
                required
                name="cashback"
                value={values.cashback}
                onChange={(value) => setFieldValue('cashback', value)}
                label="Cashback in %"
                placeholder="Enter Cashback  (number in %)"
                onBlur={handleBlur}
                isTouched={touched?.cashback}
                errorMessage={errors?.cashback}
                isValid={!errors?.cashback}
                // isAllowDecimal
              />
            </div>
            {/*Outlet */}
            <div className="col-span-3 ">
              <ATMMultiSelect
                name="outlets"
                value={values.outlets}
                onChange={(newValue) => setFieldValue('outlets', newValue)}
                label="Outlets"
                placeholder="Select Outlets"
                options={outlets}
                onBlur={handleBlur}
                isValid={!errors?.outlets}
                getOptionLabel={(option: any) => option?.name}
                valueAccessKey="_id"
                isLoading={isOutletsLoading}
              />
            </div>

            {/*Description */}
            <div className="col-span-3">
              <ATMTextArea
                required
                name="description"
                value={values.description}
                onChange={(e) => setFieldValue('description', e.target.value)}
                label="Description"
                placeholder="Enter Description "
                onBlur={handleBlur}
                isTouched={touched?.description}
                errorMessage={errors?.description}
                isValid={!errors?.description}
              />
            </div>
            {/*terms and condition */}
            <div className="col-span-3">
              <ATMTextArea
                required
                name="termsAndConditions"
                value={values.termsAndConditions}
                onChange={(e) =>
                  setFieldValue('termsAndConditions', e.target.value)
                }
                label="Terms & Conditions"
                placeholder="Enter Terms & Conditions "
                onBlur={handleBlur}
                isTouched={touched?.termsAndConditions}
                errorMessage={errors?.termsAndConditions}
                isValid={!errors?.termsAndConditions}
              />
            </div>
            {/* Image  */}
            <div>
              <ATMFileUploader
                name="serviceImageUrl"
                value={values.serviceImageUrl}
                onChange={(file: string) => {
                  setFieldValue('serviceImageUrl', file);
                }}
                label="Image"
                accept=".jpg, .jpeg, .png, .gif"
              />
            </div>
            {/* Products */}
            <div className="col-span-3">
              <ATMFieldLabel>Products</ATMFieldLabel>
            </div>
            <div className="flex flex-col col-span-3 gap-4">
              <div className="flex items-center gap-4 p-2 text-xs font-medium text-white rounded-t bg-primary-40 ">
                <div className="flex-1">Product</div>
                <div className="flex-1">Quantity</div>
                <div className="flex-1">Supply Price</div>
                <div className="min-w-[25px] max-w-[25px]"></div>
              </div>
              <FieldArray
                name="products"
                render={(arrayHelpers) => (
                  <>
                    {values?.products?.length > 0 &&
                      values?.products?.map((product: any, index: any) => (
                        <div className="flex items-center gap-4 py-1">
                          <div className="flex-1">
                            <ATMSelect
                              name={`products[${index}].product`}
                              value={product.product}
                              onChange={(newValue) => {
                                setFieldValue(
                                  `products[${index}].product`,
                                  newValue,
                                );
                                setFieldValue(
                                  `products[${index}].quantity`,
                                  '',
                                );
                              }}
                              placeholder="Select Product"
                              options={products}
                              valueAccessKey="_id"
                              onBlur={() =>
                                handleBlur(`products[${index}].product`)
                              }
                              getOptionLabel={(option: any) =>
                                option.productName
                              }
                              isOptionDisabled={(option) => {
                                return (
                                  values?.products?.findIndex(
                                    (product: any) =>
                                      product?.product?._id === option._id,
                                  ) > -1
                                );
                              }}
                              isLoading={isProductsLoading}
                            />
                          </div>
                          <div className="flex-1">
                            <ATMQuantityWithUnit
                              name={`products[${index}].quantity`}
                              value={product.quantity}
                              onChange={(value) => {
                                setFieldValue(
                                  `products[${index}].quantity`,
                                  value,
                                );
                              }}
                              placeholder="Enter Quantity"
                              onBlur={() =>
                                handleBlur(`products[${index}].quantity`)
                              }
                              unitValue={product?.product?.unitCode}
                              disableValueChange
                            />
                          </div>
                          <div className="flex-1">
                            <ATMNumberField
                              name=""
                              value={`${Number(product?.quantity || '0') * Number(product?.product?.sellingPrice || '0')}`}
                              onChange={() => {}}
                              label=""
                              onBlur={handleBlur}
                              disabled
                            />
                          </div>
                          <div className="size-[40px]">
                            {values?.products?.length >= 0 && (
                              <button
                                type="button"
                                className="flex items-center justify-center w-full h-full rounded bg-error-90 text-error"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                <IconTrash className="size-[20px]" />
                              </button>
                            )}
                          </div>
                        </div>
                        // <div
                        //   className="grid items-end justify-between grid-cols-12 gap-4"
                        //   key={index}
                        // >
                        //   <div className="col-span-4">

                        //   </div>

                        //   <div className="col-span-4">

                        //   </div>
                        //   <div className="col-span-3">

                        //   </div>
                        //   <div className="col-span-1 text-end">
                        //
                        //   </div>
                        // </div>
                      ))}

                    <div
                      className={`flex items-center justify-center gap-1 p-3 border border-dashed rounded cursor-pointer bg-gray-50 ${
                        !isLastProductFilled()
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      onClick={() => {
                        if (isLastProductFilled()) {
                          arrayHelpers.push({
                            productId: '',
                            quantity: '',
                            unit: null,
                            price: 0,
                          });
                        }
                      }}
                    >
                      <IconPlus className="size-[0.75rem]" />
                      <span className="text-xs font-semibold">Add</span>
                    </div>
                  </>
                )}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceFormLayout;
