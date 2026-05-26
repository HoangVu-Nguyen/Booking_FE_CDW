import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Active } from './features/auth/active/active';
import { Forgot } from './features/auth/forgot/forgot';
import { MainLayout } from './layout/main-layout/main-layout';
import { CallbackComponent } from './features/auth/callback/callback.component';
import { HomestayList } from './features/homestay/homestay-list/homestay-list';
import { Discover } from './features/discover/discover';
import { HomestayDetail } from './features/homestay/pages/homestay-detail/homestay-detail';
import { Profile } from './features/profile/profile';
import { ProfileInfo } from './features/profile/components/profile-info/profile-info';
import { Security } from './features/profile/components/security/security';
import { MyTrips } from './features/profile/components/my-trips/my-trips';
import { PaymentMethods } from './features/profile/components/payment-methods/payment-methods';
import { MyTrip } from './features/profile/components/my-trip/my-trip';
import { TourDetail } from './features/tour/pages/tour-detail/tour-detail';
import { TourList } from './features/tour/tour-list/tour-list';
import { Checkout } from './features/checkout/checkout';
import { PaymentResult } from './features/checkout/components/payment-result/payment-result';
import { TripCard } from './features/profile/components/my-trips/components/trip-card/trip-card';
import { TripList } from './features/profile/components/my-trips/components/trip-list/trip-list';
import { Host } from '@angular/core';
import { HostDashboard } from './features/host-dashboard/host-dashboard';
import { HomestayWishlist } from './features/homestay-wishlist/homestay-wishlist';
import { HomestayListManager } from './features/host-dashboard/components/homestay-list-manager/homestay-list-manager';
import { BookingList } from './features/host-dashboard/components/booking-list/booking-list';
import { HostWallet } from './features/host-dashboard/components/host-wallet/host-wallet';
import { AdminDashboard } from './features/admin-dashboard/admin-dashboard';
import { AdminWalletApproval } from './features/admin-dashboard/components/admin-wallet-approval/admin-wallet-approval';
import { Transactions } from './features/admin-dashboard/components/transactions/transactions';
import { Hosts } from './features/admin-dashboard/components/hosts/hosts';
import { Dashboard } from './features/admin-dashboard/components/dashboard/dashboard';
import { Portfolio } from './features/host-dashboard/components/portfolio/portfolio';
import { CalendarPricing } from './features/host-dashboard/components/calendar-pricing/calendar-pricing';
import { InvoiceHistory } from './features/profile/components/invoice-history/invoice-history';
import { Inbox } from './features/host-dashboard/components/inbox/inbox';

export const routes: Routes = [
  // 1. NHÓM KHÔNG CÓ LAYOUT (Auth)
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'active', component: Active },
  { path: 'forgot', component: Forgot },
  { path: 'callback', component: CallbackComponent },

  // 2. NHÓM DÙNG MAIN LAYOUT
  {
    path: '',
    component: MainLayout,
    children: [
      // Vào thẳng localhost:4200 -> đá sang localhost:4200/home
      { path: '', redirectTo: 'discover', pathMatch: 'full' },
      { path: 'homestays', component: HomestayList, title: 'World Feed - Clyvasync' },
      { path: 'discover', component: Discover, title: 'World Feed - Clyvasync' },
      {
        path: 'homestay/:id',
        component: HomestayDetail,
        title: 'Chi tiết Homestay - Clyvasync'
      },
      {
        path: 'tours',
        component: TourList
      },

      {
        path: 'tour/:id',
        component: TourDetail
      },
      {
        path: 'checkout/:code',
        component: Checkout
      },
      {
        path: 'payment-result',
        component: PaymentResult
      },
      {
        path: 'wishlist',
        component: HomestayWishlist,
        title: 'Yêu thích - Clyvasync'
      },
      {
        path: 'admin',
        component: AdminDashboard,
        title: 'Dashboard - Clyvasync',
        children: [
          {
            path: 'dashboard',
            component: Dashboard,
            title: 'Tổng quan - Admin Dashboard - Clyvasync'
          },
          {
            path: 'wallet-approvals',
            component: AdminWalletApproval,
            title: 'Duyệt rút tiền - Admin Dashboard - Clyvasync'
          },
          {
            path: 'transactions',
            component: Transactions,
            title: 'Giao dịch - Admin Dashboard - Clyvasync'
          },
          {
            path: 'hosts',
            component: Hosts,
            title: 'Quản lý Host - Admin Dashboard - Clyvasync'
          }
        ]
      },
      {
        path: 'profile',
        component: Profile,
        children: [
          { path: 'info', component: ProfileInfo },
          { path: 'security', component: Security },
          {
            path: 'favorites', component: HomestayWishlist, title: 'Yêu thích - Clyvasync'
          },
          {
            path: 'trips', component: MyTrips,
            children: [
              { path: '', component: TripList },
            ]
          },
          { path: 'payments', component: PaymentMethods },
          { path: '', redirectTo: 'info', pathMatch: 'full' },
          {
            path: 'trip/:code',
            component: MyTrip
          },
          {
            path: 'invoices',
            component: InvoiceHistory
          }
        ]
      }, {
        path: 'host-dashboard', component: HostDashboard, title: 'Host Dashboard - Clyvasync',
        children: [
          {
            path: '', redirectTo: 'overview', pathMatch: 'full'
          }, {
            path: 'portfolio', component: Portfolio, title: 'Danh mục homestay - Host Dashboard - Clyvasync'
          },
          {
            path: 'overview', component: HomestayListManager, title: 'Danh sách homestay - Host Dashboard - Clyvasync'
          }, {
            path: 'bookings', component: BookingList, title: 'Danh sách đặt phòng - Host Dashboard - Clyvasync'
          },
          {
            path: 'wallet', component: HostWallet, title: 'Ví / Doanh thu - Host Dashboard - Clyvasync'
          },
          {
            path: 'calendar/:homestayId',
            component: CalendarPricing

          },
          {
            path: 'inbox',
            component: Inbox,
            title: 'Hộp thư - Host Dashboard - Clyvasync'
          }
        ]
      }
    ]
  },


  { path: '**', redirectTo: 'login' }
];