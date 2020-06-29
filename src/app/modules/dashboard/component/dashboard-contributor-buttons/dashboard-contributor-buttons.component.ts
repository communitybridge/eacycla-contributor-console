// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dashboard-contributor-buttons',
  templateUrl: './dashboard-contributor-buttons.component.html',
  styleUrls: ['./dashboard-contributor-buttons.component.scss']
})
export class DashboardContributorButtonsComponent {
  @Input() type: string;
  @Input() hasEnabled: boolean;
  @Output() proceedBtnEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  onClickProceed() {
    this.proceedBtnEmitter.emit();
  }

}
