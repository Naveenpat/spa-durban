import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import MOLVerticalNavbar from '../../molecules/MOLVerticalNavbar';
import { RootState } from '../../../store';
import ATMAppHeader from '../../atoms/ATMAppHeader/ATMAppHeader';

type Props = {};

const SideNavLayout = (props: Props) => {
  const { isNavBarExpanded } = useSelector(
    (state: RootState) => state.sideNavLayout,
  );

  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="w-full h-[3.5rem]">
        <ATMAppHeader />
      </div>

      <div className="w-full h-[calc(100%-3.5rem)] flex lg:static relative ">
        <div
          className={`h-full transition-all duration-500 overflow-x-hidden lg:static absolute z-50 ${
            isNavBarExpanded ? 'w-[200px]' : 'w-0'
          }`}
        >
          <MOLVerticalNavbar />
        </div>

        <div className="flex-1 h-full overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SideNavLayout;
