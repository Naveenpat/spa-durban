import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { Brand } from '../../models/Brand.model';
import Authorization from 'src/components/Authorization/Authorization';
import { isAuthorized } from 'src/utils/authorization';

type Props = {
  onAddNew: () => void;
  onEdit: (item: Brand) => void;
  onDelete: (item: Brand, closeDialog: () => void) => void;
  rowData: Brand[];
  tableHeaders: TableHeader<Brand>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isLoading: boolean;
};

const BrandListing = ({
  onAddNew,
  onEdit,
  onDelete,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isLoading = true,
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Brand"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('BRAND_ADD')}
        />
        <Authorization permission="BRAND_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<Brand>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={isAuthorized('BRAND_UPDATE') ? onEdit : undefined}
                isLoading={isLoading}
                onDelete={isAuthorized('BRAND_DELETE') ? onDelete : undefined}
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

export default BrandListing;
