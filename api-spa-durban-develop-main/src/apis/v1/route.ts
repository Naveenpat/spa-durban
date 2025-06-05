import express, { Router } from "express";
import config from "../../../config/config";
import docsRoute from "./docRoute";
import userRoute from "./user/route.user";
import authRoute from "./auth/route.auth";
import categoryRoute from "./category/route.category";
import accountRoute from "./account/route.account";
import roleRoute from "./role/route.role";
import outletRoute from "./outlet/route.outlet";
import subCategoryRoute from "./subCategory/route.subCategory";
import employeeRoute from "./employee/route.employee";
import measurementUnitRoute from "./measurementUnit/route.measurementUnit";
import brandRoute from "./brand/route.brand";
import paymentModeRoute from "./paymentMode/route.paymentMode";
import productRoute from "./product/route.product";
import supplierRoute from "./supplier/route.supplier";
import taxRoute from "./tax/route.tax";
import serviceRoute from "./service/route.service";
import purchaseOrderRoute from "./purchaseOrder/route.purchaseOrder";
import inventoryRoute from "./inventory/route.inventory";
import customerRoute from "./customer/route.customer";
import customerGroupRoute from "./customerGroup/route.customerGroup";
import couponRoute from "./coupon/route.coupon";
import giftCardRoute from "./giftCard/route.giftCard";
import loyaltyRoute from "./loyalty/route.loyalty";
import invoiceRoute from "./invoice/route.invoice";
import poLogsRoute from "./poLogs/route.poLogs";
import invoiceLogRoute from "./invoiceLogs/route.invoiceLogs";
import dashboardRoute from "./dashboard/route.dashboard";
import draftRoute from "./draft/route.draft";
import analyticsRoute from "./analytics/route.analytics";
import emailRoute from "./email/route.email";
import taskRoute from "./task/route.task";
import ticketRoute from "./ticket/route.ticket";
import cashbackRoute from "./cashback/route.cashback";
import rewardscouponRoute from "./rewardscoupon/route.rewardscoupon";
import promotioncouponRoute from "./promotioncoupon/route.promotioncoupon";
import registerRoute from "./register/route.register";
const router: Router = express.Router();
const devRoutes: { path: string; route: Router }[] = [
  // routes available only in development mode
  {
    path: "/docs",
    route: docsRoute,
  },
];

const defaultRoutes: { path: string; route: Router }[] = [
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/category",
    route: categoryRoute,
  },
  {
    path: "/account",
    route: accountRoute,
  },
  {
    path: "/role",
    route: roleRoute,
  },
  {
    path: "/outlet",
    route: outletRoute,
  },
  {
    path: "/subcategory",
    route: subCategoryRoute,
  },
  {
    path: "/employee",
    route: employeeRoute,
  },
  {
    path: "/measurement-unit",
    route: measurementUnitRoute,
  },
  {
    path: "/brand",
    route: brandRoute,
  },
  {
    path: "/payment-mode",
    route: paymentModeRoute,
  },
  {
    path: "/product",
    route: productRoute,
  },
  {
    path: "/supplier",
    route: supplierRoute,
  },
  {
    path: "/tax",
    route: taxRoute,
  },
  {
    path: "/service",
    route: serviceRoute,
  },
  {
    path: "/purchase-order",
    route: purchaseOrderRoute,
  },
  {
    path: "/inventory",
    route: inventoryRoute,
  },
  {
    path: "/customer",
    route: customerRoute,
  },
  {
    path: "/customer-group",
    route: customerGroupRoute,
  },
  {
    path: "/coupon",
    route: couponRoute,
  },
  {
    path: "/gift-card",
    route: giftCardRoute,
  },
  {
    path: "/loyalty",
    route: loyaltyRoute,
  },
  {
    path: "/invoice",
    route: invoiceRoute,
  },
  {
    path: "/invoice-logs",
    route: invoiceLogRoute,
  },
  {
    path: "/po-logs",
    route: poLogsRoute,
  },
  {
    path: "/dashboard",
    route: dashboardRoute,
  },
  {
    path: "/draft",
    route: draftRoute,
  },
  {
    path: "/analytics",
    route: analyticsRoute,
  },
  {
    path: "/email",
    route: emailRoute,
  },
  {
    path: "/task",
    route: taskRoute,
  },
  {
    path: "/ticket",
    route: ticketRoute,
  },
  {
    path: "/cashback",
    route: cashbackRoute,
  },
  {
    path: "/rewardscoupon",
    route: rewardscouponRoute,
  },
  {
    path: "/promotioncoupon",
    route: promotioncouponRoute,
  },
  {
    path: "/register",
    route: registerRoute,
  },
];

// Apply default routes
defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
