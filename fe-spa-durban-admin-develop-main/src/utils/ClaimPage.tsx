// src/pages/ClaimPage.tsx

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetCustomerQuery } from 'src/modules/Customer/service/CustomerServices';
import { useGetRewardsCouponQuery } from 'src/modules/RewardsCoupon/service/RewardsCouponServices';
import { useGetServiceByIdQuery } from 'src/modules/Service/service/ServiceServices';

const ClaimPage = () => {
  const [searchParams] = useSearchParams();
  const rewardId = searchParams.get('rewardId');
  const customerId = searchParams.get('customerId');

  const [claimed, setClaimed] = useState(false);

  const { data: customerData, isLoading: customerLoading } = useFetchData(useGetCustomerQuery, {
    body: customerId,
    dataType: 'VIEW',
  });

  const { data: rewardData, isLoading: rewardLoading } = useFetchData(useGetRewardsCouponQuery, {
    body: rewardId,
    dataType: 'VIEW',
  });

  const serviceIds = (rewardData as any)?.data?.serviceId || [];
  const { data: serviceData } = useFetchData(useGetServiceByIdQuery, {
    body: serviceIds[0], // just fetching the first one as per your code
  });

  const handleClaim = () => {
    // you can call an API here to mark reward as claimed
    setClaimed(true);
  };

  if (customerLoading || rewardLoading) return <p>Loading...</p>;
  if (!customerData || !rewardData) return <p>Invalid reward or customer.</p>;

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h2>🎁 Hello, {(customerData as any)?.data?.customerName}</h2>

      <div
        style={{
          marginTop: 24,
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <h3>🎉 Reward Details</h3>
        <p><strong>Coupon Code:</strong> {(rewardData as any)?.data?.couponCode}</p>
        <p><strong>Required Points:</strong> {(rewardData as any)?.data?.rewardsPoint}</p>
        <p><strong>Service:</strong> {(serviceData as any)?.serviceName}</p>

        {!claimed ? (
          <button
            onClick={handleClaim}
            style={{
              marginTop: 20,
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 5,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Claim Now
          </button>
        ) : (
          <p style={{ color: 'green', fontWeight: 'bold', marginTop: 20 }}>
            ✅ Reward Claimed Successfully!
          </p>
        )}
      </div>
    </div>
  );
};

export default ClaimPage;
