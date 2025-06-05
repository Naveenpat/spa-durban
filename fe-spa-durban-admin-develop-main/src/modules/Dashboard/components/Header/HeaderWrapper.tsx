import React from 'react';
import Header from './Header';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetCountsQuery } from '../../service/DashboardServices';

const HeaderWrapper = () => {
  const { data } = useFetchData(useGetCountsQuery);
  return (
    <div>
      <Header data={data} />
    </div>
  );
};

export default HeaderWrapper;
