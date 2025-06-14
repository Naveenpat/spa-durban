import { FormikProps } from 'formik';
import { ATMButton } from '../../../components/atoms/ATMButton/ATMButton';
import ATMTextField from '../../../components/atoms/FormElements/ATMTextField/ATMTextField';
import ATMFieldLabel from '../../../components/atoms/ATMFieldLabel/ATMFieldLabel';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import { CompanyFormValues } from '../models/Company.model';

type Props = {
  formikProps: FormikProps<CompanyFormValues>;
  // onClose: () => void;
  formType?: 'ADD' | 'EDIT';
  isLoading?: boolean;
  onCancel: () => void;
};

const CompanyFormLayout = ({
  formikProps,
  // onClose,
  formType = 'ADD',
  onCancel,
  isLoading = false
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  const onSelect = ({
    context = 'feature',
    data,
    isSelected,
  }: {
    context?: 'module' | 'feature' | 'field';
    data: any;
    isSelected: boolean;
    moduleData?: any;
  }) => {

  };

  const cropImageToSquare = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const sideLength = Math.min(img.width, img.height);
          const startX = (img.width - sideLength) / 2;
          const startY = (img.height - sideLength) / 2;

          const canvas = document.createElement('canvas');
          canvas.width = sideLength;
          canvas.height = sideLength;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context is null'));
            return;
          }

          ctx.drawImage(img, startX, startY, sideLength, sideLength, 0, 0, sideLength, sideLength);
          resolve(canvas.toDataURL('image/jpeg')); // You can use 'image/png' if preferred
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };


  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between w-[70%] m-auto">
            <div className="font-semibold">
              {formType === 'ADD' ? 'Add Company' : 'Update Company'}
            </div>
            <div className="flex items-center gap-2">
              <div>
                <ATMButton
                  children="Cancel"
                  variant="outlined"
                  onClick={onCancel}
                />
              </div>
              <div>
                <ATMButton
                  type="submit"
                  isLoading={isSubmitting}
                  children="Submit"
                />
              </div>
            </div>
          </div>
          <div className="border-t"></div>
          <div className="grid grid-cols-3 gap-4 w-[70%] m-auto">
            <div>
              <ATMTextField
                name="companyName"
                value={values.companyName}
                onChange={(e) => setFieldValue('companyName', e.target.value)}
                label="Company Name"
                placeholder="Enter company name"
                onBlur={handleBlur}
                isTouched={touched?.companyName}
                errorMessage={errors?.companyName}
                isValid={!errors?.companyName}
              />
            </div>

            <div>
              <ATMTextField
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

            <div>
              <ATMTextField
                name="phone"
                value={values.phone}
                onChange={(e) => setFieldValue('phone', e.target.value)}
                label="Phone"
                placeholder="Enter phone number"
                onBlur={handleBlur}
                isTouched={touched?.phone}
                errorMessage={errors?.phone}
                isValid={!errors?.phone}
              />
            </div>

             <div>
              <ATMTextField
                name="websiteUrl"
                value={values.websiteUrl}
                onChange={(e) => setFieldValue('websiteUrl', e.target.value)}
                label="Website Url"
                placeholder="Enter Website Url"
                onBlur={handleBlur}
                isTouched={touched?.websiteUrl}
                errorMessage={errors?.websiteUrl}
                isValid={!errors?.websiteUrl}
              />
            </div>

            <div className="relative h-36 w-36 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center overflow-hidden">
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFieldValue('logo', reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {!values.logo ? (
                <div className="relative flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-500 mb-1">324 Px * 313 Px</div>
                  <span className="text-4xl text-gray-400 z-0">+</span>
                </div>

              ) : (
                <img
                  src={values.logo}
                  alt="Logo Preview"
                  className="h-full w-full object-contain z-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyFormLayout;
