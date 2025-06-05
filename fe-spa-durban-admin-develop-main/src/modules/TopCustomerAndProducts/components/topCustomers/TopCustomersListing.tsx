import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { TopCustomerAndProducts } from '../../models/TopCustomerAndProducts.model';

type Props = {
  rowData: TopCustomerAndProducts[];
  tableHeaders: TableHeader<TopCustomerAndProducts>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  filter: any;
  isLoading: boolean;
};

const TopCustomersListing = ({
  tableHeaders,
  rowData,
  filter,
  isLoading,
  filterPaginationData: { totalCount, totalPages },
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-[700px] overflow-auto border rounded border-slate-300">
        <div className="py-2 text-xl font-semibold text-center text-white bg-primary-60">
          Top Customer
        </div>
        {/* Table Toolbar */}
        <MOLFilterBar hideSearch filters={filter} prefixer="top_customer" />

        <div className="flex-1 h-full overflow-auto">
          <MOLTable<TopCustomerAndProducts>
            tableHeaders={tableHeaders}
            data={rowData}
            getKey={(item) => item?._id}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination */}
        {/* <ATMPagination
          totalPages={totalPages}
          rowCount={totalCount}
          rows={rowData}
          prefixer="top_customer"
        /> */}
      </div>
    </>
  );
};

export default TopCustomersListing;
