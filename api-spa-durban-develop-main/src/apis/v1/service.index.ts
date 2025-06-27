import * as authService from "./auth/service.auth";
import * as tokenService from "./token/service.token";
import * as redisService from "./token/service.redis";
import * as userService from "./user/service.user";
import * as roleService from "./role/service.role";
import * as outletService from "./outlet/service.outlet";
import * as accountService from "./account/service.account";
import * as brandService from "./brand/service.brand";
import * as categoryService from "./category/service.category";
import * as couponService from "./coupon/service.coupon";
import * as customerService from "./customer/service.customer";
import * as customerGroupService from "./customerGroup/service.customerGroup";
import * as employeeService from "./employee/service.employee";
import * as giftCardService from "./giftCard/service.giftCard";
import * as inventoryService from "./inventory/service.inventory";
import * as invoiceService from "./invoice/service.invoice";
import * as draftService from "./draft/service.draft";
import * as loyaltyService from "./loyalty/service.loyalty";
import * as loyaltyLogService from "./loyaltyLog/service.loyaltyLog";
import * as measurementUnitService from "./measurementUnit/service.measurementUnit";
import * as paymentModeService from "./paymentMode/service.paymentMode";
import * as productService from "./product/service.product";
import * as purchaseOrderService from "./purchaseOrder/service.purchaseOrder";
import * as serviceService from "./service/service.service";
import * as subCategoryService from "./subCategory/service.subCategory";
import * as supplierService from "./supplier/service.supplier";
import * as taxService from "./tax/service.tax";
import * as poLogsService from "./poLogs/service.poLogs";
import * as invoiceLogService from "./invoiceLogs/service.invoiceLogs";
import * as loyaltyWalletService from "./loyaltyWallet/service.loyaltyWallet";
import * as analyticsService from "./analytics/service.analytics";
import * as taskService from "./task/service.task";
import * as ticketService from "./ticket/service.ticket";
import * as cashbackService from "./cashback/service.cashback";
import * as rewardsCouponService from "./rewardscoupon/service.rewardscoupon";
import * as promotionCouponService from "./promotioncoupon/service.promotioncoupon";
import * as registerService from "./register/service.register";
import * as companyService from "./company/service.company"
export {
  authService,
  tokenService,
  redisService,
  userService,
  roleService,
  outletService,
  accountService,
  brandService,
  categoryService,
  couponService,
  customerService,
  customerGroupService,
  employeeService,
  giftCardService,
  inventoryService,
  invoiceService,
  draftService,
  loyaltyService,
  loyaltyLogService,
  measurementUnitService,
  paymentModeService,
  productService,
  purchaseOrderService,
  serviceService,
  subCategoryService,
  supplierService,
  taxService,
  invoiceLogService,
  poLogsService,
  loyaltyWalletService,
  analyticsService,
  taskService,
  ticketService,
  cashbackService,
  rewardsCouponService,
  promotionCouponService,
  registerService,
  companyService
};
