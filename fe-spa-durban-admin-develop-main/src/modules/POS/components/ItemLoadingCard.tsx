import React from 'react';

type Props = {};

const ItemLoadingCard = () => {
  return (
    <div className="w-[150px] h-[170px] rounded-sm shadow animate-pulse bg-white overflow-hidden">
      {/* Image Skeleton */}
      <div className="h-[80px] w-full bg-gray-200"></div>

      {/* Text Skeleton */}
      <div className="flex flex-col justify-between px-2 py-2 h-[90px]">
        <div className="h-[14px] bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-[14px] bg-gray-200 rounded w-[70%]"></div>
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
