type ATMSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeClassName?: string;
  extraClassName?: string;
  deactiveLabel?: string;
  activeLabel?: string;
};
const ATMSwitch = ({
  checked,
  onChange,
  activeClassName = 'bg-primary font-semibold text-white',
  extraClassName,
  deactiveLabel,
  activeLabel,
}: ATMSwitchProps) => {
  return (
    <>
      <div>
        <button>
          <div className="flex border rounded-2xl">
            <div
              className="p-0.5"
              onClick={() => checked && onChange(!checked)}
            >
              <p
                className={`transition-all duration-300 ease-in-out   px-2 py-1 rounded-xl hover:bg-primary-70 hover:text-white ${!checked ? activeClassName : ''} ${extraClassName}`}
              >
                {deactiveLabel}
              </p>
            </div>
            <div
              className="p-0.5"
              onClick={() => !checked && onChange(!checked)}
            >
              <p
                className={`transition-all duration-300 ease-in-out  px-2 py-1 rounded-xl  hover:bg-primary-70 hover:text-white ${checked ? activeClassName : ''} ${extraClassName}`}
              >
                {activeLabel}
              </p>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default ATMSwitch;
