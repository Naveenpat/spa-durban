import {
  format,
  isAfter,
  isBefore,
  parseISO,
  isToday,
  parse,
  compareAsc,
} from "date-fns";
import { toZonedTime, format as formatTZ } from "date-fns-tz";
import { ActionMethodEnum } from "../utils/enumUtils";

// Define valid method names and action names
const valid_method_name = ["GET", "POST", "PUT", "DELETE"];
const valid_action_name = Object.keys(ActionMethodEnum);

const objectId = (value: string, helpers: any) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id...');
  }
  return value;
};

const minValue = (value: number, helpers: any) => {
  if (value > 9) {
    return helpers.message('"{{#label}}" should not be greater than 9');
  }
  return value;
};

const accessactionNameCheck = (value: string, helpers: any) => {
  if (!valid_action_name.includes(value.toUpperCase())) {
    return helpers.message(`{#label} must be any of ${valid_action_name}`);
  }
  return value.toLowerCase();
};

const accessMethodCheck = (value: string, helpers: any) => {
  if (!valid_method_name.includes(value.toLowerCase())) {
    return helpers.message(`{#label} must be any of ${valid_method_name}`);
  }
  return value.toLowerCase();
};

const indianPhone = (value: string, helpers: any) => {
  if (!value.match(/^[6-9]\d{9}$/)) {
    return helpers.message('"{{#label}}" must be a valid phone number.');
  }
  return value;
};

const objectIdCustom = (value: string, label: string) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return { status: true, msg: `${label} must be a valid mongo id` };
  }
  return { status: false, msg: "" };
};

// const requiredCheckCustom = (value: any, label: string) => {
//   if (
//     value === undefined ||
//     value === "undefined" ||
//     value === null ||
//     value === "undefined"
//   ) {
//     return { status: true, msg: `${label} is required.` };
//   } else {
//     let notValid = stringCheckCustom(value, label);
//     if (notValid.status) {
//       return { status: notValid.status, msg: notValid.msg };
//     } else {
//       if (value.trim() === "") {
//         return { status: true, msg: `${label} is required.` };
//       }
//     }
//   }
//   return { status: false, msg: "" };
// };

const password = (value: string, helpers: any) => {
  if (value.length < 8) {
    return helpers.message("password must be at least 8 characters");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "password must contain at least 1 letter and 1 number"
    );
  }
  return value;
};

const checkEmptyBody = (req: any) => {
  let errorMsg: string[] = [];

  if (Object.keys(req.body).length === 0) {
    errorMsg.push(
      "Some data is required to add or update. Empty request found. "
    );
  }
  return errorMsg;
};

const checkValidKeys = (req: any, validKeys: string[]) => {
  let errorMsg: string[] = [];
  let bodyData = Object.keys(req.body);
  for (let key of bodyData) {
    if (!validKeys.includes(key)) {
      errorMsg.push(`Invalid key ${key}. `);
    }
  }
  return errorMsg;
};

const emailFormat = (value: string, helpers: any) => {
  if (!value.match(/^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i)) {
    return helpers.message("Email is invalid.");
  }
  return value;
};

const alphabetsOnly = (fieldName: string) => (value: string, helpers: any) => {
  if (!value.match(/^[a-zA-Z]+$/)) {
    return helpers.message(`Only alphabets allowed for ${fieldName}`);
  }
  return value;
};

const YYMMDDHHMMSS_format = (value: string, helpers: any) => {
  if (
    !value.match(
      /^(((\d\d)(([02468][048])|([13579][26]))-02-29)|(((\d\d)(\d\d)))-((((0\d)|(1[0-2]))-((0\d)|(1\d)|(2[0-8])))|((((0[13578])|(1[02]))-31)|(((0[1,3-9])|(1[0-2]))-(29|30)))))\s(([01]\d|2[0-3]):([0-5]\d):([0-5]\d))$/i
    )
  ) {
    return helpers.message(
      'Invalid format for date time.It must be "YYYY-MM-DD HH:mm:ss".'
    );
  }
  return value;
};

const dateFormat = (value: string, helpers: any) => {
  if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return helpers.message("Date format must be YYYY-MM-DD.");
  }
  return value;
};

const dateFormatWithTime = (value: string, helpers: any) => {
  if (!value.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
    return helpers.message("Date format must be YYYY-MM-DD HH:mm:ss.");
  }
  return value;
};

const changeDateFormat = (value: string, helpers: any) => {
  const zonedDate = toZonedTime(parseISO(value), "Asia/Kolkata");
  return format(zonedDate, "yyyy-MM-dd");
};

const timeFormat = (value: string, helpers: any) => {
  if (!value.match(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/)) {
    return helpers.message("Time format must be HH:MM AM/PM.");
  }
  return value;
};

const timeFormat24Hours = (value: string, helpers: any) => {
  if (!value.match(/^([01]\d|2[0-3]):?([0-5]\d)$/)) {
    return helpers.message("Time format must be of 24 hours.");
  }
  return value;
};

const HHMMSS_Format_check = (value: string, helpers: any) => {
  if (!value.match(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/)) {
    return helpers.message("Time format must be of HH:MM:SS.");
  }
  return value;
};

const parseStringifiedKeys = (req: any, validKeys: string[]) => {
  let errorMsg: string[] = [];
  for (let key in req.body) {
    if (validKeys.includes(key) && typeof req.body[key] === "string") {
      req.body[key] = JSON.parse(req.body[key]);
    }
  }
  return "";
};

const todayDateValid = (value: string, helpers: any) => {
  if (!isToday(parseISO(value))) {
    return helpers.message("Date must be Today.");
  }
  return value;
};

const DateTimeFormatValid = (value: string, helpers: any) => {
  if (
    !value.match(
      /^([0-9]{4})-([0-1][0-9])-([0-3][0-9])\s([0-1][0-9]|[2][0-3]):([0-5][0-9]):([0-5][0-9])$/
    )
  ) {
    return helpers.message("Time format must be YYYY-MM-DD HH:mm:ss.");
  }
  return value;
};

const afterTodayValid = (value: string, helpers: any) => {
  if (!isAfter(parseISO(value), new Date())) {
    return helpers.message(`Date must be after today's date.`);
  }
  return value;
};

const beforeTodayValid = (value: string, helpers: any) => {
  if (!isBefore(parseISO(value), new Date())) {
    return helpers.message(`Date must be before today's date.`);
  }
  return value;
};

const sameOrAfterToday = (value: string, helpers: any) => {
  if (compareAsc(parseISO(value), new Date()) < 0) {
    return helpers.message(`Date must be same or after today's date.`);
  }
  return value;
};

const sameorBeforeToday = (value: string, helpers: any) => {
  if (!isBefore(parseISO(value), new Date())) {
    return helpers.message(`Date must be before today's date.`);
  }
  return value;
};

const isAfterCurrentTime = (value: string, helpers: any) => {
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const currentTime = formatTZ(
    toZonedTime(new Date(), "Asia/Kolkata"),
    "yyyy-MM-dd HH:mm:ss",
    { timeZone: "Asia/Kolkata" }
  );
  const timeAndDate = format(
    parse(`${currentDate} ${value}`, "yyyy-MM-dd HH:mm:ss", new Date()),
    "yyyy-MM-dd HH:mm:ss"
  );
  if (!isAfter(parseISO(timeAndDate), parseISO(currentTime))) {
    return helpers.message(`Time must be after current time.`);
  }
  return value;
};

const dateTimeAfterCurrentTime = (value: string, helpers: any) => {
  const currentTime = formatTZ(
    toZonedTime(new Date(), "Asia/Kolkata"),
    "yyyy-MM-dd HH:mm:ss",
    { timeZone: "Asia/Kolkata" }
  );
  if (!isAfter(parseISO(value), parseISO(currentTime))) {
    return helpers.message(`Time must be after current time.`);
  }
  return value;
};

const checkYoutubeLink = (value: string, helpers: any) => {
  if (!value.match(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/)) {
    return helpers.message("Youtube link is not valid.");
  }
  return value;
};
const passwordCheck = (value: string, helpers: any) => {
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "Password must contain at least one letter and one number"
    );
  }

  return value;
};

export {
  objectId,
  password,
  checkValidKeys,
  checkEmptyBody,
  emailFormat,
  objectIdCustom,
  //   requiredCheckCustom,
  dateFormat,
  timeFormat,
  timeFormat24Hours,
  YYMMDDHHMMSS_format,
  indianPhone,
  parseStringifiedKeys,
  sameOrAfterToday,
  todayDateValid,
  afterTodayValid,
  beforeTodayValid,
  sameorBeforeToday,
  isAfterCurrentTime,
  checkYoutubeLink,
  changeDateFormat,
  accessactionNameCheck,
  accessMethodCheck,
  DateTimeFormatValid,
  dateTimeAfterCurrentTime,
  HHMMSS_Format_check,
  minValue,
  dateFormatWithTime,
  alphabetsOnly,
  passwordCheck,
};
