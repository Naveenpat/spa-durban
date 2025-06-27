import { useDispatch } from 'react-redux';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { AppDispatch } from 'src/store';
import { CashBack } from '../../models/CashBack.model';
import { setIsOpenAddDialog } from '../../slice/CashBackSlice';
import CashBackListing from './CashBackListing';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useGetCashBacksQuery,
  useCashBackStatusMutation,
  useDeleteCashBackMutation,
} from '../../service/CashBackServices';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import { useNavigate, useParams } from 'react-router-dom';
import { showToast } from 'src/utils/showToaster';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { format, parse } from 'date-fns';
type Props = {};

const CashBackListingWrapper = (props: Props) => {
  const navigate = useNavigate();
  const [status] = useCashBackStatusMutation();
  const dispatch = useDispatch<AppDispatch>();
  const { searchQuery, limit, page } = useFilterPagination();
  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetCashBacksQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['cashBackRulesName']),
      },
    },
  );
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

  const formatTo12Hour = (time: string) => {
    try {
      const parsed = parse(time, 'HH:mm', new Date());
      return format(parsed, 'hh:mm a'); // e.g., 01:30 PM
    } catch (error) {
      return time;
    }
  };

  const tableHeaders: TableHeader<CashBack>[] = [
    {
      fieldName: 'cashBackRulesName',
      headerName: 'Title',
      sortKey: 'serialNumber',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'howMuchCashback',
      headerName: 'How Much Cash back',
      // sortKey: 'serialNumber',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return <div>{item?.howMuchCashback}X</div>;
      },
    },
    {
      fieldName: 'cashBackDate',
      headerName: 'Start Date',
      // sortKey: 'serialNumber',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return <div>{item?.cashBackDate ? format(new Date(item.cashBackDate), 'dd/MM/yyyy') : '--'}</div>;
      },
    },
    {
      fieldName: 'cashBackEndDate',
      headerName: 'End Date',
      // sortKey: 'serialNumber',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return <div>{item?.cashBackEndDate ? format(new Date(item.cashBackEndDate), 'dd/MM/yyyy') : '--'}</div>;
      },
    },
    {
      fieldName: 'activeDays',
      headerName: 'Active Days',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return (
          <div>
            {item?.activeDays?.length > 0
              ? item.activeDays.join(', ') // e.g., "Monday, Wednesday"
              : '--'}
          </div>
        );
      },
    },
    {
      fieldName: 'timing',
      headerName: 'Timing',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        const start = item?.startTime ? formatTo12Hour(item.startTime) : '--';
        const end = item?.endTime ? formatTo12Hour(item.endTime) : '--';
        return <div>{`${start} - ${end}`}</div>;
      },
    }
    ,
    {
      fieldName: 'status',
      headerName: 'status',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
      permissions: ['CASHBACK_ACTIVE_DEACTIVE'],
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
  const [deleteCashBack] = useDeleteCashBackMutation();
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteCashBack(item?._id).then((res: any) => {
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
      <CashBackListing
        tableHeaders={tableHeaders}
        rowData={data as CashBack[]}
        onAddNew={() => dispatch(setIsOpenAddDialog(true))}
        onEdit={(item) => navigate(`/cashback/edit/${item?._id}`)}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      {/* {isOpenAddDialog && (
        <AddCashBackFormWrapper
          onClose={() => dispatch(setIsOpenAddDialog(false))}
        />
      )} */}
    </>
  );
};

export default CashBackListingWrapper;
