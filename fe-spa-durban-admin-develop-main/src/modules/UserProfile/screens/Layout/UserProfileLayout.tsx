import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IconAddressBook,
  IconClipboard,
  IconTransactionDollar,
  IconUser,
} from '@tabler/icons-react';
import ATMTab from 'src/components/atoms/ATMTab/ATMTab';
import ViewUserProfileWrapper from '../View/ViewUserProfileWrapper';
import TransactionsListingWrapper from '../Transactions/TransactionsListingWrapper';
import InvoicesListingWrapper from 'src/modules/Invoices/screens/List/InvoicesListingWrapper';

const UserProfileLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // TO GET TAB VALUE
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab');

  React.useEffect(() => {
    if (activeTab === null) {
      navigate('/user-profile/?tab=details');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <ViewUserProfileWrapper />;
      case 'invoices':
        return <InvoicesListingWrapper />;
      case 'transactions':
        return <TransactionsListingWrapper />;
      default:
        return <ViewUserProfileWrapper />;
    }
  };

  const tab: any[] = [
    {
      label: 'Profile',
      icon: IconAddressBook,
      path: 'details',
      onClick: () => {
        navigate('/user-profile/?tab=details');
      },
    },
    // {
    //   label: 'Invoices',
    //   path: 'invoices',
    //   icon: IconClipboard,
    //   onClick: () => {
    //     navigate('/user-profile/?tab=invoices');
    //   },
    // },
    // {
    //   label: 'Transactions',
    //   icon: IconTransactionDollar,
    //   path: 'transactions',
    //   onClick: () => {
    //     navigate('/user-profile/?tab=transactions');
    //   },
    // },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="sticky top-0 w-full bg-white">
        <ATMTab
          tabs={tab}
          selected={(tab: any) => tab.path === activeTab}
          childrenLabel={activeTab}
          children={<></>}
        />
      </div>
      <div className="flex-1 block h-full mt-3 overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default UserProfileLayout;
