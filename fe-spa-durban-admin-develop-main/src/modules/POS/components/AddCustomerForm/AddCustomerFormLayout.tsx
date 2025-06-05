import { FormikProps } from 'formik';
import { useState } from 'react';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import ATMDatePicker from 'src/components/atoms/FormElements/ATMDatePicker/ATMDatePicker';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { CustomerFormValues } from 'src/modules/Customer/models/Customer.model';

const countries = [
  { label: 'afghanistan', value: 'AFG' },
  { label: 'albania', value: 'ALB' },
  { label: 'algeria', value: 'DZA' },
  { label: 'andorra', value: 'AND' },
  { label: 'angola', value: 'AGO' },
  { label: 'antigua and Barbuda', value: 'ATG' },
  { label: 'argentina', value: 'ARG' },
  { label: 'armenia', value: 'ARM' },
  { label: 'australia', value: 'AUS' },
  { label: 'austria', value: 'AUT' },
  { label: 'azerbaijan', value: 'AZE' },
  { label: 'bahamas', value: 'BHS' },
  { label: 'bhrain', value: 'BHR' },
  { label: 'bangladesh', value: 'BGD' },
  { label: 'barbados', value: 'BRB' },
  { label: 'belarus', value: 'BLR' },
  { label: 'belgium', value: 'BEL' },
  { label: 'belize', value: 'BLZ' },
  { label: 'benin', value: 'BEN' },
  { label: 'bhutan', value: 'BTN' },
  { label: 'bolivia', value: 'BOL' },
  { label: 'bosnia and Herzegovina', value: 'BIH' },
  { label: 'botswana', value: 'BWA' },
  { label: 'brazil', value: 'BRA' },
  { label: 'brunei', value: 'BRN' },
  { label: 'bulgaria', value: 'BGR' },
  { label: 'burkina Faso', value: 'BFA' },
  { label: 'burundi', value: 'BDI' },
  { label: 'cabo Verde', value: 'CPV' },
  { label: 'cambodia', value: 'KHM' },
  { label: 'cameroon', value: 'CMR' },
  { label: 'canada', value: 'CAN' },
  { label: 'central African Republic', value: 'CAF' },
  { label: 'chad', value: 'TCD' },
  { label: 'chile', value: 'CHL' },
  { label: 'china', value: 'CHN' },
  { label: 'colombia', value: 'COL' },
  { label: 'comoros', value: 'COM' },
  { label: 'congo (Congo-Brazzaville)', value: 'COG' },
  { label: 'costa Rica', value: 'CRI' },
  { label: 'croatia', value: 'HRV' },
  { label: 'cuba', value: 'CUB' },
  { label: 'cyprus', value: 'CYP' },
  { label: 'czechia (Czech Republic)', value: 'CZE' },
  { label: 'democratic Republic of the Congo', value: 'COD' },
  { label: 'denmark', value: 'DNK' },
  { label: 'djibouti', value: 'DJI' },
  { label: 'dominica', value: 'DMA' },
  { label: 'dominican Republic', value: 'DOM' },
  { label: 'ecuador', value: 'ECU' },
  { label: 'egypt', value: 'EGY' },
  { label: 'el Salvador', value: 'SLV' },
  { label: 'equatorial Guinea', value: 'GNQ' },
  { label: 'eritrea', value: 'ERI' },
  { label: 'estonia', value: 'EST' },
  { label: 'eswatini (fmr. Swaziland)', value: 'SWZ' },
  { label: 'ethiopia', value: 'ETH' },
  { label: 'fiji', value: 'FJI' },
  { label: 'finland', value: 'FIN' },
  { label: 'france', value: 'FRA' },
  { label: 'gabon', value: 'GAB' },
  { label: 'gambia', value: 'GMB' },
  { label: 'eorgia', value: 'GEO' },
  { label: 'germany', value: 'DEU' },
  { label: 'ghana', value: 'GHA' },
  { label: 'greece', value: 'GRC' },
  { label: 'grenada', value: 'GRD' },
  { label: 'guatemala', value: 'GTM' },
  { label: 'guinea', value: 'GIN' },
  { label: 'guinea-Bissau', value: 'GNB' },
  { label: 'guyana', value: 'GUY' },
  { label: 'haiti', value: 'HTI' },
  { label: 'honduras', value: 'HND' },
  { label: 'hungary', value: 'HUN' },
  { label: 'iceland', value: 'ISL' },
  { label: 'india', value: 'IND' },
  { label: 'indonesia', value: 'IDN' },
  { label: 'iran', value: 'IRN' },
  { label: 'iraq', value: 'IRQ' },
  { label: 'ireland', value: 'IRL' },
  { label: 'israel', value: 'ISR' },
  { label: 'italy', value: 'ITA' },
  { label: 'jamaica', value: 'JAM' },
  { label: 'japan', value: 'JPN' },
  { label: 'jordan', value: 'JOR' },
  { label: 'kazakhstan', value: 'KAZ' },
  { label: 'kenya', value: 'KEN' },
  { label: 'kiribati', value: 'KIR' },
  { label: 'kuwait', value: 'KWT' },
  { label: 'kyrgyzstan', value: 'KGZ' },
  { label: 'laos', value: 'LAO' },
  { label: 'latvia', value: 'LVA' },
  { label: 'lebanon', value: 'LBN' },
  { label: 'lesotho', value: 'LSO' },
  { label: 'liberia', value: 'LBR' },
  { label: 'libya', value: 'LBY' },
  { label: 'liechtenstein', value: 'LIE' },
  { label: 'lithuania', value: 'LTU' },
  { label: 'luxembourg', value: 'LUX' },
  { label: 'madagascar', value: 'MDG' },
  { label: 'malawi', value: 'MWI' },
  { label: 'malaysia', value: 'MYS' },
  { label: 'maldives', value: 'MDV' },
  { label: 'mali', value: 'MLI' },
  { label: 'malta', value: 'MLT' },
  { label: 'marshall Islands', value: 'MHL' },
  { label: 'mauritania', value: 'MRT' },
  { label: 'mauritius', value: 'MUS' },
  { label: 'mexico', value: 'MEX' },
  { label: 'micronesia', value: 'FSM' },
  { label: 'moldova', value: 'MDA' },
  { label: 'monaco', value: 'MCO' },
  { label: 'mongolia', value: 'MNG' },
  { label: 'montenegro', value: 'MNE' },
  { label: 'morocco', value: 'MAR' },
  { label: 'mozambique', value: 'MOZ' },
  { label: 'myanmar (formerly Burma)', value: 'MMR' },
  { label: 'namibia', value: 'NAM' },
  { label: 'nauru', value: 'NRU' },
  { label: 'nepal', value: 'NPL' },
  { label: 'netherlands', value: 'NLD' },
  { label: 'new Zealand', value: 'NZL' },
  { label: 'nicaragua', value: 'NIC' },
  { label: 'niger', value: 'NER' },
  { label: 'nigeria', value: 'NGA' },
  { label: 'north Korea', value: 'PRK' },
  { label: 'north Macedonia', value: 'MKD' },
  { label: 'norway', value: 'NOR' },
  { label: 'oman', value: 'OMN' },
  { label: 'pakistan', value: 'PAK' },
  { label: 'palau', value: 'PLW' },
  { label: 'palestine State', value: 'PSE' },
  { label: 'panama', value: 'PAN' },
  { label: 'papua New Guinea', value: 'PNG' },
  { label: 'paraguay', value: 'PRY' },
  { label: 'peru', value: 'PER' },
  { label: 'philippines', value: 'PHL' },
  { label: 'poland', value: 'POL' },
  { label: 'portugal', value: 'PRT' },
  { label: 'qatar', value: 'QAT' },
  { label: 'romania', value: 'ROU' },
  { label: 'russia', value: 'RUS' },
  { label: 'rwanda', value: 'RWA' },
  { label: 'saint Kitts and Nevis', value: 'KNA' },
  { label: 'saint Lucia', value: 'LCA' },
  { label: 'saint Vincent and the Grenadines', value: 'VCT' },
  { label: 'samoa', value: 'WSM' },
  { label: 'san Marino', value: 'SMR' },
  { label: 'sao Tome and Principe', value: 'STP' },
  { label: 'saudi Arabia', value: 'SAU' },
  { label: 'senegal', value: 'SEN' },
  { label: 'serbia', value: 'SRB' },
  { label: 'seychelles', value: 'SYC' },
  { label: 'sierra Leone', value: 'SLE' },
  { label: 'singapore', value: 'SGP' },
  { label: 'slovakia', value: 'SVK' },
  { label: 'slovenia', value: 'SVN' },
  { label: 'solomon Islands', value: 'SLB' },
  { label: 'somalia', value: 'SOM' },
  { label: 'south Africa', value: 'ZAF' },
  { label: 'south Korea', value: 'KOR' },
  { label: 'south Sudan', value: 'SSD' },
  { label: 'spain', value: 'ESP' },
  { label: 'sri Lanka', value: 'LKA' },
  { label: 'sudan', value: 'SDN' },
  { label: 'suriname', value: 'SUR' },
  { label: 'sweden', value: 'SWE' },
  { label: 'switzerland', value: 'CHE' },
  { label: 'syria', value: 'SYR' },
  { label: 'tajikistan', value: 'TJK' },
  { label: 'tanzania', value: 'TZA' },
  { label: 'thailand', value: 'THA' },
  { label: 'timor-Leste', value: 'TLS' },
  { label: 'togo', value: 'TGO' },
  { label: 'tonga', value: 'TON' },
  { label: 'trinidad and Tobago', value: 'TTO' },
  { label: 'tunisia', value: 'TUN' },
  { label: 'turkey', value: 'TUR' },
  { label: 'turkmenistan', value: 'TKM' },
  { label: 'tuvalu', value: 'TUV' },
  { label: 'uganda', value: 'UGA' },
  { label: 'ukraine', value: 'UKR' },
  { label: 'nited Arab Emirates', value: 'ARE' },
  { label: 'united Kingdom', value: 'GBR' },
  { label: 'united States of America', value: 'USA' },
  { label: 'uruguay', value: 'URY' },
  { label: 'uzbekistan', value: 'UZB' },
  { label: 'vanuatu', value: 'VUT' },
  { label: 'vatican City', value: 'VAT' },
  { label: 'venezuela', value: 'VEN' },
  { label: 'vietnam', value: 'VNM' },
  { label: 'yemen', value: 'YEM' },
  { label: 'zambia', value: 'ZMB' },
  { label: 'zimbabwe', value: 'ZWE' },
];

type Props = {
  formikProps: FormikProps<CustomerFormValues>;
  onClose: () => void;
  isLoading?: boolean;
};
const genderOptions = [
  {
    value: 'MALE',
    label: 'Male',
  },
  {
    value: 'FEMALE',
    label: 'Female',
  },
];

const AddCustomerFormLayout = ({
  formikProps,
  onClose,
  isLoading = false,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  const [showField, setShowField] = useState(false);
  return (
    <>
      <MOLFormDialog
        title="Add Customer"
        onClose={onClose}
        isSubmitting={isSubmitting}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <ATMCircularProgress />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-[500px]">
            {/* customerName */}
            <div className="col-span-2">
              <ATMTextField
                required
                name="customerName"
                value={values.customerName}
                onChange={(e) => setFieldValue('customerName', e.target.value)}
                label="Name"
                placeholder="Enter Name"
                onBlur={handleBlur}
                isTouched={touched?.customerName}
                errorMessage={errors?.customerName}
                isValid={!errors?.customerName}
              />
            </div>
            {/* Phone No. */}
            <div className="">
              <ATMNumberField
                required
                name="phone"
                value={values.phone}
                onChange={(newValue) => setFieldValue('phone', newValue)}
                label="Phone No."
                placeholder="Enter phone number"
                onBlur={handleBlur}
                isTouched={touched?.phone}
                errorMessage={errors?.phone}
                isValid={!errors?.phone}
              />
            </div>
            {/*Email */}
            <div className="">
              <ATMTextField
                required
                name="email"
                value={values.email}
                onChange={(e) => setFieldValue('email', e.target.value)}
                label="Email"
                placeholder="Enter email address"
                onBlur={handleBlur}
                isTouched={touched?.email}
                errorMessage={errors?.email}
                isValid={!errors?.email}
              />
            </div>
            {/* DOB*/}
            <div className="">
              <ATMDatePicker
                required
                name="dateOfBirth"
                value={values?.dateOfBirth}
                onChange={(newValue) => setFieldValue('dateOfBirth', newValue)}
                label="DOB"
                dateFormat="dd/MM/yyyy"
                placeholder="Please select dob"
              />
            </div>
            {/* gender */}
            <div className="">
              <ATMSelect
                required
                name="gender"
                value={values?.gender}
                onChange={(newValue) => setFieldValue('gender', newValue)}
                label="Gender"
                placeholder="Select gender"
                options={genderOptions}
                valueAccessKey="value"
                onBlur={handleBlur}
              />
            </div>
            {/*country */}
            {showField && (
              <div className="">
                <ATMSelect
                  name="country"
                  value={values?.country}
                  onChange={(newValue) => setFieldValue('country', newValue)}
                  label="Country"
                  placeholder="Select Country"
                  options={countries}
                  valueAccessKey="label"
                  onBlur={handleBlur}
                />
              </div>
            )}

            {/*City */}
            {showField && (
              <div className="">
                <ATMTextField
                  name="city"
                  value={values.city}
                  onChange={(e) => setFieldValue('city', e.target.value)}
                  label="City"
                  placeholder="Enter city"
                  onBlur={handleBlur}
                  isTouched={touched?.city}
                  errorMessage={errors?.city}
                  isValid={!errors?.city}
                />
              </div>
            )}

            {/*region */}
            {showField && (
              <div className="">
                <ATMTextField
                  name="region"
                  value={values.region}
                  onChange={(e) => setFieldValue('region', e.target.value)}
                  label="Region"
                  placeholder="Enter region"
                  onBlur={handleBlur}
                  isTouched={touched?.region}
                  errorMessage={errors?.region}
                  isValid={!errors?.region}
                />
              </div>
            )}
            {/*taxNo */}
            {showField && (
              <div className="">
                <ATMTextField
                  name="taxNo"
                  value={values.taxNo}
                  onChange={(e) => setFieldValue('taxNo', e.target.value)}
                  label="Tax No."
                  placeholder="Enter taxNo"
                  onBlur={handleBlur}
                  isTouched={touched?.taxNo}
                  errorMessage={errors?.taxNo}
                  isValid={!errors?.taxNo}
                />
              </div>
            )}
            {/*address */}
            {showField && (
              <div className="col-span-2 ">
                <ATMTextArea
                  name="address"
                  value={values.address}
                  onChange={(e) => setFieldValue('address', e.target.value)}
                  label="Address"
                  placeholder="Enter address"
                  onBlur={handleBlur}
                  isTouched={touched?.address}
                  errorMessage={errors?.address}
                  isValid={!errors?.address}
                />
              </div>
            )}

            <div className="col-span-2">
              <ATMButton
                type="button"
                onClick={() =>
                  showField ? setShowField(false) : setShowField(true)
                }
                variant={showField ? 'text' : 'contained'}
              >
                {showField
                  ? 'Remove Additional information Fields'
                  : 'Add Additional information Fields'}
              </ATMButton>
            </div>
          </div>
        )}
      </MOLFormDialog>
    </>
  );
};

export default AddCustomerFormLayout;
