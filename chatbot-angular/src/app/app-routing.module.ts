import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './account/login.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { AppRouteGuard } from './account/auth/auth-route-guard';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'chatbot',
    pathMatch: 'full'
  },
  {
    path: 'chatbot',
    canActivate: [AppRouteGuard],
    component: ChatbotComponent,
    data: { preload: true }
  },
  {
    path: 'login',
    component: LoginComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
