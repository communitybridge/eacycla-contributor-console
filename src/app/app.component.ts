// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Component } from '@angular/core';
import { AppSettings } from './config/app-settings';
import { LfxHeaderService } from './shared/services/lfx-header.service';
import { EnvConfig } from './config/cla-env-utils';
import { environment } from '../environments/environment';
    
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'easycla-contributor-console';
  hasExpanded: boolean;
  links: any[];

  constructor(
    private lfxHeaderService: LfxHeaderService
  ) {
    // this.mounted();
    this.mountFooter();
  }

  onToggled() {
    this.hasExpanded = !this.hasExpanded;
  }

  ngOnInit() {
    this.hasExpanded = true;
    this.links = [
      {
        title: 'Project Login',
        url: environment.PROJECT_CONSOLE,
      },
      {
        title: 'CLA Manager Login',
        url: environment.CORPORATE_CONSOLE,
      },
      {
        title: 'Developer',
        url: AppSettings.LEARN_MORE
      }
    ];
    const element: any = document.getElementById('lfx-header');
    element.links = this.links;
    
  }

  mounted() {
    const script = document.createElement('script');
    script.setAttribute(
      'src',
      'http://127.0.0.1:8081/lfx-header.js'
      // EnvConfig.default[AppSettings.LFX_HEADER]
    );
    document.head.appendChild(script);
  }


  mountFooter() {
    const script = document.createElement('script');
    script.setAttribute(
      'src',
      EnvConfig.default[AppSettings.LFX_FOOTER]
    );
    document.head.appendChild(script);
  }
}
