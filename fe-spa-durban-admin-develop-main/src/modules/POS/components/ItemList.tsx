import { IconX, IconPlus, IconMinus, IconPencil, IconPin } from '@tabler/icons-react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ATMSearchBox from 'src/components/atoms/ATMSearchBox/ATMSearchBox';
import ATMBarcodeField from 'src/components/atoms/FormElements/ATMBarcodeField/ATMBarcodeField';
import ATMCheckbox from 'src/components/atoms/FormElements/ATMCheckbox/ATMCheckbox';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetCategoriesQuery } from 'src/modules/Category/service/CategoryServices';
import {
  useGetItemsQuery,
  useGetProductByBarcodeMutation,
} from 'src/modules/Product/service/ProductServices';
import { RootState } from 'src/store';
import { CURRENCY } from 'src/utils/constants';
import ItemLoadingCard, { CategoryLoading } from './ItemLoadingCard';
import NoItemFound from './NoItemFound';
import { useUpdateServiceMutation, useUpdateServiceToTopMutation } from '../../Service/service/ServiceServices';
import { useSearchParams } from 'react-router-dom';
import { showToast } from 'src/utils/showToaster';
import { IconPlusEqual } from '@tabler/icons-react';
import { IconLoader2 } from '@tabler/icons-react';
import { IconChevronDown } from '@tabler/icons-react';
import { IconPinFilled } from '@tabler/icons-react';
import ProductCard from './productCard';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMDialog from 'src/components/atoms/ATMDialog/ATMDialog';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMMultiSelect from 'src/components/atoms/FormElements/ATMMultiSelect/ATMMultiSelect';

type Props = {
  onItemClick: (item: any) => void;
  onAllItemsProcessed: (item: any) => void;
  isDisabled: boolean;
};

interface SelectedService {
  _id: string;
  itemName: string;
  sellingPrice: number;
}

const ItemList = ({ onItemClick, onAllItemsProcessed, isDisabled }: Props) => {
  const [updateService] = useUpdateServiceToTopMutation();
  const [updateServiceOne] = useUpdateServiceMutation()
  const [searchParams, setSearchParams] = useSearchParams();
  const treatments = searchParams.getAll('treatments');
  const prevTreatmentsRef = useRef<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isSearch, setIsSearch] = useState(true);
  const [barcodeValue, setBarcodeValue] = useState('');
  const { outlet } = useSelector((state: RootState) => state.auth);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [openEditServiceModal, setEditServiceModal] = useState(false);
  const [serviceId, setServiceId] = useState<string>("");
  const [serviceName, setServiceName] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<number>(0);


  const handleEditService = (service: SelectedService) => {
    setServiceId(service._id);
    setServiceName(service.itemName);
    setSellingPrice(service.sellingPrice);
  };


  const handleCheckboxChange = (_id: string) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(_id)
        ? prevSelected.filter((name) => name !== _id)
        : [...prevSelected, _id],
    );
  };
  const navigate = useNavigate();
  const [getProductDetails, { isLoading: isGettingProducts, isUninitialized }] =
    useGetProductByBarcodeMutation();

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [showAction, setShowAction] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  // const { data, isLoading, refetch, isFetching } = useFetchData(useGetItemsQuery, {
  //   body: {
  //     page: page,            // <-- Add this
  //     limit: 15,
  //     searchValue: searchValue,
  //     filterBy: JSON.stringify([
  //       {
  //         fieldName: 'categoryId',
  //         value: selectedCategories,
  //       },
  //     ]),
  //     outletId: (outlet as any)?._id,
  //   },
  //   options: {
  //     skip: !isSearch,
  //   },
  // });

  const { data, isLoading, refetch, isFetching } = useFetchData(
    useGetItemsQuery,
    {
      body: useMemo(() => {
        const filters: any[] = [];

        if (selectedCategories?.length > 0) {
          filters.push({
            fieldName: "categoryIds",
            value: selectedCategories.map((cat:any) => cat._id),
          });
        }

        // agar searchValue empty hai to filter me add mat karo
        // if (searchValue?.trim()) {
        //   filters.push({
        //     fieldName: "search",
        //     value: searchValue.trim(),
        //   });
        // }

        return {
          page,
          limit: 15,
          searchValue: searchValue?.trim() || "", // empty ho to bhi bhej do
          filterBy: JSON.stringify(filters),
          outletId: (outlet as any)?._id,
        };
      }, [page, searchValue, selectedCategories, outlet]),

      options: {
        skip: !isSearch, // sirf jab search on ho
      },
    }
  );

  useEffect(() => {
    if (!searchValue?.trim()) {
      refetch();
    }
  }, [searchValue, refetch]);


  // console.log('---------data', data)
  const { data: categoryData, isLoading: categoryLoading } = useFetchData(
    useGetCategoriesQuery,
    {
      body: { isPaginationRequired: false },
    },
  );

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (page > 1 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [items]);

  useEffect(() => {
    if (page === 1) {
      setItems((data as any)?.data ?? []);
    } else {
      setItems((prev) => [...prev, ...(data as any)?.data ?? []]);
    }
  }, [data]);

  useEffect(() => {
    setPage(1);
    setItems([]);
    // refetch(); // re-trigger API when searchValue changes
  }, [searchValue]);


  const handleAction = (product: any) => {
    addToTop(product, product?.pinned ? 'remove' : 'add');
    setShowAction(false); // switch back to pencil
  };

  useEffect(() => {
    if (items && items?.length > 0) {
      const prevTreatments = JSON.stringify(prevTreatmentsRef.current);
      const newTreatments = JSON.stringify(treatments);

      if (prevTreatments !== newTreatments) {
        if (treatments?.length > 0) {
          const matchedObjects = items
            .filter((item) => treatments.includes(item.bookingTreatmentsId))
            .map((item) => ({
              ...item,
              quantity: 1,
              sellingPrice: item.sellingPrice ?? 0,
            }));

          setSelectedItems(matchedObjects);
        }

        prevTreatmentsRef.current = treatments;
      }
    }
  }, [treatments, items]);
  useEffect(() => {
    if (selectedItems.length > 0) {
      onAllItemsProcessed(selectedItems); // Call function when array is updated
    }
  }, [selectedItems]);
  function addToTop(product: any, type: string) {
    updateService({ serviceId: product?._id, body: { type } }).then(
      (res: any) => {
        if (res?.error) {
          // showToast('error', res?.error?.data?.message);
        } else {
          if (res?.data?.status) {
            // showToast('success', res?.data?.message);
            refetch();
          } else {
            // showToast('error', res?.data?.message);
          }
        }
      },
    );
  }

  const categoryOptions = [
    { _id: "", categoryName: "Select Category" },
    ...(categoryData ?? []).map(item => ({
      ...item,
      categoryName: item.categoryName
        ? item.categoryName.charAt(0).toUpperCase() + item.categoryName.slice(1)
        : ""
    }))
  ];


  const handleEditServicess = () => {
    const formattedValues = {
      serviceName: serviceName,
      sellingPrice: sellingPrice
    }

    updateServiceOne({ serviceId, body: formattedValues })
      .then((res: any) => {
        setEditServiceModal(false);
        if (res?.error) {

        } else {
          if (res?.data?.status) {
            refetch();

          }
        }
      })
  };


  return (
    <div className={`flex flex-col w-full h-full gap-2 p-4 overflow-auto ${isDisabled ? 'pointer-events-none opacity-30' : ''}`}>
      {/* Search Box */}
     
      <div className="flex flex-col md:flex-row gap-2">
         {isDisabled && (
        <div className="absolute mt-10 inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center text-red-600 font-bold text-lg">
          Register Closed
        </div>
      )}
        <div className="w-full md:w-1/2">
          <ATMSearchBox
            value={searchValue}
            onChange={(e) => {
              if (e.target?.value) {
                setIsSearch(false);
              } else {
                setIsSearch(true);
              }
              setSearchValue(e?.target?.value);
            }}
            placeholder="Search product or service"
            onClear={() => {
              setSearchValue('');
            }}
            autoFocused
            onFocus={() => setBarcodeValue('')}
            onKeyUp={(e) => {
              // if (e.key === 'Enter') {
              setIsSearch(true);
              // }
            }}
          />
        </div>
        <div className="w-full md:w-1/2">
          {/* <ATMSelect
            options={categoryOptions}
            value={selectedCategories}
            onChange={(newValue) => {
              if (!newValue || !newValue._id) {
                // Agar "Select Category" option choose hua
                setSelectedCategories([]);
              } else {
                setSelectedCategories(newValue._id);
              }
            }}

            valueAccessKey="_id"
            getOptionLabel={(option: any) => option?.categoryName}
            placeholder="Please Select Category"
            isClearable={false}
            isSearchable={true}
            filterEnabled={true}
          /> */}

          <ATMMultiSelect
            name="categoryIds"
            value={selectedCategories} // should be an array of selected objects
            onChange={(newValues) => {
              if (!newValues) {
                setSelectedCategories([]); // nothing selected
              } else {
                setSelectedCategories(newValues); // array of selected objects
              }
            }}
            label=""
            placeholder="Select Category"
            options={categoryOptions}
            getOptionLabel={(option: any) => option?.categoryName}
            valueAccessKey="_id"
          />

        </div>
        {/* <div>
          <div
            onClick={() => navigate('/dashboard')}
            className="h-[40px] px-2 bg-red-500 text-white  rounded-md flex items-center cursor-pointer text-xs gap-1"
          >
            <IconX size={15} /> Close
          </div>
        </div> */}
      </div>

      {/* Categories Chips */}
      {/* <div className="flex flex-wrap w-full gap-2">
        {dummyData?.categories?.map((category) => {
          const isSelected = selectedCategoryIds?.includes(category?._id);
          return (
            <button
              className={`px-2 py-1 text-xs border rounded transition-all duration-300 font-medium ${
                isSelected
                  ? "bg-primary-container text-primary-onContainer border-primary-container"
                  : "text-slate-700"
              }`}
              key={category?._id}
              type="button"
              onClick={() => {
                let newSelected: string[];
                if (isSelected) {
                  newSelected = selectedCategoryIds?.filter(
                    (selected) => selected !== category?._id
                  );
                } else {
                  newSelected = [...selectedCategoryIds, category?._id];
                }

                setSelectedCategoryIds(newSelected);
              }}
            >
              {category?.categoryName}
            </button>
          );
        })}
      </div> */}

      <div className="grid h-full  gap-4">
        {/* Category Filter */}
        {/* <div className="h-full col-span-1 py-4 border-r ">
          <div className="pb-1 text-sm font-semibold border-b">Category</div>
          {categoryLoading ? (
            <CategoryLoading />
          ) : (
            <div className="flex flex-col gap-2 py-2 capitalize">
              {categoryData?.map((category: any, index: number) => {
                return (
                  <div key={index}>
                    <ATMCheckbox
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => handleCheckboxChange(category._id)}
                      size="small"
                      label={category.categoryName}
                      // disabled={isPreviewed}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div> */}
        {/* List */}
        <div
          className="flex flex-wrap col-span-4 gap-4 py-4 h-fit"
          style={{
            height: '76vh', //'787px',
            overflow: 'auto',
            scrollbarWidth: 'none',
            justifyContent: 'start'
          }}

        >
          {isLoading ? (
            Array(15)
              ?.fill(null)
              ?.map((_, index) => <ItemLoadingCard key={index} />)
          ) : items?.length === 0 ? (
            <NoItemFound />
          ) : (
            items?.map((product, index) => {
              const matchedCategories = categoryData?.filter((cat) =>
                product.categoryIds?.includes(cat._id)
              );

              // Agar ek hi category image dikhani hai to first le lo
              const categoryImageUrl = matchedCategories?.[0]?.categoryImageUrl || null;
              return (
                <ProductCard key={index} product={product} categoryImageUrl={categoryImageUrl} onItemClick={onItemClick} handleAction={handleAction} setEditServiceModal={setEditServiceModal} handleEditService={handleEditService} />
              );
            })
          )}
        </div>
      </div>

      {(data as any)?.pagination?.totalItems > items.length && (
        <div className="flex justify-center">
          {isFetching ? (
            <IconLoader2 color='#006972' size={28} className="animate-spin text-blue-600" />
          ) : (
            <div className="flex flex-col items-center mt-4">
              <span className="text-sx font-small" style={{ color: '#006972' }}>
                Load More
              </span>
              <IconChevronDown
                color='#006972'
                size={28}
                className="text-blue-600 cursor-pointer hover:text-blue-800 transition"
                onClick={() => setPage((prev) => prev + 1)}
              />
            </div>

          )}
        </div>
      )}

      <audio controls ref={audioRef} className="hidden">
        <source src="/beep.mp3" type="audio/mpeg" />
        <source src="/beep.ogg" type="audio/ogg" />
        <source src="/beep.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>


      {openEditServiceModal && (
        <ATMDialog>
          <div className="p-6 w-full space-y-6">   {/* 👈 padding aur spacing */}

            {/* Heading */}
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              Edit Service
            </h2>

            {/* Service Name Field */}
            <ATMTextField
              required
              name="serviceName"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              label="Service Name"
              placeholder="Enter Service Name"
            />

            {/* Selling Price Field */}
            <ATMNumberField
              required
              name="sellingPrice"
              value={sellingPrice.toString()}
              onChange={(value: string) => setSellingPrice(Number(value))}
              label="Selling Price"
              placeholder="Enter Selling Price"
              isAllowDecimal
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <ATMButton
                onClick={() => setEditServiceModal(false)}
                variant="outlined"
                color="neutral"
              >
                Cancel
              </ATMButton>
              <ATMButton onClick={handleEditServicess} type="submit" color="primary" variant="contained">
                Update
              </ATMButton>
            </div>
          </div>
        </ATMDialog>
      )}


    </div>
  );
};

export default ItemList;
