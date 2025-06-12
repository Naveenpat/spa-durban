import React, { useState } from 'react';
import TaxListing from './TaxListing';
import { Tax } from '../../models/Tax.model';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import { setIsOpenAddDialog, setIsOpenEditDialog } from '../../slice/TaxSlice';
import AddTaxFormWrapper from '../Add/AddTaxFormWrapper';
import EditTaxFormWrapper from '../Edit/EditTaxFormWrapper';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useDeleteTaxMutation,
  useGetTaxQuery,
} from '../../service/TaxServices';
import { showToast } from 'src/utils/showToaster';
import { format } from 'date-fns';

type Props = {};

const tableHeaders: TableHeader<Tax>[] = [
  {
    fieldName: 'taxType',
    headerName: 'Tax Type',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
  },
  {
    fieldName: 'taxPercent',
    headerName: 'Tax Percent (%)',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
  },
  {
    fieldName: 'createdAt',
    headerName: 'Date',
    flex: 'flex-[1_1_0%]',
    extraClasses: () => '',
    stopPropagation: true,
    render: (row: any) => {
      const date = row.createdAt ? new Date(row.createdAt) : null;
      return date ? format(date, 'dd-MM-yyyy') : '-';
    },
  }
];

const TaxListingWrapper = (props: Props) => {
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.tax,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [taxId, setTaxId] = useState('');
  const { page, limit, searchQuery } = useFilterPagination();
  const [deleteTax] = useDeleteTaxMutation();
  const { data, isLoading, totalPages, totalData } = useFetchData(
    useGetTaxQuery,
    {
      body: {
        searchValue: searchQuery,
        page,
        limit,
        searchIn: JSON.stringify(['taxType']),
      },
    },
  );
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteTax(item?._id).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          closeDialog();
        } else {
          showToast('error', res?.data?.message);
        }
      }
    });
  };
  return (
    <>
      <TaxListing
        tableHeaders={tableHeaders}
        rowData={data as any[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        onEdit={(item) => {
          dispatch(setIsOpenEditDialog(true));
          setTaxId(item?._id);
        }}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isTableLoading={isLoading}
        onDelete={handleDelete}
      />

      {isOpenAddDialog && (
        <AddTaxFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )}
      {isOpenEditDialog && (
        <EditTaxFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          taxId={taxId}
        />
      )}
    </>
  );
};

export default TaxListingWrapper;
