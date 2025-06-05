import React, { useState } from 'react';
import CategoryListing from './CategoryListing';
import { Category } from '../../models/Category.model';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
} from '../../slice/CategorySlice';
import AddCategoryFormWrapper from '../Add/AddCategoryFormWrapper';
import EditCategoryFormWrapper from '../Edit/EditCategoryFormWrapper';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from '../../service/CategoryServices';
import { useSearchParams } from 'react-router-dom';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { showToast } from 'src/utils/showToaster';

type Props = {};

const tableHeaders: TableHeader<Category>[] = [
  {
    fieldName: 'categoryName',
    headerName: 'Name',
    extraClasses: () => 'max-w-[200px]',
  },
  {
    fieldName: 'description',
    headerName: 'Description',
    flex: 'flex-[1_1_0%]',
    renderCell(item) {
      return <div title={item?.description}>{item?.description}</div>;
    },
  },
  // {
  //   fieldName: 'totalProducts',
  //   headerName: 'total Products',
  //   extraClasses: () => 'max-w-[200px]',

  // },
  // {
  //   fieldName: 'stockQuantity',
  //   headerName: 'stock Quantity',
  //   extraClasses: () => 'max-w-[200px]',
  // },
  // {
  //   fieldName: 'worth',
  //   headerName: 'Worth(Sales/Stock)',
  //   extraClasses: () => 'max-w-[200px]',
  // },
];

const CategoryListingWrapper = (props: Props) => {
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.category,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [categoryId, setCategoryId] = useState('');

  const { searchQuery, limit, page } = useFilterPagination();

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetCategoriesQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['categoryName']),
      },
    },
  );
  const [deleteCategory] = useDeleteCategoryMutation();
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteCategory(item?._id).then((res: any) => {
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
      <CategoryListing
        tableHeaders={tableHeaders}
        rowData={data as Category[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        onDelete={handleDelete}
        onEdit={(category) => {
          dispatch(setIsOpenEditDialog(true));
          setCategoryId(category?._id);
        }}
        isLoading={isLoading}
      />

      {isOpenAddDialog && (
        <AddCategoryFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )}
      {isOpenEditDialog && (
        <EditCategoryFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          categoryId={categoryId}
        />
      )}
    </>
  );
};

export default CategoryListingWrapper;
