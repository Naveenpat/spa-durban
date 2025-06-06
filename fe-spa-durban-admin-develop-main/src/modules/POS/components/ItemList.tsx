import { IconX, IconPlus, IconMinus } from '@tabler/icons-react';
import { useRef, useState, useEffect } from 'react';
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
import { useUpdateServiceToTopMutation } from '../../Service/service/ServiceServices';
import { useSearchParams } from 'react-router-dom';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onItemClick: (item: any) => void;
  onAllItemsProcessed: (item: any) => void;
};

const ItemList = ({ onItemClick, onAllItemsProcessed }: Props) => {
  const [updateService] = useUpdateServiceToTopMutation();

  const [searchParams, setSearchParams] = useSearchParams();
  const treatments = searchParams.getAll('treatments');
  const prevTreatmentsRef = useRef<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isSearch, setIsSearch] = useState(true);
  const [barcodeValue, setBarcodeValue] = useState('');
  const { outlet } = useSelector((state: RootState) => state.auth);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const { data, isLoading, refetch } = useFetchData(useGetItemsQuery, {
    body: {
      searchValue: searchValue,
      filterBy: JSON.stringify([
        {
          fieldName: 'categoryId',
          value: selectedCategories,
        },
      ]),
      outletId: (outlet as any)?._id,
    },
    options: {
      skip: !isSearch,
    },
  });
  const { data: categoryData, isLoading: categoryLoading } = useFetchData(
    useGetCategoriesQuery,
    {
      body: { isPaginationRequired: false },
    },
  );

  useEffect(() => {
    if (data && data?.length > 0) {
      const prevTreatments = JSON.stringify(prevTreatmentsRef.current);
      const newTreatments = JSON.stringify(treatments);

      if (prevTreatments !== newTreatments) {
        if (treatments?.length > 0) {
          const matchedObjects = data
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
  }, [treatments, data]);
  useEffect(() => {
    if (selectedItems.length > 0) {
      onAllItemsProcessed(selectedItems); // Call function when array is updated
    }
  }, [selectedItems]);
  function addToTop(product: any, type: string) {
    updateService({ serviceId: product?._id, body: { type } }).then(
      (res: any) => {
        if (res?.error) {
          showToast('error', res?.error?.data?.message);
        } else {
          if (res?.data?.status) {
            showToast('success', res?.data?.message);
            refetch();
          } else {
            showToast('error', res?.data?.message);
          }
        }
      },
    );
  }
  return (
    <div className="flex flex-col w-full h-full gap-2 p-4 overflow-auto">
      {/* Search Box */}
      <div className="flex items-stretch gap-2">
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
            if (e.key === 'Enter') {
              setIsSearch(true);
            }
          }}
        />

        <ATMBarcodeField
          value={barcodeValue}
          onChange={(e) => {
            setBarcodeValue(e?.target?.value);
          }}
          placeholder="Barcode"
          onFocus={() => setSearchValue('')}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              getProductDetails(barcodeValue).then((res: any) => {
                if (res?.error) {
                } else {
                  if (res?.data?.status) {
                    if (audioRef.current) {
                      audioRef.current.play();
                    }
                    onItemClick(res?.data?.data);
                  } else {
                  }
                }
                setBarcodeValue('');
              });
            }
          }}
        />

        <div>
          <div
            onClick={() => navigate('/dashboard')}
            className="h-[40px] px-2 bg-red-500 text-white  rounded-md flex items-center cursor-pointer text-xs gap-1"
          >
            <IconX size={15} /> Close
          </div>
        </div>
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

      <div className="grid h-full grid-cols-5 gap-4">
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
            height: '510px',
            overflow: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {isLoading ? (
            Array(3)
              ?.fill(null)
              ?.map((_, index) => <ItemLoadingCard key={index} />)
          ) : data?.length === 0 ? (
            <NoItemFound />
          ) : (
            data?.map((product) => {
              return (
                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <div
                    key={product?._id}
                    onClick={() => onItemClick(product)}
                    className="rounded-sm cursor-pointer min-w-[150px] max-w-[150px] shadow"
                    style={{
                      border: `2px solid ${product?.colorCode}`,
                    }}
                  >
                    <img
                      className="h-[80px] w-full rounded-t-sm"
                      src={product?.itemUrl || 'no-image.jpg'}
                      alt={product?.itemName}
                    />

                    <div className="flex flex-col gap-2 px-2 py-1 pb-2 bg-white rounded-b-sm">
                      <div
                        title={product?.itemName}
                        className="text-[12px] text-slate-800 line-clamp-2 font-medium capitalize"
                      >
                        {product?.itemName}
                      </div>

                      <div className="text-xs font-medium text-primary">
                        {CURRENCY} {product?.sellingPrice}
                      </div>
                    </div>
                  </div>
                  {product?.pinned ? (
                    <div
                      style={{
                        position: 'absolute',
                        right: '5px',
                        bottom: '25px',
                        background: 'red',
                        color: '#fff',
                        borderRadius: '20px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        addToTop(product, 'remove');
                      }}
                    >
                      <IconMinus size={15} />
                    </div>
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        right: '5px',
                        bottom: '25px',
                        background: 'green',
                        color: '#fff',
                        borderRadius: '20px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        addToTop(product, 'add');
                      }}
                    >
                      <IconPlus size={15} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <audio controls ref={audioRef} className="hidden">
        <source src="/beep.mp3" type="audio/mpeg" />
        <source src="/beep.ogg" type="audio/ogg" />
        <source src="/beep.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default ItemList;
