import React, { useState } from 'react';
import GiftCardListing from './GiftCardListing';
import { GiftCard } from '../../models/GiftCard.model';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import {
  setIsOpenAddDialog,
  setIsOpenEditDialog,
} from '../../slice/GiftCardSlice';
import AddGiftCardFormWrapper from '../Add/AddGiftCardFormWrapper';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useDeleteGiftCardMutation,
  useGetGiftCardsQuery,
  useGiftCardStatusMutation,
} from '../../service/GiftCardServices';
import { format } from 'date-fns';
import EditGiftCardFormWrapper from '../Edit/EditGiftCardFormWrapper';
import { showToast } from 'src/utils/showToaster';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { CURRENCY } from 'src/utils/constants';
import { formatZonedDate } from 'src/utils/formatZonedDate';

type Props = {};

const GiftCardListingWrapper = (props: Props) => {
  const [giftCardId, setGiftCardId] = useState('');

  const { searchQuery, limit, page } = useFilterPagination();

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetGiftCardsQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['giftCardName']),
      },
    },
  );
  const [deleteGiftCard] = useDeleteGiftCardMutation();
  const [status] = useGiftCardStatusMutation();
  const { isOpenAddDialog, isOpenEditDialog } = useSelector(
    (state: RootState) => state?.giftcard,
  );
  const dispatch = useDispatch<AppDispatch>();
  const handleStatusChanges = (
    item: any,
    closeDialog: () => void,
    setIsLoading: any,
  ) => {
    status(item?._id).then((res: any) => {
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
      setIsLoading(false);
    });
  };
  const tableHeaders: TableHeader<GiftCard>[] = [
    {
      fieldName: 'giftCardName',
      headerName: 'gift Card Code',
      flex: 'flex-[1_0_0%]',
    },
    // {
    //   fieldName: 'giftCardCode',
    //   headerName: 'code',
    //   flex: 'flex-[1_0_0%]',
    // },

    {
      fieldName: 'giftCardAmount',
      headerName: 'gift Card Amount',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return (
          <div>
            {CURRENCY} {Number(item?.giftCardAmount).toFixed(2) || '-'}
          </div>
        );
      },
    },
    {
      fieldName: 'giftCardExpiryDate',
      headerName: 'valid Date',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return (
          <div>{format(new Date(item?.giftCardExpiryDate), 'dd MMM yyyy')}</div>
        );
      },
    },
    {
      fieldName: 'customerName',
      headerName: 'customer Name',
      flex: 'flex-[1_1_0%]',
      renderCell(item) {
        return (
          <div>{item?.customerName ? item?.customerName : 'All Users'}</div>
        );
      },
    },
    {
      fieldName: 'createdAt',
      headerName: 'Date',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        // return <div>{format(new Date(item?.createdAt), 'dd MMM yyyy')}</div>;
        return <div>{formatZonedDate(item?.createdAt)}</div>;
      },
    },
    {
      fieldName: 'status',
      headerName: 'Active',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
      permissions: ['GIFT_CARD_ACTIVE_DEACTIVE'],
      renderCell(item) {
        return (
          <div className="">
            <ATMSwitch
              checked={item?.isActive}
              onChange={(checked) => {
                ShowConfirmation({
                  type: 'INFO',
                  confirmationText: 'Yes',
                  title: 'Are you sure ?',
                  message: 'You really  want to be change Status',
                  onConfirm: (closeDialog, setIsLoading) =>
                    handleStatusChanges(item, closeDialog, setIsLoading),
                });
              }}
              activeLabel="Yes"
              deactiveLabel="No"
            />
          </div>
        );
      },
    },
  ];
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteGiftCard(item?._id).then((res: any) => {
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
      <GiftCardListing
        tableHeaders={tableHeaders}
        rowData={data as GiftCard[]}
        onEdit={(item) => {
          dispatch(setIsOpenEditDialog(true)), setGiftCardId(item?._id);
        }}
        onDelete={handleDelete}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
      />

      {isOpenAddDialog && (
        <AddGiftCardFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )}
      {isOpenEditDialog && (
        <EditGiftCardFormWrapper
          onClose={() => dispatch(setIsOpenEditDialog(false))}
          giftCardId={giftCardId}
        />
      )}
    </>
  );
};

export default GiftCardListingWrapper;
