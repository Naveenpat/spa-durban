import { useNavigate } from 'react-router-dom';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { Outlet } from '../../models/Outlet.model';
import OutletListing from './OutletListing';
import {
  useDeleteOutletMutation,
  useGetOutletsQuery,
  useOutletStatusMutation,
} from '../../service/OutletServices';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import ShowConfirmation from 'src/utils/ShowConfirmation';

type Props = {};

const OutletListingWrapper = (props: Props) => {
  const navigate = useNavigate();

  const [deleteOutlet] = useDeleteOutletMutation();
  const [status] = useOutletStatusMutation();
  const { searchQuery, limit, page } = useFilterPagination();

  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetOutletsQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['name']),
      },
    },
  );
  const handleStatusChanges = (
    item: any,
    closeDialog: () => void,
    setIsLoading: any,
  ) => {
    status(item?._id).then((res: any) => {
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
      setIsLoading(false);
    });
  };
  const tableHeaders: TableHeader<Outlet>[] = [
    // {
    //   fieldName: 'companyLogo',
    //   headerName: 'Company Logo',
    //   highlight: true,
    //   flex: 'flex-[1_1_0%]',
    //   stopPropagation: true,
    //   renderCell(item) {
    //     return (
    //       <div className="w-[50px] h-[50px]">
    //         <img
    //           className="w-full h-full rounded-lg"
    //           src={item?.companyLogo}
    //           alt=""
    //         />
    //       </div>
    //     );
    //   },
    // },
    {
      fieldName: 'name',
      headerName: 'Name',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'phone',
      headerName: 'Phone',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'email',
      headerName: 'Email',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'address',
      headerName: 'Address',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'city',
      headerName: 'City',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'region',
      headerName: 'Region',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'country',
      headerName: 'Country',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'status',
      headerName: 'Active',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
      permissions: ['OUTLET_ACTIVE_DEACTIVE'],
      renderCell(item) {
        return (
          <div className="">
            <ATMSwitch
              checked={item?.isActive}
              onChange={(checked) => {
                ShowConfirmation({
                  type: 'INFO',
                  confirmationText: 'Yes',
                  title: 'Are you sure ?',
                  message: 'You really  want to be change Status',
                  onConfirm: (closeDialog, setIsLoading) =>
                    handleStatusChanges(item, closeDialog, setIsLoading),
                });
              }}
              activeLabel="Yes"
              deactiveLabel="No"
            />
          </div>
        );
      },
    },
  ];

  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteOutlet(item?._id).then((res: any) => {
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
      <OutletListing
        tableHeaders={tableHeaders}
        rowData={data as Outlet[]}
        onAddNew={() => navigate('/outlet/add')}
        onEdit={(item) => navigate(`/outlet/edit/${item?._id}`)}
        onDelete={handleDelete}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
      />
    </>
  );
};

export default OutletListingWrapper;
