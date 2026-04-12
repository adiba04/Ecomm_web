import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';

const routes: Routes = [{ path: '', component: ProfilePageComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}
