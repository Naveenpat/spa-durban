import { IconEdit, IconFile } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

const Field = ({ label, value }: any) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-neutral">{label}</span>
      <span className="text-sm ">{value}</span>
    </div>
  );
};

const Section = ({ heading, extraClass }: any) => {
  return (
    <p className={`border-b p-2 text-md font-medium mx-2 ${extraClass}`}>
      {heading}
    </p>
  );
};
const FileImage = ({ label, url }: any) => {
  return (
    <div className="border rounded-lg shadow ">
      <div className="flex items-center gap-2 p-2">
        <IconFile size="1.4em" />
        <div
          className="font-medium cursor-pointer text-slate-600"
          onClick={() => {
            window.open(`${url}`, '_blank');
          }}
        >
          {label}.jpg
        </div>
      </div>
    </div>
  );
};

type Props = {
  userDetails: any;
  isLoading: boolean;
};

const ViewUserProfile = ({ userDetails, isLoading }: Props) => {
  const navigate = useNavigate();
  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="p-4 m-2 bg-gray-100 rounded-md ">
          <div className="flex justify-between p-4 bg-white border-b rounded-lg">
            {/* Avatar  */}
            <div className="flex items-center gap-5">
              <div className="flex items-center justify-center font-bold ">
                <img
                  alt="profile"
                  className="h-[64px] w-[64px] rounded-full border-2 border-primary-main"
                  src={
                    userDetails?.photoUrl ||
                    'https://www.freeiconspng.com/thumbs/human-icon-png/person-outline-icon-png-person-outline-icon-png-person-17.png'
                  }
                />
              </div>
              <div className="flex flex-col">
                <span className="mt-2 font-medium capitalize text-md">
                  {userDetails?.name}{' '}
                </span>
              </div>
            </div>
            {/* Edit Details */}
            {/* <div className="flex items-center justify-end">
          <div
            onClick={() => {
              navigate(`/user-profile/1`);
            }}
            className="flex items-center gap-1 px-2 py-1 text-sm font-medium cursor-pointer bg-slate-100 text-slate-600 rounded-3xl hover:bg-primary-60 hover:text-white"
          >
            <IconEdit size="1.4em" /> Edit Details
          </div>
        </div> */}
          </div>
          {/* Personal Details */}
          <div className="mt-3 bg-white rounded-lg shadow">
            <Section
              heading={'Personal Details'}
              extraClass="text-primary-40"
            />
            <div className="grid grid-cols-12 md:gap-8 xs:gap-4 md:py-0 xs:py-4">
              <div className="xl:col-span-4 md:col-span-6 sm:col-span-12 md:py-4">
                <div className="flex flex-col gap-4 px-4">
                  <Field label={'Email'} value={userDetails?.email || '-'} />
                  <Field label={'Phone'} value={userDetails?.phone || '-'} />
                </div>
              </div>
              <div className=" xl:col-span-4 md:col-span-6 sm:col-span-12 md:py-4">
                <div className="flex flex-col gap-4 px-4 capitalize ">
                  <Field
                    label={'Address'}
                    value={userDetails?.address || '-'}
                  />
                  <Field label={'City'} value={userDetails?.city || '-'} />
                  <Field
                    label={'Country'}
                    value={userDetails?.country || '-'}
                  />
                  <Field label={'Region'} value={userDetails?.region || '-'} />
                </div>
              </div>
              <div className=" xl:col-span-4 md:col-span-6 sm:col-span-12 md:py-4">
                <div className="flex flex-col gap-4 px-4">
                  {userDetails?.photoUrl && (
                    <Field
                      label={'Photo'}
                      value={
                        <FileImage
                          label="Photo"
                          url={userDetails?.photoUrl || ''}
                        />
                      }
                    />
                  )}
                  <div className="mt-2">
                    {userDetails?.signatureUrl && (
                      <Field
                        label={'Signature'}
                        value={
                          <FileImage
                            label="Signature"
                            url={userDetails?.signatureUrl || ''}
                          />
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUserProfile;
