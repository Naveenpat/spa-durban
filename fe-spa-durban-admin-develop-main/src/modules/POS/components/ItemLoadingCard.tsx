import React from 'react';

type Props = {};

const ItemLoadingCard = () => {
  return (
    <div className="w-[230px] h-[260px] rounded-lg shadow animate-pulse bg-white overflow-hidden border border-gray-200">
      {/* Image Skeleton */}
      <div className="h-[150px] w-full bg-gray-200"></div>

      {/* Text Skeleton */}
      <div className="flex flex-col justify-between px-3 py-3 h-[110px]">
        <div className="h-[16px] bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-[14px] bg-gray-200 rounded w-[60%] mb-2"></div>
        <div className="h-[14px] bg-gray-200 rounded w-[40%]"></div>
      </div>
    </div>
  );
};

export default ItemLoadingCard;

export const CategoryLoading = () => {
  return (
    <div>
      <div className="flex items-center gap-2 py-2">
        <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
        <div className="w-32 h-4 bg-gray-200 rounded-sm "></div>
      </div>
      <div className="flex items-center gap-2 py-2">
        <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
        <div className="w-32 h-4 bg-gray-200 rounded-sm "></div>
      </div>
      <div className="flex items-center gap-2 py-2">
        <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
        <div className="w-32 h-4 bg-gray-200 rounded-sm "></div>
      </div>
    </div>
  );
};
