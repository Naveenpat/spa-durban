import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { trasactionListingType } from '../../models/UserProfile.model';

type Props = {
  rowData: trasactionListingType[];
  tableHeaders: TableHeader<trasactionListingType>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
};

const TransactionsListing = ({
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader heading="Transactions" hideButton />
        <div className="flex flex-col overflow-auto border rounded border-slate-300">
          {/* Table Toolbar */}
          <MOLFilterBar />

          <div className="flex-1 overflow-auto">
            <MOLTable<trasactionListingType>
              tableHeaders={tableHeaders}
              data={rowData}
              getKey={(item) => item?.date}
            />
          </div>

          {/* Pagination */}
          <ATMPagination
            totalPages={totalPages}
            rowCount={totalCount}
            rows={rowData}
          />
        </div>
      </div>
    </>
  );
};

export default TransactionsListing;
