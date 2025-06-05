//token types
export enum TokenEnum {
  Refresh = "REFRESH",
  Access = "ACCESS",
  OtpVerify = "OTP_VERIFY",
  PasswordReset = "PASSWORD_RESET",
}

//file types
export enum AllFileEnum {
  Image = "IMAGE",
  Document = "DOCUMENT",
  Video = "VIDEO",
}

//Tax types
export enum TaxTypeEnum {
  vat = "VAT",
  igst = "IGST",
  cgst = "CGST",
  sgst = "SGST",
}

//Discount types
export enum DiscountTypeEnum {
  percent = "PERCENT",
  flat = "FLAT",
}

//PaymentStatus types
export enum PaymentStatusTypeEnum {
  completed = "COMPLETED",
  pending = "PENDING",
}

//Coupon types
export enum CouponTypeEnum {
  couponCode = "COUPON_CODE",
  referralCode = "REFERRAL_CODE",
}
//GiftCard types
export enum GiftCardTypeEnum {
  whoeverBought = "WHOEVER_BOUGHT",
  specificCustomer = "SPECIFIC_CUSTOMER",
}

//Gender types
export enum GenderTypeEnum {
  male = "MALE",
  female = "FEMALE",
  other = "OTHER",
}

//Customer types
export enum CustomerTypeEnum {
  walkin = "WALKIN",
  regular = "REGULAR",
}
//user types
export enum UserEnum {
  Admin = "ADMIN",
  Employee = "EMPLOYEE",
  Customer = "CUSTOMER",
}

export enum ActionMethodEnum {
  add = "post",
  update = "put",
  delete = "delete",
  change_status = "put",
  all_list = "get",
  all_list_pagination_filter = "post",
  view = "get",
}

export enum ItemTypeEnum {
  service = "SERVICE",
  product = "PRODUCT",
}

export enum TransactionTypeEnum {
  credit = "CREDIT",
  debit = "DEBIT",
}

export enum AllFileTypeEnum {
  image = "IMAGE",
  document = "DOCUMENT",
  video = "VIDEO",
}

export enum TicketTypeEnum {
  refund = "REFUND",
  complain = "COMPLAIN",
  general = "GENERAL",
}
