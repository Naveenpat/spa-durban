import React from 'react';
import RecentBuyers from './RecentBuyers';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetRecentBuyersQuery } from '../../service/DashboardServices';

const RecentBuyersWrapper = () => {
  const { data, isLoading, refetch } = useFetchData(useGetRecentBuyersQuery);
  return (
    <div>
      <RecentBuyers
        buyersData={data as any[]}
        isLoading={isLoading}
        fetch={() => refetch()}
      />
    </div>
  );
};

export default RecentBuyersWrapper;
