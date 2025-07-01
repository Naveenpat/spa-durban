import { FormikProps } from 'formik';
import ATMAppHeader from 'src/components/atoms/ATMAppHeader/ATMAppHeader';
import CartSummarySection from './components/CartSummarySection';
import ItemList from './components/ItemList';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetRegisterByCurrentDateQuery } from '../OpenRegister/service/OpenRegisterServices';

type Props = {
  formikProps: FormikProps<any>;
};

const POS = ({ formikProps }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const treatments = searchParams.getAll('treatments');
  const prevTreatmentsRef = useRef<string[]>([]);
  const { outlet } = useSelector((state: RootState) => state.auth);

  const { data:closeRegisterData, isLoading, refetch } = useFetchData(useGetRegisterByCurrentDateQuery, {
    body: outlet && (outlet as any)._id,
    dataType: 'VIEW',
  });

  const { values, setFieldValue } = formikProps;
  useEffect(() => {
    setFieldValue('items', []);
  }, [outlet]);

  const handleChangeQuantity = (
    itemId: string,
    type: 'INCREMENT' | 'DECREMENT',
  ) => {
    let newCartItems: any[];
    switch (type) {
      case 'INCREMENT':
        newCartItems = values?.items?.map((item: any) => {
          if (item?._id === itemId) {
            return {
              ...item,
              quantity: item.quantity + 1,
            };
          } else {
            return item;
          }
        });

        break;

      case 'DECREMENT':
        newCartItems = values?.items?.map((item: any) => {
          if (item?._id === itemId && item.quantity > 1) {
            return {
              ...item,
              quantity: item.quantity - 1,
            };
          } else {
            return item;
          }
        });

        break;
    }
    setFieldValue('items', newCartItems);
  };
  // console.log('values=========POS', values?.amountReceived);

  return (
    <div className="flex flex-col w-screen h-screen">
      {/* Header */}
      <div>
        <ATMAppHeader
          hideCollapseMenuButton
          showOutletDropdown
          showRegisterbutton
        />
      </div>

      {/* Main Section */}
      <div className="flex  flex-1">
        {/* Items List */}
        <div className="flex flex-col flex-1 h-full border-r">
          <ItemList
          isDisabled={!!(closeRegisterData as any)?.data?.closeRegister}
            onItemClick={(item) => {
              const itemIndex = values?.items?.findIndex(
                (selected: any) => selected._id === item._id,
              );
              let newCartItems: any[] = [...values?.items];
              if (itemIndex > -1) {
                newCartItems[itemIndex].quantity += 1;
              } else {
                newCartItems.push({
                  ...item,
                  quantity: 1,
                  sellingPrice: item.sellingPrice ?? 0,
                });
              }
              setFieldValue('items', newCartItems);
            }}
            onAllItemsProcessed={(items) => setFieldValue('items', items)}
          />
        </div>

        {/* Summary and Cart */}
        <div className="flex-1 h-full ">
          <CartSummarySection
            cartItems={values?.items}
            onRemove={(itemId) =>
              setFieldValue(
                'items',
                values?.items?.filter((item: any) => item?._id !== itemId),
              )
            }
            onQuantityChange={handleChangeQuantity}
            formikProps={formikProps}
            isDisabled={!!(closeRegisterData as any)?.data?.closeRegister}
          />
        </div>
      </div>
    </div>
  );
};

export default POS;
