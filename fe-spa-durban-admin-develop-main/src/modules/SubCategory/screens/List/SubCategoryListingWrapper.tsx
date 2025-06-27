import React, { useState } from 'react';
import SubCategoryListing from './SubCategoryListing';
import { SubCategory } from '../../models/SubCategory.model';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
} from '../../slice/SubCategorySlice';
import AddSubCategoryFormWrapper from '../Add/AddSubCategoryFormWrapper';
import EditSubCategoryFormWrapper from '../Edit/EditSubCategoryFormWrapper';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useDeleteSubCategoryMutation,
  useGetSubCategoriesQuery,
} from '../../service/SubCategoryServices';
import { showToast } from 'src/utils/showToaster';
import { format } from 'date-fns';
import { formatZonedDate } from 'src/utils/formatZonedDate';

type Props = {};

const tableHeaders: TableHeader<SubCategory>[] = [
  {
    fieldName: 'categoryName',
    headerName: 'Name',
    flex: 'flex-[1_1_0%]',
  },
  {
    fieldName: 'subCategoryName',
    headerName: 'sub Category',
    flex: 'flex-[1_0_0%]',
  },
  {
    fieldName: 'description',
    headerName: 'description',
    flex: 'flex-[1_0_0%]',
    renderCell(item) {
      return <div title={item?.description}>{item?.description}</div>;
    },
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

const SubCategoryListingWrapper = (props: Props) => {
  const [subCategoryId, setSubCategoryId] = useState('');

  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.subcategory,
  );
  const dispatch = useDispatch<AppDispatch>();
  const { searchQuery, limit, page } = useFilterPagination();

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetSubCategoriesQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['subCategoryName']),
      },
    },
  );
  const [deleteSubCategory] = useDeleteSubCategoryMutation();
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteSubCategory(item?._id).then((res: any) => {
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
      <SubCategoryListing
        tableHeaders={tableHeaders}
        rowData={data as SubCategory[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        onEdit={(item) => {
          dispatch(setIsOpenEditDialog(true));
          setSubCategoryId(item?._id);
        }}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
      {isOpenAddDialog && (
        <AddSubCategoryFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )}
      {isOpenEditDialog && (
        <EditSubCategoryFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          subCategoryId={subCategoryId}
        />
      )}
    </>
  );
};

export default SubCategoryListingWrapper;
