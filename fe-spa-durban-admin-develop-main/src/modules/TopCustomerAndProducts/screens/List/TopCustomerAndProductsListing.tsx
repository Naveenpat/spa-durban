import Authorization from 'src/components/Authorization/Authorization';
import TopCustomersListingWrapper from '../../components/topCustomers/TopCustomersListingWrapper';
import TopProductListingWrapper from '../../components/topProducts/TopProductListingWrapper';

type Props = {};

const TopCustomerAndProductsListing = ({}: Props) => {
  return (
    <>
      <div className="xl:w-[80%] w-full xl:m-auto flex flex-col gap-5 py-4 px-2">
        <div className="text-xl font-semibold text-slate-700">
          {' '}
          Top Customer And Products
        </div>
        <Authorization permission="TOP_CUSTOMERS_AND_PRODUCTS_LIST">
          <div className="flex justify-center gap-5 ">
            <div className="w-[50%] h-full">
              <TopCustomersListingWrapper />
            </div>
            <div className="w-[50%]  h-full">
              <TopProductListingWrapper />
            </div>
          </div>
        </Authorization>
      </div>
    </>
  );
};

export default TopCustomerAndProductsListing;
