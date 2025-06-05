import { FormikProps } from 'formik';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { InventoryFormValues } from '../models/Inventory.model';
import ATMQuantityWithUnit from 'src/components/atoms/FormElements/ATMQuantityWithUnit/ATMQuantityWithUnit';

type Props = {
  formikProps: FormikProps<InventoryFormValues>;
  onClose: () => void;
  formType: 'ADD' | 'EDIT';
};
const productOptions = [
  {
    label: 'Body Oil',
    value: 'BODY_OIL',
  },
  {
    label: 'Face Scrub',
    value: 'FACE_SCRUB',
  },
  {
    label: 'Lotion',
    value: 'LOTION',
  },
];
const InventoryFormLayout = ({ formikProps, onClose, formType }: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  const formHeading = formType === 'ADD' ? 'Add Inventory' : 'Edit Inventory';
  return (
    <MOLFormDialog
      title={formHeading}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      <div className="flex flex-col gap-4">
        {/*  product */}
        <div>
          <ATMSelect
            name="product"
            value={values.product}
            onChange={(newValue) => setFieldValue('product', newValue)}
            label="Product"
            options={productOptions}
            valueAccessKey="value"
          />
        </div>

        {/* Quantity */}
        <div className="">
          <ATMNumberField
            name="purchasePrice"
            value={values.purchasePrice}
            onChange={(newValue) => setFieldValue('purchasePrice', newValue)}
            label="Purchase Price"
            placeholder="Enter Purchase Price"
            onBlur={handleBlur}
            isTouched={touched?.purchasePrice}
            errorMessage={errors?.purchasePrice}
            isValid={!errors?.purchasePrice}
          />
        </div>
        {/* dewas Quantity */}
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs font-medium tracking-wide text-slate-500 ">
            {' '}
            Dewas
          </div>

          <div className="">
            <ATMQuantityWithUnit
              name="dewasQty"
              value={values.dewasQty}
              onChange={(newValue) => setFieldValue('dewasQty', newValue)}
              placeholder="Enter Quantity"
              onBlur={handleBlur}
              unitValue={values.quantityValue}
              onUnitChange={(newValue) =>
                setFieldValue('quantityValue', newValue)
              }
            />
          </div>
        </div>
        {/* Indore Quantity */}
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs font-medium tracking-wide text-slate-500 ">
            {' '}
            Indore
          </div>
          <div className="">
            <ATMQuantityWithUnit
              name="indoreQty"
              value={values.indoreQty}
              onChange={(newValue) => setFieldValue('indoreQty', newValue)}
              placeholder="Enter Quantity"
              onBlur={handleBlur}
              unitValue={values.quantityValue}
              onUnitChange={(newValue) =>
                setFieldValue('quantityValue', newValue)
              }
            />
          </div>
        </div>
        {/* bhopal Quantity */}
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs font-medium tracking-wide text-slate-500 ">
            {' '}
            Bhopal
          </div>
          <div className="">
            <ATMQuantityWithUnit
              name="bhopalQty"
              value={values.bhopalQty}
              onChange={(newValue) => setFieldValue('bhopalQty', newValue)}
              placeholder="Enter Quantity"
              onBlur={handleBlur}
              unitValue={values.quantityValue}
              onUnitChange={(newValue) =>
                setFieldValue('quantityValue', newValue)
              }
            />
          </div>
        </div>
      </div>
    </MOLFormDialog>
  );
};

export default InventoryFormLayout;
