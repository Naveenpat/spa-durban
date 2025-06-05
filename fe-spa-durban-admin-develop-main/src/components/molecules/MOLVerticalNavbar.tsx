import { IconX } from '@tabler/icons-react';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import navigation from '../../navigation';
import MOLNavItem from './MOLNavItem/MOLNavItem';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import {
  setFieldCustomized,
  setIsNavBarExpanded,
} from '../../slices/SideNavLayoutSlice';

type Props = {};

const MOLVerticalNavbar = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { customized } = useSelector((state: any) => state.sideNavLayout);

  const currentPath = location?.pathname?.split('/')?.[1];

  const badgeData = {
    batches: '1',
    courses: '27',
  };
  const AlertText =
    'Your changes have not been saved. To stay on the page so that you can save your changes, click Cancel.';
  return (
    <div className="flex w-full h-full px-2 py-4 overflow-x-hidden overflow-y-auto border-r shadow bg-primary-99">
      {/* Cross Button - will be shown on small screens only */}

      <button
        type="button"
        onClick={() => dispatch(setIsNavBarExpanded(false))}
        className="absolute flex justify-end p-1 text-white transition-all duration-500 rounded-full right-2 top-2 lg:hidden"
      >
        <IconX size={20} />
      </button>

      <div className="flex flex-col flex-1 gap-6 ">
        {navigation({ badgeData })?.map((navItem, navItemIndex) => {
          return (
            <div key={navItemIndex} className="flex flex-col gap-2">
              <div className="flex items-center px-3 text-[11px] font-bold tracking-widest text-primary-70 uppercase ">
                {navItem?.groupLable}
              </div>

              <div className="flex flex-col gap-1">
                {navItem?.items?.map((item, ind) => {
                  return (
                    <MOLNavItem
                      onClick={(path, searchParams) => {
                        if (customized) {
                          const confirmValue: boolean =
                            window.confirm(AlertText);
                          if (confirmValue) {
                            dispatch(setFieldCustomized(false));
                            navigate({
                              pathname: `/${path}`,
                              search:
                                createSearchParams(searchParams).toString(),
                            });
                          }
                        } else {
                          navigate({
                            pathname: `/${path}`,
                            search: createSearchParams(searchParams).toString(),
                          });
                        }
                        // navigate({
                        //   pathname: `/${path}`,
                        //   search: createSearchParams(searchParams).toString(),
                        // });
                      }}
                      item={item}
                      isSelected={(path) => path === currentPath}
                      key={ind}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MOLVerticalNavbar;
