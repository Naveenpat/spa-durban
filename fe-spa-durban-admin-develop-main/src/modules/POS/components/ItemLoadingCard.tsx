import React from 'react';

type Props = {};

const ItemLoadingCard = (props: Props) => {
  return (
    <div className="rounded-sm cursor-pointer min-w-[150px] max-w-[150px] shadow animate-pulse ">
      <div className="h-[80px] w-full rounded-t-sm bg-gray-200"></div>

      <div className="flex flex-col gap-2 px-2 py-1 pb-2 rounded-b-sm">
        <div className="h-[14px] bg-gray-200 rounded"></div>

        <div className="h-[14px] bg-gray-200 rounded w-[100px]"></div>
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
