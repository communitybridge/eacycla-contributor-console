// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from './shared/shared.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoaderInterceptorService } from './shared/services/loader-interceptor.service';
import { AlertService } from './shared/services/alert.service';
import { AlertComponent } from './shared/components/alert/alert.component';
import { IndividualContributorModule } from './modules/individual-contributor/individual-contributor.module';
import { CorporateContributorModule } from './modules/corporate-contributor/corporate-contributor.module';
import { FormsModule } from '@angular/forms';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { EnvConfig } from './config/cla-env-utils';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [AppComponent, AlertComponent],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    SharedModule,
    DashboardModule,
    IndividualContributorModule,
    CorporateContributorModule,
    FormsModule,
    AuthModule.forRoot({
      domain: EnvConfig.default['auth0-domain'],
      clientId: EnvConfig.default['auth0-clientId'],
      redirectUri: window.location.origin + '/#/auth',
      audience: environment.auth0Audience,
      httpInterceptor: {
        allowedList: [
          EnvConfig.default['api-base'] + '/*',
          EnvConfig.default['api-v4-base'] + '/*',
        ],
      },
      useRefreshTokens: true,
      useRefreshTokensFallback: true,
      useCookiesForTransactions: true,
      scope: 'access:api openid email profile',
    }),
    FormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true,
      
    },
    AlertService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
