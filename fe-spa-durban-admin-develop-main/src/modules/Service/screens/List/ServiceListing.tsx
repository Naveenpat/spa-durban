import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { Service } from '../../models/Service.model';
import { isAuthorized } from 'src/utils/authorization';
import Authorization from 'src/components/Authorization/Authorization';

type Props = {
  onAddNew: () => void;
  rowData: Service[];
  tableHeaders: TableHeader<Service>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  onEdit: (serviceId: string) => void;
  isTableLoading: boolean;
  filters: any;
};

const ServiceListing = ({
  onAddNew,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  onEdit,
  isTableLoading = true,
  filters,
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Services"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('SERVICE_ADD')}
        />
        <Authorization permission="SERVICE_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar filters={filters} />

            <div className="flex-1 overflow-auto">
              <MOLTable<Service>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={
                  isAuthorized('SERVICE_UPDATE')
                    ? (item) => onEdit(item?._id)
                    : undefined
                }
                isLoading={isTableLoading}
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

export default ServiceListing;
