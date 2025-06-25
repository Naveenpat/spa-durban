import { useEffect, useState } from 'react';

type OtherProp = {
  body?: any;               // For POST/PUT
  params?: any;             // For GET
  options?: any;
  isConcateData?: boolean;
  dataType?: 'LIST' | 'VIEW';
};

export const useFetchData = (query: any, otherProps?: OtherProp) => {
  const {
    body,
    params,
    options,
    isConcateData = false,
    dataType = 'LIST',
  } = otherProps ?? {};

  const [result, setResult] = useState<any[] | null>(
    dataType === 'LIST' ? [] : null
  );
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalData, setTotalData] = useState(0);

  // ✅ Auto pick what's available: prefer `params` for GET, `body` for POST
  const queryArg = params ?? body;

  const { data, isLoading, isFetching, refetch } = query(queryArg, options);

  useEffect(() => {
    if (!isLoading && !isFetching) {
      if (dataType === 'LIST') {
        setResult(
          isConcateData ? [...(result as any[]), data?.data] : data?.data || []
        );
        setTotalPages(data?.totalPages || 0);
        setTotalData(data?.totalResults || 0);
      } else {
        setResult(data || null);
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
    refetch,
    isFetching,
  };
};
