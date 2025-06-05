import React, { ReactNode, useEffect } from 'react';
import ATMHorizontalScroll from '../ATMHorizontalScroll/ATMHorizontalScroll';
import { Icon } from '@tabler/icons-react';

export type Tabs = {
  icon: Icon;
  label: string;
  count?: string;
  path?: string;
  onClick: (tab: any) => void;
  children?: React.ReactNode;
};

type Props = {
  tabs: Tabs[];
  selected: (tab: Tabs) => boolean;
  children?: ReactNode;
  childrenLabel: any;
};

const ATMTab = ({ tabs, selected, childrenLabel = '', children }: Props) => {
  useEffect(() => {
    document.getElementById('scroll-to-view')?.scrollIntoView();
  }, []);

  return (
    <ATMHorizontalScroll>
      {(params: any) => (
        <div
          {...params}
          className="flex text-neutral border-b border-divider w-full overflow-auto scrollbar-hide scroll-smooth px-4 z-0"
        >
          {tabs?.map((tab, tabIndex) => {
            return (
              <button
                id={selected(tab) ? 'scroll-to-view' : ''}
                key={tabIndex}
                type="button"
                className={`relative flex gap-2 py-2 px-4 border-y-2 border-white text-xs min-w-fit font-medium hover:text-primary-dark  items-center h-full transition-all duration-500 z-0  ${
                  selected(tab)
                    ? 'text-primary-40  border-b-primary-40 font-semibold'
                    : ' '
                }`}
                onClick={() => {
                  !selected(tab) && tab?.onClick(tab);
                }}
              >
                <div className="">
                  {' '}
                  {tab.icon ? <tab.icon size={16} /> : null}
                </div>
                <div className="">{tab?.label}</div>
                {tab?.count ? (
                  <div
                    className={`${
                      selected(tab)
                        ? 'bg-primary-dark text-white font-medium'
                        : 'bg-slate-300 font-semibold'
                    } rounded-full  px-[6px] py-[2px] text-center`}
                  >
                    {tab?.count}{' '}
                  </div>
                ) : null}
                {tab?.children}
              </button>
            );
          })}
        </div>
      )}
    </ATMHorizontalScroll>
  );
};

export default ATMTab;
