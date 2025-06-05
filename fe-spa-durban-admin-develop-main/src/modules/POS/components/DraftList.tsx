import { format } from 'date-fns';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { useFetchData } from 'src/hooks/useFetchData';
import { CURRENCY } from 'src/utils/constants';
import {
  useDraftDeleteMutation,
  useGetDraftsQuery,
} from '../service/POSServices';
import { showToast } from 'src/utils/showToaster';
const tableHeaders: TableHeader<any>[] = [
  {
    fieldName: 'createdAt',
    headerName: 'Date',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
    renderCell: (row: any) => {
      return row?.createdAt ? (
        <div>
          <div className="text-xs ">
            {format(new Date(row?.createdAt), ' HH:mm a')}
          </div>
          <div className="text-sm font-semibold">
            {format(new Date(row?.createdAt), 'dd MMM yyyy')}
          </div>
        </div>
      ) : (
        '0'
      );
    },
  },
  {
    fieldName: 'customerName',
    headerName: 'Name',
    flex: 'flex-[1_1_0%]',
    stopPropagation: true,
    renderCell: (row: any) => {
      return row?.customerName || '-';
    },
  },
  {
    fieldName: 'totalAmount',
    headerName: 'Amount',
    flex: 'flex-[1_1_0%]',
    extraClasses: () => 'capitalize',
    renderCell: (row: any) => {
      return (
        (row?.totalAmount && (
          <div>
            {CURRENCY} {row?.totalAmount.toFixed(2)}
          </div>
        )) ||
        '-'
      );
    },
    stopPropagation: true,
  },
  {
    fieldName: 'items',
    headerName: 'Items',
    flex: 'flex-[1_1_0%]',
    extraClasses: () => 'capitalize',
    renderCell: (row: any) => {
      return (row?.items && <div>{row?.items?.length}</div>) || '-';
    },
    stopPropagation: true,
  },
];

type Props = {
  onClose: any;
  onEdit: (item: any) => void;
};
const DraftList = ({ onClose, onEdit }: Props) => {
  const { data, isLoading } = useFetchData(useGetDraftsQuery, {
    body: { isPaginationRequired: false },
  });
  const [deleteDraft] = useDraftDeleteMutation();
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteDraft(item?._id).then((res: any) => {
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
      <div className="relative w-3/5 p-4 bg-white rounded shadow-lg">
        <div className="flex flex-col h-[500px] gap-2">
          <div className="flex justify-between ">
            <ATMPageHeader heading="Drafts" hideButton={true} />
            <ATMButton onClick={onClose} extraClasses="w-fit" variant="text">
              Cancel
            </ATMButton>
          </div>

          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            <div className="flex-1 overflow-auto">
              <MOLTable<any>
                tableHeaders={tableHeaders}
                data={data as any[]}
                getKey={(item) => item?._id}
                onEdit={onEdit}
                isLoading={isLoading}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftList;
