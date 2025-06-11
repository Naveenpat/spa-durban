import {
  Icon,
  IconArrowUpRhombus,
  IconBasket,
  IconBrandCodesandbox,
  IconBuildingStore,
  IconBuildingWarehouse,
  IconCash,
  IconCashBanknote,
  IconCategory,
  IconCategoryPlus,
  IconDiscount,
  IconFileInvoice,
  IconHome,
  IconLayoutDistributeHorizontal,
  IconManualGearbox,
  IconOutbound,
  IconPaperclip,
  IconReceipt,
  IconReportAnalytics,
  IconRulerMeasure,
  IconSettings,
  IconShoppingCart,
  IconSubtask,
  IconTicket,
  IconUserCog,
  IconUserPlus,
  IconUsers,
  IconWallet,
  IconGiftFilled,
  IconCoins,
  IconReceiptTax,
} from '@tabler/icons-react';
import { PermissionType } from './utils/authorization';
import { getPermittedNavigations } from './utils/getPermittedNavigations';

export type GroupItemWithChildren = {
  title: string;
  icon: Icon;
  path?: never;
  searchParams?: never;
  children: GroupItem[];
  badgeContent?: string;
  permission?: PermissionType;
};

export type GroupItemWithPath = {
  title: string;
  icon: Icon;
  path: string;
  searchParams?: {
    [field: string]: string;
  };
  children?: never;
  badgeContent?: string;
  permission?: PermissionType;
};

export type GroupItem = GroupItemWithPath | GroupItemWithChildren;

export type NavigationItem = {
  groupLable: string;
  permissions?: PermissionType[];
  items: GroupItem[];
};

const navigation: (params?: {
  badgeData: { batches: string; courses: string };
}) => NavigationItem[] = (params) => {
  const navigations: NavigationItem[] = [
    {
      groupLable: 'Dashboard',
      items: [
        {
          title: 'Dashboard',
          icon: IconHome,
          path: 'dashboard',
          permission: 'NAV_DASHBOARD',
        },

        {
          title: 'Admin Role',
          icon: IconUserCog,
          path: 'admin-role',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_USER_ROLE',
        },
        {
          title: 'Purchase Order',
          icon: IconShoppingCart,
          path: 'purchase-order',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_PURCHASE_ORDER',
        },

        {
          title: 'Supplier',
          icon: IconManualGearbox,
          path: 'supplier',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_SUPPLIER',
        },
        {
          title: 'Customer',
          icon: IconUserPlus,
          path: 'customer',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_CUSTOMER',
        },
        {
          title: 'Invoice',
          icon: IconFileInvoice,
          path: 'invoice',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_INVOICE',
        },
        {
          title: 'Employee',
          icon: IconUsers,
          path: 'employee',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_EMPLOYEE',
        },
        {
          title: 'Top Customers And Products',
          icon: IconArrowUpRhombus,
          path: 'topcustomerandproducts',
          permission: 'NAV_TOP_CUSTOMERS_AND_PRODUCTS',
        },
        {
          title: 'Sales Comparison',
          icon: IconReportAnalytics,
          path: 'salescomparison',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_SALES_COMPARISON',
        },
        {
          title: 'Tasks',
          icon: IconSubtask,
          path: 'tasks',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_TASK',
        },
        {
          title: 'Tickets',
          icon: IconTicket,
          path: 'tickets',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_TICKET',
        },
      ],
    },
    {
      groupLable: 'Inventory',
      items: [
        {
          title: 'Product',
          icon: IconBasket,
          path: 'product',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_PRODUCT',
        },

        {
          title: 'Service',
          icon: IconSettings,
          path: 'service',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_SERVICE',
        },

        {
          title: 'Inventory',
          icon: IconBuildingWarehouse,
          path: 'inventory',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_INVENTORY',
        },

        {
          title: 'Outlet Inventory',
          icon: IconBuildingStore,
          path: 'outletinventory',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_OUTLET_INVENTORY',
        },
      ],
    },

    {
      groupLable: 'Marketing',
      items: [
        {
          title: 'Coupons',
          icon: IconDiscount,
          path: 'coupons',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_COUPONS_REFERRAL',
        },

        {
          title: 'Gift-Card',
          icon: IconOutbound,
          path: 'gift-card',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_GIFT_CARD',
        },

        {
          title: 'Loyalty',
          icon: IconPaperclip,
          path: 'loyalty',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_LOYALTY',
        },
        {
          title: 'Cashback Rules',
          icon: IconCoins,
          path: 'cashback-rules',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_CASHBACK_RULES',
        },
        {
          title: 'Rewards & Coupon',
          icon: IconGiftFilled,
          path: 'rewards-coupon',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_CASHBACK_RULES',
        },
        {
          title: 'Promotion Coupons',
          icon: IconReceiptTax,
          path: 'promotion-coupons',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_CASHBACK_RULES',
        },
      ],
    },

    {
      groupLable: 'Configuration',
      items: [
         {
          title: 'Company',
          icon: IconUserCog,
          path: 'company',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_COMPANY',
        },
        {
          title: 'Outlets',
          icon: IconLayoutDistributeHorizontal,
          path: 'outlets',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_OUTLET',
        },

        {
          title: 'Taxes',
          icon: IconReceipt,
          path: 'taxes',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_TAX',
        },

        {
          title: 'Category',
          icon: IconCategory,
          path: 'category',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_CATEGORY',
        },

        {
          title: 'Sub-Category',
          icon: IconCategoryPlus,
          path: 'sub-category',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_SUB_CATEGORY',
        },

        {
          title: 'Measurment Unit',
          icon: IconRulerMeasure,
          path: 'measurement-unit',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_MEASURMENT_UNIT',
        },

        {
          title: 'Payment Mode',
          icon: IconCash,
          path: 'payment-mode',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_PAYMENT_MODE',
        },

        {
          title: 'Brand',
          icon: IconBrandCodesandbox,
          path: 'brand',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_BRAND',
        },
        {
          title: 'Account',
          icon: IconWallet,
          path: 'account',
          searchParams: {
            page: '1',
            limit: '10',
          },
          permission: 'NAV_ACCOUNT',
        },

        {
          title: 'POS',
          icon: IconCashBanknote,
          path: 'pos',
          searchParams: {
            page: '1',
            limit: '10',
          },
          // permission: 'NAV_POS',
        },
      ],
    },
  ];

  return getPermittedNavigations(navigations);
};

export default navigation;
