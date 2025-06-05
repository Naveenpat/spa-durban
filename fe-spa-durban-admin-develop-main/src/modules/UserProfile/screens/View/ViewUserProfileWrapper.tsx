import React from 'react';
import ViewUserProfile from '../../components/ViewUserProfile';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetUserByIdQuery } from '../../service/UserProfileServices';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

const ViewUserProfileWrapper = () => {
  const { userData } = useSelector((state: RootState) => state.auth);
  const userId = userData?.userId;
  const { data, isLoading } = useFetchData(useGetUserByIdQuery, {
    body: userId,
    dataType: 'VIEW',
  });

  return (
    <div className="h-full">
      <ViewUserProfile
        userDetails={(data as any)?.data}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ViewUserProfileWrapper;
