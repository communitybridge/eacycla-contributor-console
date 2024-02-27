// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Component } from '@angular/core';
import { AppSettings } from './config/app-settings';
import { LfxHeaderService } from './shared/services/lfx-header.service';
import { EnvConfig } from './config/cla-env-utils';
import { environment } from 'src/environments/environment';
import { AuthService } from '@auth0/auth0-angular';
import { StorageService } from './shared/services/storage.service';
import { User } from '@auth0/auth0-spa-js';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'easycla-contributor-console';
  hasExpanded: boolean;
  links: any[];
  constructor(
    private lfxHeaderService: LfxHeaderService,
    private authService: AuthService,
    private storageService: StorageService
  ) {
    this.authService.isAuthenticated$.subscribe((valid) => {
      if (!valid) {
        this.authService.loginWithRedirect();
      }
    });
  }

  onToggled() {
    this.hasExpanded = !this.hasExpanded;
  }

  ngOnInit() {
    this.mountHeader();
    this.hasExpanded = true;
    this.mountFooter();
    this.auth0Login();
  }

  private mountHeader(): void {
    const script = document.createElement('script');
    script.setAttribute('src', environment.lfxHeader + '/lfx-header-v2.js');
    script.setAttribute('async', 'true');
    document.head.appendChild(script);
  }

  private mountFooter(): void {
    const script = document.createElement('script');
    script.setAttribute('src', EnvConfig.default[AppSettings.LFX_FOOTER]);
    document.head.appendChild(script);
  }

  private auth0Login() {
    this.authService.user$
      .pipe(take(1))
      .subscribe((sessionData: User | undefined | null) => {
        if (sessionData) {
          this.lfxHeaderService.setUserInLFxHeader();
          this.storageService.setItem(AppSettings.AUTH_DATA, sessionData);
        }
      });
  }
}
