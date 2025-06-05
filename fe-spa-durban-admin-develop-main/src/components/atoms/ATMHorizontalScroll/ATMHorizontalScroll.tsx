import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';

type ATMHorizontalScrollProps = {
  children: (params: { ref: any; onScroll: any }) => React.ReactNode;
};
const ATMHorizontalScroll = ({ children }: ATMHorizontalScrollProps) => {
  let scrl: any = useRef(null);
  const [scrollX, setscrollX] = useState(0);
  const [scrolEnd, setscrolEnd] = useState(false);

  useEffect(() => {
    setscrolEnd(
      Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <=
        scrl.current.offsetWidth,
    );
  }, [scrl]);

  //Slide click
  const slide = (shift: number) => {
    scrl.current.scrollLeft += shift;
    setscrollX(scrollX + shift);

    if (
      Math.floor(scrl?.current?.scrollWidth - scrl?.current?.scrollLeft) <=
      scrl.current.offsetWidth
    ) {
      setscrolEnd(true);
    } else {
      setscrolEnd(false);
    }
  };

  const scrollCheck = () => {
    setscrollX(scrl.current.scrollLeft);
    if (
      Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <=
      scrl.current.offsetWidth
    ) {
      setscrolEnd(true);
    } else {
      setscrolEnd(false);
    }
  };

  return (
    <div className="text-center w-full h-full flex items-center justify-between relative z-0">
      {scrollX !== 0 && (
        <button
          className="prev border-0 text-gray-600 text-[24px] bg-gradient-to-r from-white via-white to-transparent rounded h-[30px] w-[30px] flex justify-center items-center absolute"
          onClick={() => slide(-100)}
        >
          <IconArrowLeft />
        </button>
      )}
      {children({ ref: scrl, onScroll: scrollCheck })}
      {!scrolEnd && (
        <button
          className="next border-0 text-gray-600 text-[24px] bg-gradient-to-l from-white via-white to-transparent  rounded h-[30px] w-[30px] flex justify-center items-center absolute right-0"
          onClick={() => slide(+100)}
        >
          <IconArrowRight />
        </button>
      )}
    </div>
  );
};

export default ATMHorizontalScroll;
