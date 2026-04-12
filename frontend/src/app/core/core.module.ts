import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';

@NgModule({
  declarations: [NavbarComponent],
  imports: [CommonModule, RouterModule],
  exports: [NavbarComponent]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule | null) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only.');
    }
  }
}
