import { useNavigate } from 'react-router-dom';
import { Company } from '../../models/Company.model';
import CompanyListing from './CompanyListing';
import { TableHeader } from '../../../../components/molecules/MOLTable/MOLTable';
import { useFilterPagination } from '../../../../hooks/useFilterPagination';
import { useFetchData } from '../../../../hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';
import { useDeleteCompanyMutation, useGetCompaniesQuery } from '../../service/CompanyServices';
import { format } from 'date-fns';

type Props = {
  CompanyId?: string;
};

const tableHeaders: TableHeader<Company>[] = [
  {
    fieldName: 'companyName',
    headerName: 'Company Name',
    flex: 'flex-[1_1_0%]',
    extraClasses: () => 'capitalize',
    stopPropagation: true,
  },
  {
    fieldName: 'email',
    headerName: 'Email',
    flex: 'flex-[1_1_0%]',
    extraClasses: () => 'lowercase',
    stopPropagation: true,
  },
  {
    fieldName: 'phone',
    headerName: 'Phone',
    flex: 'flex-[1_1_0%]',
    extraClasses: () => '',
    stopPropagation: true,
  },
  {
    fieldName: 'logo',
    headerName: 'Logo',
    flex: 'flex-[0.5_1_0%]',
    render: (row: any) => (
      <img
        src={row.logo || '/images/default-logo.png'}
        onError={(e) => (e.currentTarget.src = '/images/default-logo.png')}
        alt="Logo"
        className="h-12 w-12 object-contain rounded-full border"
      />
    ),
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
      return date ? format(date, 'dd-MM-yyyy') : '-';
    },
  }
];




const CompanyListingWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { searchQuery, page, limit } = useFilterPagination();
  const [deleteRole] = useDeleteCompanyMutation();

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetCompaniesQuery,
    {
      body: {
        searchValue: searchQuery,
        limit,
        page,
        searchIn: JSON.stringify(['companyName']),
      }
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
      <CompanyListing
        tableHeaders={tableHeaders}
        rowData={data as any[]}
        onAddNew={() => navigate('/company/add-company')}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        onEdit={(item) => navigate(`/company/edit/${item?._id}`)}
        isTableLoading={isLoading}
        onDelete={handleDelete}
      />
    </>
  );
};
export default CompanyListingWrapper;
