import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { Ticket } from '../../models/Ticket.model';
import { isAuthorized } from 'src/utils/authorization';
import Authorization from 'src/components/Authorization/Authorization';

type Props = {
  onAddNew: () => void;
  onEdit: (item: Ticket) => void;
  onDelete: (item: Ticket, closeDialog: () => void) => void;
  rowData: Ticket[];
  tableHeaders: TableHeader<Ticket>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isLoading: boolean;
  filter: any;
};

const TicketListing = ({
  onAddNew,
  onEdit,
  onDelete,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isLoading = false,
  filter,
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Tickets"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('TICKET_ADD')}
        />
        <Authorization permission="TICKET_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar filters={filter} />

            <div className="flex-1 overflow-auto">
              <MOLTable<Ticket>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={isAuthorized('TICKET_UPDATE') ? onEdit : undefined}
                onDelete={isAuthorized('TICKET_DELETE') ? onDelete : undefined}
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

export default TicketListing;
