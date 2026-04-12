import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AuthSessionInterceptor } from './core/interceptors/auth-session.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, CoreModule, AppRoutingModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthSessionInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
