import React, { useState } from 'react';
import ATMTextField from '../../components/atoms/FormElements/ATMTextField/ATMTextField';
import { ATMButton } from '../../components/atoms/ATMButton/ATMButton';
import ATMNumberField from '../../components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMMaskedInput from '../../components/atoms/FormElements/ATMMaskedInput/ATMMaskedInput';
import ATMSelect from '../../components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMDatePicker from '../../components/atoms/FormElements/ATMDatePicker/ATMDatePicker';
import ATMDateRangePicker from '../../components/atoms/FormElements/ATMDateRangePicker/ATMDateRangePicker';

type Props = {};

const TextFields = (props: Props) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [student, setStudent] = useState('3');
  const [startDate, setStartDate] = useState(null);
  const [dateRange, setDateRange] = useState<any>([]);

  const students = [
    {
      label: 'Student 1',
      value: '1',
    },
    {
      label: 'Student 2',
      value: '2',
    },
    {
      label: 'Student 3',
      value: '3',
    },
  ];

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      <div className="text-xs"> Text xs </div>
      <div className="text-sm"> Text sm </div>
      <div className="text-base"> Text base </div>
      <div className="text-lg"> Text lg </div>
      <div className="text-xl"> Text xl </div>
      <div className="text-2xl"> Text 2xl </div>
      <div className="text-3xl"> Text 3xl </div>
      <div className="text-4xl"> Text 4xl </div>
      <div className="text-5xl"> Text 5xl </div>
      <div className="text-6xl"> Text 6xl </div>
      <div className="text-7xl"> Text 7xl </div>
      <div className="text-8xl"> Text 8xl </div>
      <div className="text-9xl"> Text 9xl </div>
    </div>

    // <div className="grid grid-cols-2 gap-4">
    //   <div>
    //     <ATMSelect
    //       name=""
    //       value={student}
    //       onChange={(newValue) => setStudent(newValue)}
    //       label="Student"
    //       options={students}
    //       variant="outlined"
    //       valueAccessKey="value"
    //     />
    //   </div>

    //   <ATMTextField
    //     name="username"
    //     label="Username"
    //     value={userName}
    //     onChange={(e) => {
    //       setUserName(e.target.value);
    //     }}
    //     placeholder="john-doe"
    //     isFocused={isFocused}
    //     onBlur={() => setIsFocused(false)}
    //     isValid={false}
    //     isTouched
    //     errorMessage="Testing"
    //     variant="outlined"
    //   />

    //   <ATMTextField
    //     name="email"
    //     label="Email"
    //     value={email}
    //     onChange={(e) => {
    //       setEmail(e.target.value);
    //     }}
    //     placeholder="john@doe.com"
    //   />
    //   <ATMMaskedInput
    //     name=""
    //     mask="_"
    //     format="(+91) ##### #####"
    //     label="Mobile"
    //     value={email}
    //     onChange={(value) => {
    //       setEmail(value);
    //     }}
    //   />

    //   <ATMNumberField
    //     name="mobile"
    //     label="Discount %"
    //     value={email}
    //     onChange={(e) => {
    //       Number(e) > 100 ? setIsValid(false) : setIsValid(true);
    //       setEmail(e);
    //     }}
    //     placeholder="john@doe.com"
    //     isValid={isValid}
    //     errorMessage="Can't be greater than 100"
    //     variant="outlined"
    //   />

    //   <ATMDatePicker
    //     name=""
    //     label="Start Date"
    //     value={startDate}
    //     onChange={(newValue) => {
    //       setStartDate(newValue);
    //     }}
    //     // variant=""
    //     placeholder="Eg. 01 Jan 2024"
    //     isValid={true}
    //     errorMessage="Can't be greater than 100"
    //   />

    //   <ATMDateRangePicker
    //     name=""
    //     label="Start Date"
    //     value={dateRange}
    //     onChange={(newValue) => {
    //       setDateRange(newValue);
    //     }}
    //     // variant=""
    //     placeholder="Eg. 01 Jan 2024"
    //     isValid={true}
    //     errorMessage="Can't be greater than 100"
    //     variant="outlined"
    //   />

    //   <ATMButton onClick={() => setIsFocused(true)}> Save </ATMButton>
    // </div>
  );
};

export default TextFields;
