import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCustomerQuery } from '../../service/CustomerServices';
import { CircularProgress, Card, CardContent } from '@mui/material';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import { formatZonedDate } from 'src/utils/formatZonedDate';
import { IconCactus, IconCalendar, IconGlobe, IconIdBadge, IconLocation, IconLocationBolt, IconMail, IconPhone, IconUser, IconUsersGroup } from '@tabler/icons-react';
import { IconGenderAgender } from '@tabler/icons-react';

// Icons


const CustomerViewPage = () => {
  const { id: customerId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetCustomerQuery(customerId);

  const customer = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !customer) {
    return <div className="p-4 text-red-600">Error loading customer details.</div>;
  }

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Customer Details</h1>
        <ATMButton
          children="Back"
          variant="outlined"
          onClick={() => navigate('/customer')}
        />
      </div>

      <Card className="shadow-md">
        <CardContent className="grid grid-cols-2 gap-6 p-6">
          <Detail icon={<IconUser color='#006972'/>} label="Name" value={customer.customerName} />
          <Detail icon={<IconPhone color='#006972'/>} label="Phone" value={customer.phone} />
          <Detail icon={<IconMail color='#006972'/>} label="Email" value={customer.email} />
          <Detail icon={<IconLocation color='#006972'/>} label="Address" value={customer.address} />
          <Detail icon={<IconLocationBolt color='#006972'/>} label="City" value={customer.city} />
          <Detail icon={<IconCactus color='#006972'/>} label="Region" value={customer.region} />
          <Detail icon={<IconGlobe color='#006972'/>} label="Country" value={customer.country} />
          <Detail icon={<IconIdBadge color='#006972'/>} label="Tax No" value={customer.taxNo} />
          <Detail
            icon={<IconCalendar color='#006972'/>}
            label="DOB"
            value={
              customer.dateOfBirth
                ? formatZonedDate(customer.dateOfBirth, 'dd MMM yyyy')
                : '-'
            }
          />
          <Detail icon={<IconGenderAgender color='#006972'/>} label="Gender" value={customer.gender} />
          <Detail icon={<IconUsersGroup color='#006972'/>} label="Customer Group" value={customer.customerGroup} />
        </CardContent>
      </Card>
    </div>
  );
};

const Detail = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-blue-600">{icon}</div>
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-base font-medium">{value || '-'}</span>
    </div>
  </div>
);

export default CustomerViewPage;
