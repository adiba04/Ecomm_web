import { NgModule } from '@angular/core';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, ForgotPasswordComponent, ResetPasswordComponent],
  imports: [SharedModule, AuthRoutingModule]
})
export class AuthModule {}
