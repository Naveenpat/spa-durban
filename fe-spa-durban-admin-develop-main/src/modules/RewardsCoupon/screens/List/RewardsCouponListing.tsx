import { IconPlus } from '@tabler/icons-react';
import ATMPageHeader from 'src/components/atoms/ATMPageHeader/ATMPageHeader';
import ATMPagination from 'src/components/atoms/ATMPagination/ATMPagination';
import MOLFilterBar from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import MOLTable, {
  TableHeader,
} from 'src/components/molecules/MOLTable/MOLTable';
import { RewardsCoupon } from '../../models/RewardsCoupon.model';
import { useNavigate } from 'react-router-dom';
import Authorization from 'src/components/Authorization/Authorization';
import { isAuthorized } from 'src/utils/authorization';

type Props = {
  onAddNew: () => void;
  onEdit: (item: RewardsCoupon) => void;
  rowData: RewardsCoupon[];
  tableHeaders: TableHeader<RewardsCoupon>[];
  filterPaginationData: {
    totalCount: number;
    totalPages: number;
  };
  isLoading: boolean;
  onDelete: (item: RewardsCoupon, closeDialog: () => void) => void;
};

const RewardsCouponListing = ({
  onAddNew,
  onEdit,
  tableHeaders,
  rowData,
  filterPaginationData: { totalCount, totalPages },
  isLoading,
  onDelete,
}: Props) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col h-full gap-2 p-4">
        <ATMPageHeader
          heading="Rewards Coupon Program"
          buttonProps={{
            label: 'Add New',
            icon: IconPlus,
            onClick: () => navigate('/rewards-coupon/add'),
          }}
          hideButton={!isAuthorized('REWARDSCOUPON_ADD')}
        />
        <Authorization permission="REWARDSCOUPON_LIST">
          <div className="flex flex-col overflow-auto border rounded border-slate-300">
            {/* Table Toolbar */}
            <MOLFilterBar />

            <div className="flex-1 overflow-auto">
              <MOLTable<RewardsCoupon>
                tableHeaders={tableHeaders}
                data={rowData}
                getKey={(item) => item?._id}
                onEdit={
                  isAuthorized('REWARDSCOUPON_UPDATE') ? onEdit : undefined
                }
                isLoading={isLoading}
                onDelete={
                  isAuthorized('REWARDSCOUPON_DELETE') ? onDelete : undefined
                }
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

export default RewardsCouponListing;
