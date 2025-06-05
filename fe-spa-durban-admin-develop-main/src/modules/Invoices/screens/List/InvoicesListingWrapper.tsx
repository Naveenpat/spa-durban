import React, { useEffect, useState } from 'react';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
// import ATMMenu from 'src/components/atoms/ATMMenu/ATMMenu';
// import { IconDotsVertical, IconDownload, IconEye } from '@tabler/icons-react';
import { Invoices } from '../../models/Invoices.model';
import InvoicesListing from './InvoicesListing';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useGetInvoicesQuery,
  useUpdateInvoiceMutation,
} from '../../service/InvoicesServices';
import { format } from 'date-fns';
import { CURRENCY } from 'src/utils/constants';
import { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from 'src/store';
import ATMMenu from 'src/components/atoms/ATMMenu/ATMMenu';
import {
  IconDotsVertical,
  IconPrinter,
  IconCreditCardRefund,
  IconCopyX,
} from '@tabler/icons-react';
import { useGetCustomersQuery } from 'src/modules/Customer/service/CustomerServices';
import {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
} from '../../slice/InvoicesSlice';
import EditCategoryFormWrapper from '../Edit/EditInvoiceVoidFormWrapper';

type Props = {};

const InvoicesListingWrapper = (props: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const { searchQuery, limit, page, dateFilter, appliedFilters } =
    useFilterPagination(['outletId', 'customerId']);
  const navigate = useNavigate();
  const location = useLocation();
  const { outlets } = useSelector((state: RootState) => state.auth);
  const { isOpenEditDialog } = useSelector(
    (state: RootState) => state?.invoices,
  );
  const { data: customerData, isLoading: customerLoading } = useFetchData(
    useGetCustomersQuery,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoiceId, setInvoiceId] = useState('');
  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetInvoicesQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['invoiceNumber']),
        dateFilter: JSON.stringify({
          dateFilterKey: 'createdAt',
          startDate: dateFilter?.start_date || format(new Date(), 'yyyy-MM-dd'),
          endDate: dateFilter?.end_date || format(new Date(), 'yyyy-MM-dd'),
        }),
        filterBy: JSON.stringify(appliedFilters),
      },
    },
  );
  const [updateInvoice] = useUpdateInvoiceMutation();
  const handleUpdate = async (_id: string) => {
    try {
      await updateInvoice({
        invoiceId: _id,
        body: { status: 'refund' },
      }).unwrap();
      alert('Invoice updated successfully!');
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Failed to update invoice.');
    }
  };
  const tableHeaders: TableHeader<Invoices>[] = [
    {
      fieldName: 'createdAt',
      headerName: 'Date',
      flex: 'flex-[1_1_0%]',
      renderCell: (item) =>
        item?.createdAt
          ? format(new Date(item?.createdAt), 'dd MMM yyyy')
          : '-',
    },
    {
      fieldName: 'invoiceNumber',
      headerName: 'invoice',
      flex: 'flex-[1_1_0%]',
    },
    {
      fieldName: 'customerName',
      headerName: 'Customer',
      flex: 'flex-[1_1_0%]',
    },

    {
      fieldName: 'totalAmount',
      headerName: 'Total',
      flex: 'flex-[1_1_0%]',
      renderCell: (item) => (
        <div>
          {' '}
          {CURRENCY}{' '}
          {item?.totalAmount ? Number(item?.totalAmount).toFixed(2) : '0'}
        </div>
      ),
    },
    {
      fieldName: 'status',
      headerName: 'Status',
      align: 'center',
      flex: 'flex-[1_1_0%]',
      renderCell: (item) => (
        <div>
          {item.status && item.status.trim() !== '' ? (
            <span className="text-red-700 bg-red-100 py-[3px] font-medium px-2 rounded-lg border-slate-300">
              {item.status}
            </span>
          ) : item?.balanceDue > 0 ? (
            <span className="text-yellow-700 bg-yellow-100 py-[3px] font-medium px-2 rounded-lg border-slate-300">
              Unpaid
            </span>
          ) : (
            <span className="text-green-700 bg-green-100 py-[3px] font-medium px-2 rounded-lg border-slate-300">
              Paid
            </span>
          )}
        </div>
      ),
    },
    {
      fieldName: 'action',
      headerName: 'Action',
      flex: 'flex-[1_1_0%]',
      renderCell: (item: Invoices) => (
        <div>
          <ATMMenu
            children={<IconDotsVertical />}
            items={[
              {
                label: 'View',
                icon: IconPrinter,
                onClick: () => {
                  navigate(`/invoice/receipt/${item?._id}`, {
                    state: { from: location },
                  });
                },
              },
              {
                label: 'Refund',
                icon: IconCreditCardRefund,
                onClick: () => {
                  handleUpdate(item?._id);
                },
              },
              {
                label: 'Void',
                icon: IconCopyX,
                onClick: () => {
                  dispatch(setIsOpenEditDialog(true));
                  setInvoiceId(item?._id);
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const filters: FilterType[] = [
    {
      filterType: 'multi-select',
      label: 'Outlet',
      fieldName: 'outletId',
      options:
        outlets?.map((el: any) => {
          return {
            label: el?.name,
            value: el?._id,
          };
        }) || [],
      renderOption: (option) => option.label,
      isOptionEqualToSearchValue: (option, value) => {
        return option?.label.includes(value);
      },
    },
    {
      filterType: 'multi-select',
      label: 'Customer',
      fieldName: 'customerId',
      options:
        customerData?.map((el: any) => {
          return {
            label: el?.customerName,
            value: el?._id,
          };
        }) || [],
      renderOption: (option) => option.label,
      isOptionEqualToSearchValue: (option, value) => {
        return option?.label.includes(value);
      },
    },
    {
      filterType: 'date',
      fieldName: 'createdAt',
      dateFilterKeyOptions: [
        {
          label: 'startDate',
          value: dateFilter?.start_date || '',
        },
        {
          label: 'endDate',
          value: dateFilter?.end_date || '',
        },
      ],
    },
  ];

  useEffect(() => {
    if (!dateFilter?.start_date && !dateFilter?.end_date) {
      const newSearchParams = new URLSearchParams(searchParams); // Clone existing searchParams
      newSearchParams.set('startDate', format(new Date(), 'yyyy-MM-dd') || '');
      newSearchParams.set('endDate', format(new Date(), 'yyyy-MM-dd') || '');
      const existingOutlets = newSearchParams.getAll('outletId');
      const newOutletIds = outlets?.map((item) => item?._id) || [];
      if (JSON.stringify(existingOutlets) !== JSON.stringify(newOutletIds)) {
        newSearchParams.delete('outletId'); // Remove existing outletId params
        newOutletIds.forEach((id) => {
          newSearchParams.append('outletId', id); // Append new outlet IDs
        });
        setSearchParams(newSearchParams);
      }
    }
  }, [dateFilter, outlets]);

  return (
    <>
      <InvoicesListing
        tableHeaders={tableHeaders}
        isLoading={isLoading}
        filter={filters}
        rowData={data as Invoices[]}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
      />
      {isOpenEditDialog && (
        <EditCategoryFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          invoiceId={invoiceId}
        />
      )}
    </>
  );
};

export default InvoicesListingWrapper;
