import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',  
  },

  {
    path: 'products',
    loadChildren: () => import('./products/products.component').then(m => m.ProductsComponent),
  },

  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.component').then(m => m.OrdersComponent),
  },

  {
    path: 'customers',
    loadChildren: () => import('./customers/customers.component').then(m => m.CustomersComponent),

  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
