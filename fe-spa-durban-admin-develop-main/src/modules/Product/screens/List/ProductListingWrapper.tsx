import { useNavigate } from 'react-router-dom';
import { FilterType } from 'src/components/molecules/MOLFilterBar/MOLFilterBar';
import { TableHeader } from 'src/components/molecules/MOLTable/MOLTable';
import { useFetchData } from 'src/hooks/useFetchData';
import { useFilterPagination } from 'src/hooks/useFilterPagination';
import { useGetCategoriesQuery } from 'src/modules/Category/service/CategoryServices';
import { useGetSubCategoriesQuery } from 'src/modules/SubCategory/service/SubCategoryServices';
import { showToast } from 'src/utils/showToaster';
import {
  useDeleteProductMutation,
  useGetProductsQuery,
  useProductStatusMutation,
} from '../../service/ProductServices';
import ProductListing from './ProductListing';
import { CURRENCY } from 'src/utils/constants';
import ATMSwitch from 'src/components/atoms/FormElements/ATMSwitch/ATMSwitch';
import ShowConfirmation from 'src/utils/ShowConfirmation';
import { format } from 'date-fns';

type Props = {};

const ProductListingWrapper = (props: Props) => {
  const navigate = useNavigate();
  const [status] = useProductStatusMutation();

  const { searchQuery, limit, page, appliedFilters } = useFilterPagination([
    'categoryId',
    'subCategoryId',
  ]);
  const [deleteProduct] = useDeleteProductMutation();
  const { data, isLoading, totalData, totalPages } = useFetchData(
    useGetProductsQuery,
    {
      body: {
        limit,
        page,
        searchValue: searchQuery,
        searchIn: JSON.stringify(['productCode', 'productName', 'barcode']),
        filterBy: JSON.stringify(appliedFilters),
      },
    },
  );
  const { data: categoryData } = useFetchData(useGetCategoriesQuery, {
    body: { isPaginationRequired: false },
  });
  const { data: subCategoryData } = useFetchData(useGetSubCategoriesQuery, {
    body: { isPaginationRequired: false },
  });
  const filters: FilterType[] = [
    {
      filterType: 'multi-select',
      label: 'Category',
      fieldName: 'categoryId',
      options:
        categoryData?.map((el) => {
          return {
            label: el?.categoryName,
            value: el?._id,
          };
        }) || [],
      renderOption: (option) => option.label,
      isOptionEqualToSearchValue: (option, value) => {
        return option?.label.includes(value);
      },
    },
    {
      filterType: 'multi-select',
      label: 'Sub Category',
      fieldName: 'subCategoryId',
      options:
        subCategoryData?.map((el) => {
          return {
            label: el?.subCategoryName,
            value: el?._id,
          };
        }) || [],
      renderOption: (option) => option.label,
      isOptionEqualToSearchValue: (option, value) => {
        return option?.label.includes(value);
      },
    },
  ];

  const tableHeaders: TableHeader<Product>[] = [
    {
      headerName: 'Product',
      flex: 'flex-[1_1_0%]',
      renderCell(item) {
        return (
          <div className="flex items-center gap-2">
            <div className="min-w-[30px] min-h-[30px]">
              <img
                className="w-full h-full rounded "
                src={`${process.env.REACT_APP_BASE_URL}/${item?.productImageUrl}` || 'no-image.jpg'}
                crossOrigin="anonymous"
                alt=""
              />
            </div>
            {item?.productName}
          </div>
        );
      },
    },
    {
      fieldName: 'productCode',
      headerName: 'Code',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'categoryName',
      headerName: 'Category',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'subCategoryName',
      headerName: 'Sub Category',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'brandName',
      headerName: 'Brand',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'unitName',
      headerName: 'Unit',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'mrp',
      headerName: 'MRP',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return (
          <div>
            {item?.mrp ? (
              <>
                {CURRENCY} {Number(item?.mrp).toFixed(2)}
              </>
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      fieldName: 'purchasePrice',
      headerName: 'Price',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return (
          <div>
            {item?.purchasePrice ? (
              <>
                {CURRENCY} {Number(item?.purchasePrice).toFixed(2)}
              </>
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      fieldName: 'sellingPrice',
      headerName: 'Selling  Price',
      flex: 'flex-[1_0_0%]',
      renderCell(item) {
        return (
          <div>
            {item?.sellingPrice ? (
              <>
                {CURRENCY} {Number(item?.sellingPrice).toFixed(2)}
              </>
            ) : (
              '-'
            )}
          </div>
        );
      },
    },

    {
      fieldName: 'barcode',
      headerName: 'Barcode',
      flex: 'flex-[1_0_0%]',
    },
    {
      fieldName: 'description',
      headerName: 'Description',
      flex: 'flex-[1_0_0%]',
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
    },
    {
      fieldName: 'status',
      headerName: 'Active',
      extraClasses: () => 'min-w-[100px]',
      flex: 'flex-[1_0_0%]',
      permissions: ['PRODUCT_ACTIVE_DEACTIVE'],
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

  const handleDelete = (item: any, closeDialog: () => void) => {
    deleteProduct(item?._id).then((res: any) => {
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
      <ProductListing
        tableHeaders={tableHeaders}
        rowData={data as Product[]}
        onAddNew={() => navigate('add')}
        onEdit={(item) => navigate(`edit/${item?._id}`)}
        onDelete={handleDelete}
        filterPaginationData={{
          totalCount: totalData,
          totalPages: totalPages,
        }}
        isLoading={isLoading}
        filters={filters}
      />
    </>
  );
};

export default ProductListingWrapper;
