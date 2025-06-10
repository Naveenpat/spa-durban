import { useEffect, useState } from 'react';

type OtherProp = {
  body?: any;
  options?: any;
  isConcateData?: boolean;
  dataType?: 'LIST' | 'VIEW';
  searchValue?: string;
  limit?: number | string;
  page?: number | string;
  searchIn?: string;
};

export const useFetchData = (query: any, otherProps?: OtherProp) => {
  const {
    body,
    options,
    isConcateData = false,
    dataType = 'LIST',
  } = otherProps ?? {};

  const [result, setResult] = useState<any[] | null>(
    dataType === 'LIST' ? [] : null,
  );
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);

  const { data, isLoading, isFetching, refetch } = query(body, options);

  useEffect(() => {
    if (!isLoading && !isFetching) {
      if (dataType === 'LIST') {
        setResult(
          isConcateData ? [...(result as any[]), data?.data] : data?.data || [],
        );
        setTotalPages(data?.totalPages || 0);
        setTotalData(data?.totalResults || 0);
      } else {
        // setResult(data?.data || null);
        setResult(data || null); // Remove This Line
      }

      setIsDataLoading(false);
    } else {
      setIsDataLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isLoading, isFetching]);

  return {
    data: result,
    totalPages,
    totalData,
    isLoading: isDataLoading,
    refetch: refetch,
  };
};
