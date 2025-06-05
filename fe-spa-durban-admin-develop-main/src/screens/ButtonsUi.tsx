import React from 'react';
import { ATMButton } from '../components/atoms/ATMButton/ATMButton';

type Props = {};

const ButtonsUi = (props: Props) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Primary */}
      <div>
        <div className="mb-2 text-xl font-bold text-left text-primary-main">
          Primary
        </div>
        <div className="flex gap-4 ">
          <ATMButton> Small </ATMButton>
          <ATMButton isLoading={true}> Small </ATMButton>
          <ATMButton size="medium"> Medium </ATMButton>
          <ATMButton size="large"> Large </ATMButton>
          <ATMButton disabled> Default Disabled </ATMButton>
          <ATMButton variant="outlined">Outlined</ATMButton>
          <ATMButton disabled variant="outlined">
            Outlined Disabled
          </ATMButton>
        </div>
      </div>

      {/* Secondary */}
      <div>
        <div className="mb-2 text-xl font-bold text-left text-secondary-main">
          Secondary
        </div>
        <div className="flex gap-4 ">
          <ATMButton color="secondary"> Default </ATMButton>
          <ATMButton color="secondary" disabled>
            Default Disabled
          </ATMButton>
          <ATMButton color="secondary" variant="outlined">
            Outlined
          </ATMButton>
          <ATMButton color="secondary" disabled variant="outlined">
            Outlined Disabled
          </ATMButton>
        </div>
      </div>
    </div>
  );
};

export default ButtonsUi;
