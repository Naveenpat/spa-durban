import { IconPlus, IconTrash } from '@tabler/icons-react';
import { FieldArray, FormikProps } from 'formik';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';

type Props = {
  formikProps: FormikProps<any>;
  onCancel: () => void;
  isLoading?: boolean;
  data: any;
};

const InventoryForm = ({
  formikProps,
  onCancel,
  isLoading = false,
  data,
}: Props) => {
  const { values, setFieldValue, isSubmitting } = formikProps;
  const { data: outletData, isLoading: outletLoading } = useFetchData(
    useGetOutletsQuery,
    {},
  );

  const isLastOutletFilled = (productIndex: number) => {
    const inventories = values?.products?.[productIndex]?.inventories;
    if (!inventories || inventories.length === 0) {
      return true;
    }
    const lastInventory = inventories[inventories.length - 1];
    return !!(lastInventory && lastInventory.outlet && lastInventory.quantity);
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
            <div className="font-semibold ">Inventory</div>
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
                  isLoading={isLoading}
                  children="Submit"
                />
              </div>
            </div>
          </div>
          <div className="border-t"></div>
          <div className="w-[70%] m-auto grid items-end grid-cols-9 gap-4 text-xs border-b  pb-2 ">
            <div className="col-span-2"> Product Name </div>
            <div>Quantity</div>
            <div className="flex flex-1 col-span-6 gap-4">
              <div className="flex-1">Outlet</div>
              <div className="flex-1">Outlet Qty.</div>
              <div className="w-12"></div>
            </div>
          </div>

          <div className="w-[70%] m-auto flex flex-col  divide-y ">
            {values?.products?.map((product: any, ind: number) => (
              <div className="grid grid-cols-9 gap-4 py-4 " key={ind}>
                <div className="col-span-2 text-sm font-semibold capitalize">
                  {product?.product?.productName}
                </div>
                <div className="text-sm font-semibold capitalize ">
                  {product?.product?.quantity}
                </div>
                {/* FieldArray For Inventory */}
                <div className="grid grid-cols-6 col-span-6">
                  <FieldArray name={`products[${ind}].inventories`}>
                    {({ insert, remove, push }) => (
                      <div className="flex flex-col col-span-6 gap-4 ">
                        {product?.inventories?.length > 0 &&
                          product?.inventories?.map(
                            (inventoryItem: any, index: number) => (
                              <div key={index} className="flex flex-1 gap-4">
                                <div className="flex-1">
                                  <ATMSelect
                                    name={`products[${ind}].inventories[${index}].outlet`}
                                    value={inventoryItem.outlet}
                                    onChange={(newValue) =>
                                      setFieldValue(
                                        `products[${ind}].inventories[${index}].outlet`,
                                        newValue,
                                      )
                                    }
                                    label=""
                                    options={outletData}
                                    valueAccessKey="_id"
                                    placeholder="Please select Outlet"
                                    getOptionLabel={(options) => options?.name}
                                    isLoading={outletLoading}
                                    isOptionDisabled={(option) => {
                                      return values?.products[
                                        ind
                                      ]?.inventories?.some(
                                        (inv: any) =>
                                          inv.outlet?._id === option._id,
                                      );
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <ATMNumberField
                                    name={`products[${ind}].inventories[${index}].quantity`}
                                    value={inventoryItem.quantity}
                                    onChange={(newValue) =>
                                      setFieldValue(
                                        `products[${ind}].inventories[${index}].quantity`,
                                        newValue,
                                      )
                                    }
                                    label=""
                                    placeholder="Enter Quantity"
                                  />
                                </div>
                                <div className="">
                                  <ATMButton
                                    type="button"
                                    onClick={() => remove(index)}
                                    variant="text"
                                    extraClasses="text-red-500 w-fit"
                                  >
                                    <IconTrash />
                                  </ATMButton>
                                </div>
                              </div>
                            ),
                          )}

                        <div
                          className={` col-span-6 flex items-center justify-center gap-1 h-[41px] border border-dashed rounded-lg cursor-pointer bg-gray-50 ${
                            !isLastOutletFilled(ind)
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          onClick={() => {
                            if (isLastOutletFilled(ind)) {
                              push({ outlet: null, quantity: '' });
                            }
                          }}
                        >
                          <IconPlus className="size-[0.75rem]" />
                          <span className="text-xs font-semibold">
                            Add Outlet
                          </span>
                        </div>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryForm;
