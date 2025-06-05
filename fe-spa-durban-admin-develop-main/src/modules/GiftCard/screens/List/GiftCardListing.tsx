import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { GiftCard } from '../../models/GiftCard.model';
import { isAuthorized } from 'src/utils/authorization';
import Authorization from 'src/components/Authorization/Authorization';

type Props = {
  onEdit: (item: GiftCard) => void;
  onDelete: (item: GiftCard, closeDialog: () => void) => void;
  onAddNew: () => void;
  rowData: GiftCard[];
  tableHeaders: TableHeader<GiftCard>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isLoading: boolean;
};

const GiftCardListing = ({
  onEdit,
  onDelete,
  onAddNew,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isLoading = false,
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Gift Card"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('GIFT_CARD_ADD')}
        />
        <Authorization permission="GIFT_CARD_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<GiftCard>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={isAuthorized('GIFT_CARD_UPDATE') ? onEdit : undefined}
                onDelete={
                  isAuthorized('GIFT_CARD_DELETE') ? onDelete : undefined
                }
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

export default GiftCardListing;
