import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { Coupon } from '../../models/Coupon.model';
import Authorization from 'src/components/Authorization/Authorization';
import { isAuthorized } from 'src/utils/authorization';

type Props = {
  onAddNew: () => void;
  onEdit: (item: Coupon) => void;
  onDelete: (item: Coupon, closeDialog: () => void) => void;
  rowData: Coupon[];
  tableHeaders: TableHeader<Coupon>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isLoading: boolean;
};

const CouponListing = ({
  onAddNew,
  onEdit,
  onDelete,
  isLoading = false,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
}: Props) => {
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Coupons"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: onAddNew,
          }}
          hideButton={!isAuthorized('COUPONS_REFERRAL_ADD')}
        />
        <Authorization permission="COUPONS_REFERRAL_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<Coupon>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={
                  isAuthorized('COUPONS_REFERRAL_UPDATE') ? onEdit : undefined
                }
                onDelete={
                  isAuthorized('COUPONS_REFERRAL_DELETE') ? onDelete : undefined
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

export default CouponListing;
