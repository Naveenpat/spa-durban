import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { PaymentStatus, PurchaseOrder } from '../../models/PurchaseOrder.model';
import { useGetPurchaseOrdersQuery } from '../../service/PurchaseOrderServices';
import PurchaseOrderListing from './PurchaseOrderListing';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import { IconCreditCardPay, IconInfoCircle } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import PaymentInFormWrapper from '../../components/PaymentIn/PaymentInFormWrapper';
import { setIsOpenAddDialog } from '../../slice/PurchaseOrderSlice';
import { useState } from 'react';
import { CURRENCY } from 'src/utils/constants';
import ATMTooltip from 'src/components/atoms/ATMToolTip/ATMToolTip';

type Props = {};

const RenderPaymentStatus = ({ orderData }: { orderData: PurchaseOrder }) => {
  const { paymentStatus } = orderData;
  const getClasses = () => {
    switch (paymentStatus) {
      case 'COMPLETED':
        return 'text-green-700 bg-green-100';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100';

      default:
        break;
    }
  };

  return (
    <div>
      <div
        className={`px-2 py-1 w-fit rounded-full font-medium text-xs ${getClasses()}`}
      >
        {PaymentStatus[paymentStatus]}
      </div>
    </div>
  );
};

const PurchaseOrderListingWrapper = (props: Props) => {
  const [paymentInData, setPaymentInData] = useState({});
  const navigate = useNavigate();
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.purchaseorder,
  );
  const dispatch = useDispatch<AppDispatch>();
  const tableHeaders: TableHeader<PurchaseOrder>[] = [
    {
      fieldName: 'orderDate',
      headerName: 'Order Date',
      flex: 'flex-[1_1_0%]',
      renderCell: (item) => format(new Date(item?.orderDate), 'dd MMM yyyy'),
    },
    {
      fieldName: 'invoiceNumber',
      headerName: 'Invoice No.',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'supplierName',
      headerName: 'Supplier',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'payableAmount',
      headerName: 'Amount',
      flex: 'flex-[1_0_0%]',
      renderCell: (item) => {
        const totalPayableAmount =
          item?.payableAmount +
          item?.shippingCharges +
          item?.totalTax -
          item?.totalDiscount;

        return (
          <div className="flex items-center gap-2">
            <div>{totalPayableAmount.toFixed(2)}</div>
          </div>
        );
      },
    },
    {
      fieldName: 'dueAmount',
      headerName: 'Due Amount',
      flex: 'flex-[1_0_0%]',
      stopPropagation: true,
      renderCell: (item) => {
        const dueAmount =
          item?.payableAmount +
          item?.shippingCharges +
          item?.totalTax -
          item?.totalDiscount -
          item?.amountPaid;

        return (
          <div className="flex items-center gap-2">
            {dueAmount ? (
              <div className="text-red-500">
                {CURRENCY} {dueAmount.toFixed(2)}
              </div>
            ) : (
              '0.00'
            )}
            {item?.paymentStatus === 'PENDING' ? (
              <div
                className="invisible p-1.5 text-xs underline rounded-full text-primary group-hover:visible hover:bg-primary-95 cursor-pointer"
                title="Make Payment"
                onClick={() => {
                  dispatch(setIsOpenAddDialog(true));
                  setPaymentInData(item);
                }}
              >
                <IconCreditCardPay size={18} />
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      fieldName: 'paymentStatus',
      headerName: 'Payment Status',
      flex: 'flex-[1_0_0%]',
      stopPropagation: true,
      renderCell: (item) => <RenderPaymentStatus orderData={item} />,
    },
    {
      headerName: 'Action',
      flex: 'flex-[1_0_0%]',
      stopPropagation: true,
      renderCell: (item) => {
        return item?.isInventoryIn ? null : (
          <div className="text-xs w-fit">
            <ATMButton
              onClick={() => navigate(`/productform/${item?._id}`)}
              size="small"
            >
              Inventory
            </ATMButton>
          </div>
        );
      },
    },
  ];

  const { limit, page, searchQuery } = useFilterPagination();

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetPurchaseOrdersQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['invoiceNumber']),
      },
    },
  );

  return (
    <>
      <PurchaseOrderListing
        tableHeaders={tableHeaders}
        rowData={data as PurchaseOrder[]}
        onAddNew={() => navigate('/purchase-order/add')}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isTableLoading={isLoading}
      />

      {isOpenAddDialog && (
        <PaymentInFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
          paymentInData={paymentInData}
        />
      )}
    </>
  );
};

export default PurchaseOrderListingWrapper;
