import { useNavigate } from 'react-router-dom';
import { AdminRole } from '../../models/AdminRole.model';
import AdminRoleListing from './AdminRoleListing';
import {
  useDeleteRoleMutation,
  useGetAdminRolesQuery,
} from '../../service/AdminRoleServices';
import { TableHeader } from '../../../../components/molecules/MOLTable/MOLTable';
import { useFilterPagination } from '../../../../hooks/useFilterPagination';
import { useFetchData } from '../../../../hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';
import { format } from 'date-fns';
import { formatZonedDate } from 'src/utils/formatZonedDate';

type Props = {
  adminRoleId?: string;
};

const tableHeaders: TableHeader<AdminRole>[] = [
  {
    fieldName: 'roleName',
    headerName: 'Role Name',
    flex: 'flex-[1_1_0%]',
    extraClasses: () => 'capitalize',
    stopPropagation: true,
  },
  {
    fieldName: 'createdAt',
    headerName: 'Date',
    flex: 'flex-[1_1_0%]',
    extraClasses: () => '',
    stopPropagation: true,
    render: (row: any) => {
      const date = row.createdAt ? new Date(row.createdAt) : null;
      // return date ? format(date, 'dd-MM-yyyy') : '-';
      return date ? formatZonedDate(date) : '-';
    },
  }
];

const AdminRoleListingWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { searchQuery, page, limit } = useFilterPagination();
  const [deleteRole] = useDeleteRoleMutation();

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetAdminRolesQuery,
    {
      body: {
        searchValue: searchQuery,
        limit,
        page,
        searchIn: JSON.stringify(['roleName']),
      },
    },
  );
  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteRole(item?._id).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          closeDialog();
        } else {
          showToast('error', res?.data?.message);
        }
      }
    });
  };
  return (
    <>
      <AdminRoleListing
        tableHeaders={tableHeaders}
        rowData={data as any[]}
        onAddNew={() => navigate('/admin-role/add-admin-role')}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        onEdit={(item) => navigate(`/admin-role/edit/${item?._id}`)}
        isTableLoading={isLoading}
        onDelete={handleDelete}
      />
    </>
  );
};
export default AdminRoleListingWrapper;
