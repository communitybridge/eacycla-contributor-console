// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Injectable } from '@angular/core';
import { EnvConfig } from '../../config/cla-env-utils';
import { AppSettings } from '../../config/app-settings';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root',
})
export class LfxHeaderService {
  links: any[];

  constructor(private auth: AuthService) {
    this.setUserInLFxHeader();
    this.setLinks();
    this.setCallBackUrl();
  }

  setLinks() {
    this.links = [
      {
        title: 'Project Login',
        url: EnvConfig.default[AppSettings.PROJECT_CONSOLE_LINK_V2],
      },
      {
        title: 'CLA Manager Login',
        url: EnvConfig.default[AppSettings.CORPORATE_CONSOLE_LINK_V2],
      },
      {
        title: 'Developer',
        url: AppSettings.LEARN_MORE,
      },
    ];
    const element: any = document.getElementById('lfx-header-v2');
    element.links = this.links;
  }

  setCallBackUrl() {
    const lfHeaderEl: any = document.getElementById('lfx-header-v2');
    if (lfHeaderEl) {
      lfHeaderEl.callbackurl = window.location.origin + '/#/auth';
    }
  }

  setUserInLFxHeader(): void {
    setTimeout(() => {
      const lfHeaderEl: any = document.getElementById('lfx-header-v2');
      if (lfHeaderEl) {
        this.auth.user$.subscribe((data) => {
          if (data) {
            lfHeaderEl.authuser = data;
          }
        });
      }
    }, 2000);
  }
}
