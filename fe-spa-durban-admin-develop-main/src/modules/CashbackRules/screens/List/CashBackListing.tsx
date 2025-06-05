import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { CashBack } from '../../models/CashBack.model';
import { useNavigate } from 'react-router-dom';
import Authorization from 'src/components/Authorization/Authorization';
import { isAuthorized } from 'src/utils/authorization';

type Props = {
  onAddNew: () => void;
  onEdit: (item: CashBack) => void;
  rowData: CashBack[];
  tableHeaders: TableHeader<CashBack>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isLoading: boolean;
  onDelete: (item: CashBack, closeDialog: () => void) => void;
};

const CashBackListing = ({
  onAddNew,
  onEdit,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isLoading,
  onDelete,
}: Props) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Cash Back Program"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: () => navigate('/cashback/add'),
          }}
          hideButton={!isAuthorized('CASHBACK_ADD')}
        />
        <Authorization permission="CASHBACK_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<CashBack>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={isAuthorized('CASHBACK_UPDATE') ? onEdit : undefined}
                isLoading={isLoading}
                onDelete={
                  isAuthorized('CASHBACK_DELETE') ? onDelete : undefined
                }
              />
            </div>

            {/* Pagination */}
            <ATMPagination
              totalPages={totalPages}
              rowCount={totalCount}
              rows={rowData}
            />
          </div>
        </Authorization>
      </div>
    </>
  );
};

export default CashBackListing;
