import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { SalesComparisonList } from '../../models/SalesComparison.model';
import Authorization from 'src/components/Authorization/Authorization';

type Props = {
  rowData: SalesComparisonList[];
  tableHeaders: TableHeader<SalesComparisonList>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  filter: any;
  isLoading: boolean;
};

const SalesComparisonListing = ({
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  filter,
  isLoading,
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader heading="Sales Comparisons" hideButton />
        <Authorization permission="SALES_COMPARISON_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar filters={filter} hideSearch />

            <div className="flex-1 overflow-auto">
              <MOLTable<SalesComparisonList>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                freezeFirstColumn
                isLoading={isLoading}
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

export default SalesComparisonListing;
