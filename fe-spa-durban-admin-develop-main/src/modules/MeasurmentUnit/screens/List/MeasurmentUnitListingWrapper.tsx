import React, { useState } from 'react';
import MeasurmentUnitListing from './MeasurmentUnitListing';
import { MeasurmentUnit } from '../../models/MeasurmentUnit.model';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
} from '../../slice/MeasurmentUnitSlice';
import AddMeasurmentUnitFormWrapper from '../Add/AddMeasurmentUnitFormWrapper';
import EditMeasurmentUnitFormWrapper from '../Edit/EditMeasurmentUnitFormWrapper';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useDeleteMeasurementUnitMutation,
  useGetMeasurementUnitsQuery,
} from '../../service/MeasurmentUnitServices';
import { showToast } from 'src/utils/showToaster';
import { format } from 'date-fns';
import { formatZonedDate } from 'src/utils/formatZonedDate';

type Props = {};

const tableHeaders: TableHeader<MeasurmentUnit>[] = [
  {
    fieldName: 'unitName',
    headerName: 'Unit Name',

    sortKey: 'name',
    highlight: true,
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
  },
  {
    fieldName: 'unitCode',
    headerName: 'Code',

    sortKey: 'code',
    flex: 'flex-[1_0_0%]',
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

const MeasurmentUnitListingWrapper = (props: Props) => {
  const [measurementUnitId, setMeasurementUnitId] = useState('');
  const { searchQuery, limit, page } = useFilterPagination();
  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetMeasurementUnitsQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['unitName']),
      },
    },
  );
  const [deleteMeasurementUnit] = useDeleteMeasurementUnitMutation();
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.measurmentunit,
  );
  const dispatch = useDispatch<AppDispatch>();
  const handleDelete = (
    measurementUnit: MeasurmentUnit,
    closeDialog: () => void,
  ) => {
    deleteMeasurementUnit(measurementUnit?._id).then((res: any) => {
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
      <MeasurmentUnitListing
        tableHeaders={tableHeaders}
        rowData={data as MeasurmentUnit[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        onEdit={(item) => {
          dispatch(setIsOpenEditDialog(true));
          setMeasurementUnitId(item?._id);
        }}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      {isOpenAddDialog && (
        <AddMeasurmentUnitFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )}
      {isOpenEditDialog && (
        <EditMeasurmentUnitFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          measurementUnitId={measurementUnitId}
        />
      )}
    </>
  );
};

export default MeasurmentUnitListingWrapper;
