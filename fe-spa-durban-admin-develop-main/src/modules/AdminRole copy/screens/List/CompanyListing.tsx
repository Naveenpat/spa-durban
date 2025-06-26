import { IconPlus } from '@tabler/icons-react';
import { Company } from '../../models/Company.model';
import MOLTable, {
  TableHeader,
} from '../../../../components/molecules/MOLTable/MOLTable';
import ATMPageHeader from '../../../../components/atoms/ATMPageHeader/ATMPageHeader';
import Authorization from '../../../../components/Authorization/Authorization';
import MOLFilterBar from '../../../../components/molecules/MOLFilterBar/MOLFilterBar';
import { isAuthorized } from '../../../../utils/authorization';
import ATMPagination from '../../../../components/atoms/ATMPagination/ATMPagination';
import { Dispatch, SetStateAction } from 'react';

type Props = {
  onAddNew: () => void;
  rowData: Company[];
  onEdit: (item: any) => void;
  tableHeaders: TableHeader<Company>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  onDelete: (
    item: Company,
    closeDialog: () => void,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
  ) => void;
  isTableLoading: boolean;
};

const CompanyListing = ({
  onAddNew,
  tableHeaders,
  rowData,
  onEdit,
  filterPaginationData: { totalCount, totalPages },
  isTableLoading,
  onDelete
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Company"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('USER_ROLE_ADD')}
        />
        <Authorization permission="USER_ROLE_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar searchPlaceHolder='Search Company Name...'
            />

            <div className="flex-1 overflow-auto">
              <MOLTable<Company>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={isAuthorized('USER_ROLE_UPDATE') ? onEdit : undefined}
                onDelete={
                  isAuthorized('USER_ROLE_DELETE')
                    ? (item, closeDialog, setIsLoading) =>
                      onDelete(item, closeDialog, setIsLoading)
                    : undefined
                }
                isLoading={isTableLoading}
                noDataMessage={`We couldn't find any match for "Admin Roles"`}
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

export default CompanyListing;
