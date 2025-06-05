import React from 'react';
import StockAlert from './StockAlert';
const dummyData = [
  {
    item: 'Add on 2x Glasses of Bubbly - R50',
    hotel: 'Coastlands Umhlanga Hotel',
    address: '329 Umhlanga Rocks Drive, Ground Floor, Coastlands Gatemax Hotel',
    quantity: -1,
  },
  {
    item: 'Add on 2x Glasses of Bubbly - R50',
    hotel: 'Coastlands Skye Hotel',
    address: '2 Vuna Close, Umhlanga Ridge, UB Level, Coastlands Skye Hotel',
    quantity: -1,
  },
  {
    item: 'Add on 2x Glasses of Bubbly - R50',
    hotel: 'Royal Hotel',
    address: '267 Anton Lembede Street (Smith Street), 21st Floor, Royal Hotel',
    quantity: -1,
  },
  {
    item: 'Add on 2x Glasses of Bubbly - R50',
    hotel: 'Hilton Durban',
    address: '12-14 Walnut Road, Hilton Durban',
    quantity: -1,
  },
  {
    item: 'Add on 2x Glasses of Bubbly - R50',
    hotel: 'Beverly Hills Hotel',
    address: '1 Lighthouse Road, uMhlanga Rocks, Beverly Hills Hotel',
    quantity: -1,
  },
  {
    item: 'Add on 2x Glasses of Bubbly - R50',
    hotel: 'Oyster Box Hotel',
    address: '2 Lighthouse Road, Umhlanga Rocks, Oyster Box Hotel',
    quantity: -1,
  },
  {
    item: 'Add on 2x Glasses of Bubbly - R50',
    hotel: 'Protea Hotel Fire & Ice! by Marriott Durban Umhlanga Ridge',
    address:
      '14 Palm Boulevard, New Town Centre, Umhlanga Ridge, Protea Hotel Fire & Ice!',
    quantity: -1,
  },
  {
    item: 'Add on 2x Glasses of Bubbly - R50',
    hotel: 'The Capital Pearls',
    address: '6 Lagoon Drive, Umhlanga, The Capital Pearls',
    quantity: -1,
  },
  {
    item: 'Add on 2x Glasses of Bubbly - R50',
    hotel: 'Fairmont Zimbali Resort',
    address: 'Zimbali Coastal Estate, Dolphin Coast, Fairmont Zimbali Resort',
    quantity: -1,
  },
  {
    item: 'Add on 2x Glasses of Bubbly - R50',
    hotel: 'The Benjamin Hotel',
    address: '141 Florida Road, Morningside, Durban, The Benjamin Hotel',
    quantity: -1,
  },
];

const StockAlertWrapper = () => {
  return (
    <div>
      <StockAlert data={dummyData} />
    </div>
  );
};

export default StockAlertWrapper;
