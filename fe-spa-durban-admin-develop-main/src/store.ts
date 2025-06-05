import ProductSlice from './modules/Product/slice/ProductSlice';
import { configureStore } from '@reduxjs/toolkit';
import AuthSlice from './slices/AuthSlice';
import SideNavLayoutSlice from './slices/SideNavLayoutSlice';
import apiSlice from './services/ApiSlice';
import { fileExplorerSlice } from './services/FileExplorer';
import { authMiddleware } from './middlewares/authMiddleware';
import { setupListeners } from '@reduxjs/toolkit/query';
import TaxSlice from './modules/Tax/slice/TaxSlice';
import MeasurmentUnitSlice from './modules/MeasurmentUnit/slice/MeasurmentUnitSlice';
import PaymentModeSlice from './modules/PaymentMode/slice/PaymentModeSlice';
import UserProfileSlice from './modules/UserProfile/slice/UserProfileSlice';
import CartSlice from './modules/POS/slice/CartSlice';
import SubCategorySlice from './modules/SubCategory/slice/SubCategorySlice';
import GiftCardSlice from './modules/GiftCard/slice/GiftCardSlice';
import BrandSlice from './modules/Brand/slice/BrandSlice';
import OutletSlice from './modules/Outlet/slice/OutletSlice';
import ServiceSlice from './modules/Service/slice/ServiceSlice';
import CouponSlice from './modules/Coupon/slice/CouponSlice';
import LoyaltySlice from './modules/Loyalty/slice/LoyaltySlice';
import InventorySlice from './modules/Inventory/slice/InventorySlice';
import CategorySlice from './modules/Category/slice/CategorySlice';
import EmployeeSlice from './modules/Employee/slice/EmployeeSlice';
import PurchaseOrderSlice from './modules/PurchaseOrder/slice/PurchaseOrderSlice';
import SupplierSlice from './modules/Supplier/slice/SupplierSlice';
import OutletInventorySlice from './modules/OutletInventory/slice/OutletInventorySlice';
import AccountSlice from './modules/Account/slice/AccountSlice';
import CustomerSlice from './modules/Customer/slice/CustomerSlice';
import InvoicesSlice from './modules/Invoices/slice/InvoicesSlice';
import DashboardSlice from './modules/Dashboard/slice/DashboardSlice';
import TopCustomerAndProductsSlice from './modules/TopCustomerAndProducts/slice/TopCustomerAndProductsSlice';
import TaskSlice from './modules/Task/slice/TaskSlice';
import TicketSlice from './modules/Ticket/slice/TicketSlice';
import RegisterSlice from './modules/OpenRegister/slice/OpenRegisterSlice';
// Import New Slice Above

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    sideNavLayout: SideNavLayoutSlice,
    product: ProductSlice,
    measurmentunit: MeasurmentUnitSlice,
    paymentmode: PaymentModeSlice,
    userprofile: UserProfileSlice,
    category: CategorySlice,
    subcategory: SubCategorySlice,
    giftcard: GiftCardSlice,
    brand: BrandSlice,
    tax: TaxSlice,
    outlet: OutletSlice,
    service: ServiceSlice,
    coupon: CouponSlice,
    cart: CartSlice,
    loyalty: LoyaltySlice,
    employee: EmployeeSlice,
    inventory: InventorySlice,
    purchaseorder: PurchaseOrderSlice,
    supplier: SupplierSlice,
    outletinventory: OutletInventorySlice,
    account: AccountSlice,
    customer: CustomerSlice,
    dashboard: DashboardSlice,
    invoices: InvoicesSlice,
    topcustomerandproducts: TopCustomerAndProductsSlice,
    task: TaskSlice,
    ticket: TicketSlice,
    register: RegisterSlice,
    // Add More Slice Above

    [apiSlice.reducerPath]: apiSlice.reducer,
    [fileExplorerSlice.reducerPath]: fileExplorerSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat([
      // authMiddleware,
      apiSlice.middleware,
      fileExplorerSlice.middleware,
    ]),
});

setupListeners(store.dispatch);
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
