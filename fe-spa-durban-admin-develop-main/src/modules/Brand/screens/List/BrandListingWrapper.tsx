import React, { useState } from 'react';
import BrandListing from './BrandListing';
import { Brand } from '../../models/Brand.model';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
} from '../../slice/BrandSlice';
import AddBrandFormWrapper from '../Add/AddBrandFormWrapper';
import EditBrandFormWrapper from '../Edit/EditBrandFormWrapper';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useDeleteBrandMutation,
  useGetBrandsQuery,
} from '../../service/BrandServices';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { showToast } from 'src/utils/showToaster';
import { format } from 'date-fns';
import { formatZonedDate } from 'src/utils/formatZonedDate';

type Props = {};

const tableHeaders: TableHeader<Brand>[] = [
  {
    fieldName: 'brandName',
    headerName: 'Name',
    highlight: true,
    flex: 'flex-[1_1_0%]',
  },
  {
    fieldName: 'description',
    headerName: 'Description',
    flex: 'flex-[1_1_0%]',
    renderCell: (brand) => brand?.description || '-',
  },
  {
    fieldName: 'createdAt',
    headerName: 'Date',
    flex: 'flex-[1_1_0%]',
    extraClasses: () => '',
    stopPropagation: true,
    render: (row: any) => {
      const date = row.createdAt ? new Date(row.createdAt) : null;
      // return date ? format(date, 'dd-MM-yyyy') : '-';
      return date ? formatZonedDate(date) : '-';
    },
  }
];

const BrandListingWrapper = (props: Props) => {
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.brand,
  );
  const dispatch = useDispatch<AppDispatch>();

  const [selectedBrandId, setSelectedBrandId] = useState('');

  const { searchQuery, limit, page } = useFilterPagination();

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetBrandsQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['brandName']),
      },
    },
  );

  const [deleteBrand] = useDeleteBrandMutation();

  const handleDelete = (brand: Brand, closeDialog: () => void) => {
    deleteBrand(brand?._id).then((res: any) => {
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
      <BrandListing
        tableHeaders={tableHeaders}
        rowData={data as Brand[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        onEdit={(brand) => {
          dispatch(setIsOpenEditDialog(true));
          setSelectedBrandId(brand?._id);
        }}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {isOpenAddDialog && (
        <AddBrandFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )}
      {isOpenEditDialog && (
        <EditBrandFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          selectedBrandId={selectedBrandId}
        />
      )}
    </>
  );
};

export default BrandListingWrapper;
