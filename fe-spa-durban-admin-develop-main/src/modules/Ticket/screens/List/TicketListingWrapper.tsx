import React, { useState } from 'react';
import TicketListing from './TicketListing';
import { Ticket } from '../../models/Ticket.model';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
} from '../../slice/TicketSlice';
import AddTicketFormWrapper from '../Add/AddTicketFormWrapper';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useDeleteTicketMutation,
  useGetTicketsQuery,
} from '../../service/TicketServices';
import { showToast } from 'src/utils/showToaster';
import EditTicketFormWrapper from '../Edit/EditTicketFormWrapper';
import { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import { formatDate } from 'date-fns';
import { formatZonedDate } from 'src/utils/formatZonedDate';

type Props = {};

const tableHeaders: TableHeader<Ticket>[] = [
  {
    fieldName: 'name',
    headerName: 'Name',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
  },
  {
    fieldName: 'ticketType',
    headerName: 'Type',
    flex: 'flex-[1_0_0%]',
  },
  {
    fieldName: 'ticketTitle',
    headerName: 'Title',
    flex: 'flex-[1_0_0%]',
  },
  {
    fieldName: 'description',
    headerName: 'Description',
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
      return date ? formatZonedDate(date) : '-';
    },
  }
];

const TicketListingWrapper = (props: Props) => {
  const [ticketId, setTicketId] = useState('');
  const [deleteTicket] = useDeleteTicketMutation();
  const { outlets } = useSelector((state: RootState) => state.auth);
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.ticket,
  );
  const dispatch = useDispatch<AppDispatch>();

  const { searchQuery, limit, page, appliedFilters } = useFilterPagination([
    'outletId',
  ]);
  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetTicketsQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['ticketType']),
        filterBy: JSON.stringify(appliedFilters),
      },
    },
  );
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
  ];
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteTicket(item?._id).then((res: any) => {
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
      <TicketListing
        tableHeaders={tableHeaders}
        rowData={data as Ticket[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        onEdit={(item) => {
          dispatch(setIsOpenEditDialog(true)), setTicketId(item?._id);
        }}
        onDelete={handleDelete}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
        filter={filters}
      />

      {isOpenAddDialog && (
        <AddTicketFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )}
      {isOpenEditDialog && (
        <EditTicketFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          ticketId={ticketId}
        />
      )}
    </>
  );
};

export default TicketListingWrapper;
