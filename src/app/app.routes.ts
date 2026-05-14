import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Active } from './features/auth/active/active';
import { Forgot } from './features/auth/forgot/forgot';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './features/dashboard/dashboard';
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
        path:'tours',
        component:TourList
      },
      {
        path:'tour/:id',
        component:TourDetail
      },
      {
        path:'checkout/:code',
        component:Checkout
      }
    ]
  },
  {
    path: 'profile',
    component: Profile,
    children: [
      { path: 'info', component: ProfileInfo },
      { path: 'security', component: Security },
      { path: 'trips', component: MyTrips },
      { path: 'payments', component: PaymentMethods },
      { path: '', redirectTo: 'info', pathMatch: 'full' },
      {
        path: 'trip/:id',
        component: MyTrip
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];