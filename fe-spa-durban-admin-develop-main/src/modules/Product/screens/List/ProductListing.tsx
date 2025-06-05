import { IconPlus } from '@tabler/icons-react';
import Authorization from 'src/components/Authorization/Authorization';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { isAuthorized } from 'src/utils/authorization';

type Props = {
  onAddNew: () => void;
  rowData: Product[];
  tableHeaders: TableHeader<Product>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  onEdit: (item: Product) => void;
  onDelete: (item: Product, closeDialog: () => void) => void;
  isLoading: boolean;
  filters: any;
};

const ProductListing = ({
  onEdit,
  onDelete,
  onAddNew,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isLoading = false,
  filters,
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Products"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('PRODUCT_ADD')}
        />
        <Authorization permission="PRODUCT_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar filters={filters} />

            <div className="flex-1 overflow-auto">
              <MOLTable<Product>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={isAuthorized('PRODUCT_UPDATE') ? onEdit : undefined}
                onDelete={isAuthorized('PRODUCT_DELETE') ? onDelete : undefined}
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

export default ProductListing;
