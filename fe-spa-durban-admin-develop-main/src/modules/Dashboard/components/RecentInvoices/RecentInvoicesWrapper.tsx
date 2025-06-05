import React from 'react';
import RecentInvoices from './RecentInvoices';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetRecentInvoicesQuery } from '../../service/DashboardServices';
import { CURRENCY } from 'src/utils/constants';

const tableHeaders: TableHeader<any>[] = [
  {
    fieldName: 'invoiceNumber',
    headerName: 'Invoice#',
    flex: 'flex-[1_0_0%]',
  },
  {
    fieldName: 'customerName',
    headerName: 'Customer',
    flex: 'flex-[1_0_0%]',
  },
  {
    fieldName: 'status',
    headerName: 'Status',
    flex: 'flex-[1_0_0%]',
    renderCell: (item) => {
      return (
        <div className=" max-w-fit">
          {!item?.balanceDue ? (
            <div className="px-3 text-[10px] text-white bg-green-500 rounded-lg">
              Paid
            </div>
          ) : (
            <div className="px-3 text-[10px] text-white bg-red-500 rounded-lg">
              UnPaid
            </div>
          )}
        </div>
      );
    },
  },
  {
    fieldName: 'amount',
    headerName: 'Amount',
    flex: 'flex-[1_0_0%]',
    renderCell: (item) => {
      return (
        <div className="flex flex-col text-xs font-semibold ">
          <div>
            {CURRENCY} {(item?.amountPaid).toFixed(2) || '-'}
          </div>
          <div className="text-[10px] font-medium text-red-500 ">
            {item?.balanceDue ? (
              <div>
                {CURRENCY} {(item?.balanceDue).toFixed(2)}
              </div>
            ) : null}
          </div>
        </div>
      );
    },
  },
];
const RecentInvoicesWrapper = () => {
  const { data, isLoading, refetch } = useFetchData(useGetRecentInvoicesQuery);
  return (
    <div>
      <RecentInvoices
        tableHeaders={tableHeaders}
        rowData={data as any[]}
        isLoading={isLoading}
        fetch={() => refetch()}
      />
    </div>
  );
};

export default RecentInvoicesWrapper;
