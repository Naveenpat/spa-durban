import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper/AuthWrapper';
import ErrorPage from './components/ErrorPage';
import SideNavLayout from './components/layouts/SideNavLayout/SideNavLayout';
import AddAdminRoleFormWrapper from './modules/AdminRole/screens/Add/AddAdminRoleFormWrapper';
import EditAdminRoleFormWrapper from './modules/AdminRole/screens/Edit/EditAdminRoleFormWrapper';
import AdminRoleListingWrapper from './modules/AdminRole/screens/List/AdminRoleListingWrapper';

import AddEmployeeFormWrapper from './modules/Employee/screens/Add/AddEmployeeFormWrapper';
import EditEmployeeFormWrapper from './modules/Employee/screens/Edit/EditEmployeeFormWrapper';
import EmployeeListingWrapper from './modules/Employee/screens/List/EmployeeListingWrapper';
import GiftCardListingWrapper from './modules/GiftCard/screens/List/GiftCardListingWrapper';
import AddLoyaltyFormWrapper from './modules/Loyalty/screens/Add/AddLoyaltyFormWrapper';
import LoyaltyListingWrapper from './modules/Loyalty/screens/List/LoyaltyListingWrapper';
import CashBackListingWrapper from './modules/CashbackRules/screens/List/CashBackListingWrapper';
import AddCashBackFormWrapper from './modules/CashbackRules/screens/Add/AddCashBackFormWrapper';
import EditCashBackFormWrapper from './modules/CashbackRules/screens/Edit/EditCashBackFormWrapper';
import RewardsCouponListingWrapper from './modules/RewardsCoupon/screens/List/RewardsCouponListingWrapper';
import AddRewardsCouponFormWrapper from './modules/RewardsCoupon/screens/Add/AddRewardsCouponFormWrapper';
import EditRewardsCouponFormWrapper from './modules/RewardsCoupon/screens/Edit/EditRewardsCouponFormWrapper';
import PromotionCouponsListingWrapper from './modules/PromotionCoupons/screens/List/PromotionCouponsListingWrapper';
import AddPromotionCouponsFormWrapper from './modules/PromotionCoupons/screens/Add/AddPromotionCouponsFormWrapper';
import EditPromotionCouponsFormWrapper from './modules/PromotionCoupons/screens/Edit/EditPromotionCouponsFormWrapper';
import POSWrapper from './modules/POS/POSWrapper';
import InventoryFormWrapper from './modules/PurchaseOrder/components/InventoryForm/InventoryFormWrapper';
import PurchaseOrderView from './modules/PurchaseOrder/components/View/PurchaseOrderView';
import AddPurchaseOrderFormWrapper from './modules/PurchaseOrder/screens/Add/AddPurchaseOrderFormWrapper';
import PurchaseOrderListingWrapper from './modules/PurchaseOrder/screens/List/PurchaseOrderListingWrapper';
import AddSupplierFormWrapper from './modules/Supplier/screens/Add/AddSupplierFormWrapper';
import EditSupplierFormWrapper from './modules/Supplier/screens/Edit/EditSupplierFormWrapper';
import InventoryListingWrapper from './modules/Inventory/screens/List/InventoryListingWrapper';
import OutletInventoryListingWrapper from './modules/OutletInventory/screens/List/OutletInventoryListingWrapper';
import AddProductFormWrapper from './modules/Product/screens/Add/AddProductFormWrapper';
import EditProductFormWrapper from './modules/Product/screens/Edit/EditProductFormWrapper';
import LoginFormWrapper from './modules/Login/LoginFormWrapper';
import ProductListingWrapper from './modules/Product/screens/List/ProductListingWrapper';
import CategoryListingWrapper from './modules/Category/screens/List/CategoryListingWrapper';
import SubCategoryListingWrapper from './modules/SubCategory/screens/List/SubCategoryListingWrapper';
import BrandListingWrapper from './modules/Brand/screens/List/BrandListingWrapper';
import TaxListingWrapper from './modules/Tax/screens/List/TaxListingWrapper';
import OutletListingWrapper from './modules/Outlet/screens/List/OutletListingWrapper';
import AddOutletFormWrapper from './modules/Outlet/screens/Add/AddOutletFormWrapper';
import EditOutletFormWrapper from './modules/Outlet/screens/Edit/EditOutletFormWrapper';
import ServiceListingWrapper from './modules/Service/screens/List/ServiceListingWrapper';
import AddServiceFormWrapper from './modules/Service/screens/Add/AddServiceFormWrapper';
import EditServiceFormWrapper from './modules/Service/screens/Edit/EditServiceFormWrapper';
import CouponListingWrapper from './modules/Coupon/screens/List/CouponListingWrapper';
import MeasurmentUnitListingWrapper from './modules/MeasurmentUnit/screens/List/MeasurmentUnitListingWrapper';
import PaymentModeListingWrapper from './modules/PaymentMode/screens/List/PaymentModeListingWrapper';
import EditUserProfileFormWrapper from './modules/UserProfile/screens/Edit/EditUserProfileFormWrapper';
import UserProfileLayout from './modules/UserProfile/screens/Layout/UserProfileLayout';
import AccountListingWrapper from './modules/Account/screens/List/AccountListingWrapper';

import CustomerListingWrapper from './modules/Customer/screens/List/CustomerListingWrapper';
import AddCustomerFormWrapper from './modules/Customer/screens/Add/AddCustomerFormWrapper';
import EditCustomerFormWrapper from './modules/Customer/screens/Edit/EditCustomerFormWrapper';

import EditLoyaltyFormWrapper from './modules/Loyalty/screens/Edit/EditLoyaltyFormWrapper';
import InvoicesListingWrapper from './modules/Invoices/screens/List/InvoicesListingWrapper';
import DashboardWrapper from './modules/Dashboard/screens/List/DashboardWrapper';
import SupplierListingWrapper from './modules/Supplier/screens/List/SupplierListingWrapper';
import Receipt from './modules/Invoices/components/Receipt/Receipt';
import TopCustomerAndProductsListingWrapper from './modules/TopCustomerAndProducts/screens/List/TopCustomerAndProductsListingWrapper';
import SalesComparisonListingWrapper from './modules/salesComparison/screens/List/SalesComparisonListingWrapper';
import TaskListingWrapper from './modules/Task/screens/List/TaskListingWrapper';
import TicketListingWrapper from './modules/Ticket/screens/List/TicketListingWrapper';
import CompanyListingWrapper from './modules/AdminRole copy/screens/List/CompanyWrapper';
import CompanyFormWrapper from './modules/AdminRole copy/screens/Add/CompanyFormWrapper';
import EditCompanyFormWrapper from './modules/AdminRole copy/screens/Edit/EditCompanyFormWrapper';
import ClaimPage from './utils/ClaimPage';
import CustomerGroupListingWrapper from './modules/CashbackRules copy/screens/List/CustomerGroupListingWrapper';
import AddCustomerGroupFormWrapper from './modules/CashbackRules copy/screens/Add/AddCustomerGroupFormWrapper';
import EditCustomerGroupFormWrapper from './modules/CashbackRules copy/screens/Edit/EditCustomerGroupFormWrapper';
import SalesReportPage from './modules/Outlet/screens/sales-report/SalesReportPage';
import CustomerSalesReportPage from './modules/Customer/screens/customer-sales-report/CustomerSalesReportPage';
import ViewCustomerFormWrapper from './modules/Customer/screens/View/ViewCustomerFormWrapper';

type Props = {};

const PageRoutes = (props: Props) => {
  const router = createBrowserRouter([
    {
      path: '/login',
      element: <LoginFormWrapper />,
    },
    {
      path: '/rewards/claim',
      element: <ClaimPage />,
    },
    {
      path: '/invoice/receipt/:id',
      element: <Receipt />,
    },
    {
      path: '/',
      element: (
        <AuthWrapper>
          <SideNavLayout />
        </AuthWrapper>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/dashboard',
          element: <DashboardWrapper />,
        },
        {
          path: '/user-profile',
          element: <UserProfileLayout />,
        },
        {
          path: '/user-profile/:userId',
          element: <EditUserProfileFormWrapper />,
        },
        {
          path: '/admin-role',
          element: <AdminRoleListingWrapper />,
        },
        {
          path: '/customer-group',
          element: <CustomerGroupListingWrapper />,
        },
        {
          path: '/customer-group/add',
          element: <AddCustomerGroupFormWrapper />,
        },
        { path: '/customer-group/edit/:id', element: <EditCustomerGroupFormWrapper /> },
        {
          path: '/company',
          element: <CompanyListingWrapper />,
        },
        {
          path: '/company/add-company',
          element: <CompanyFormWrapper />,
        },
        {
          path: '/admin-role/add-admin-role',
          element: <AddAdminRoleFormWrapper />,
        },
        { path: '/company/edit/:id', element: <EditCompanyFormWrapper /> },
        { path: '/admin-role/edit/:id', element: <EditAdminRoleFormWrapper /> },
        { path: '/outlets', element: <OutletListingWrapper /> },
        { path: '/outlet/add', element: <AddOutletFormWrapper /> },
        { path: '/outlet/edit/:id', element: <EditOutletFormWrapper /> },
        { path: '/outlet/sales-report/:id', element: <SalesReportPage /> },
        {
          path: '/brand',
          element: (
            <>
              <BrandListingWrapper />
            </>
          ),
        },
        { path: '/category', element: <CategoryListingWrapper /> },
        { path: '/sub-category', element: <SubCategoryListingWrapper /> },
        { path: '/taxes', element: <TaxListingWrapper /> },
        {
          path: '/measurement-unit',
          element: <MeasurmentUnitListingWrapper />,
        },
        { path: '/payment-mode', element: <PaymentModeListingWrapper /> },
        { path: '/product', element: <ProductListingWrapper /> },
        { path: '/product/add', element: <AddProductFormWrapper /> },
        { path: '/product/edit/:id', element: <EditProductFormWrapper /> },
        { path: '/service', element: <ServiceListingWrapper /> },
        { path: '/service/add', element: <AddServiceFormWrapper /> },
        {
          path: '/service/edit/:serviceId',
          element: <EditServiceFormWrapper />,
        },
        { path: '/inventory', element: <InventoryListingWrapper /> },
        {
          path: '/outletinventory',
          element: <OutletInventoryListingWrapper />,
        },
        { path: '/coupons', element: <CouponListingWrapper /> },
        {
          path: '/loyalty',
          element: <LoyaltyListingWrapper />,
        },
        {
          path: '/loyalty/add',
          element: <AddLoyaltyFormWrapper />,
        },
        {
          path: '/loyalty/edit/:id',
          element: <EditLoyaltyFormWrapper />,
        },
        {
          path: '/cashback-rules',
          element: <CashBackListingWrapper />,
        },
        {
          path: '/cashback/add',
          element: <AddCashBackFormWrapper />,
        },
        {
          path: '/cashback/edit/:id',
          element: <EditCashBackFormWrapper />,
        },
        {
          path: '/rewards-coupon',
          element: <RewardsCouponListingWrapper />,
        },
        {
          path: '/rewards-coupon/add',
          element: <AddRewardsCouponFormWrapper />,
        },
        {
          path: '/rewards-coupon/edit/:id',
          element: <EditRewardsCouponFormWrapper />,
        },
        {
          path: '/promotion-coupons',
          element: <PromotionCouponsListingWrapper />,
        },
        {
          path: '/promotion-coupons/add',
          element: <AddPromotionCouponsFormWrapper />,
        },
        {
          path: '/promotion-coupons/edit/:id',
          element: <EditPromotionCouponsFormWrapper />,
        },

        {
          path: '/gift-card',
          element: <GiftCardListingWrapper />,
        },
        // Purchase Order
        {
          path: '/purchase-order',
          element: <PurchaseOrderListingWrapper />,
        },
        {
          path: '/purchase-order/add',
          element: <AddPurchaseOrderFormWrapper />,
        },
        {
          path: '/purchase-order/view/:id',
          element: <PurchaseOrderView />,
        },
        {
          path: '/productform/:id',
          element: <InventoryFormWrapper />,
        },
        {
          path: '/supplier',
          element: <SupplierListingWrapper />,
        },
        { path: '/supplier/add', element: <AddSupplierFormWrapper /> },
        { path: '/supplier/edit/:id', element: <EditSupplierFormWrapper /> },
        {
          path: '/employee',
          element: <EmployeeListingWrapper />,
        },
        {
          path: '/employee/add',
          element: <AddEmployeeFormWrapper />,
        },
        {
          path: '/loyalty/add',
          element: (
            <>
              {' '}
              <AddLoyaltyFormWrapper />
            </>
          ),
        },
        { path: '/employee/edit/:id', element: <EditEmployeeFormWrapper /> },
        { path: '/account', element: <AccountListingWrapper /> },
        {
          path: '/customer',
          element: <CustomerListingWrapper />,
        },
        { path: '/customer/sales-report/:id', element: <CustomerSalesReportPage /> },
        {
          path: '/customer/add',
          element: <AddCustomerFormWrapper />,
        },
        {
          path: '/customer/edit/:id',
          element: <EditCustomerFormWrapper />,
        },
        {
          path: '/customer/view/:id',
          element: <ViewCustomerFormWrapper />,
        },
        {
          path: '/invoice',
          element: <InvoicesListingWrapper />,
        },
        {
          path: '/topcustomerandproducts',
          element: <TopCustomerAndProductsListingWrapper />,
        },
        {
          path: '/salescomparison',
          element: <SalesComparisonListingWrapper />,
        },
        {
          path: '/tasks',
          element: <TaskListingWrapper />,
        },
        {
          path: '/tickets',
          element: <TicketListingWrapper />,
        },
      ],
    },
    {
      path: '/pos',
      element: (
        <AuthWrapper>
          <POSWrapper />
        </AuthWrapper>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
};

export default PageRoutes;
