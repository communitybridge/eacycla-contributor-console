// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Injectable } from '@angular/core';
import * as auth0 from 'auth0-js';
import * as jwt_decode from 'jwt-decode';
import { getAuthURLFromWindow } from 'src/app/config/auth-utils';
import { StorageService } from './storage.service';
import { AppSettings } from 'src/app/config/app-settings';
import { EnvConfig } from 'src/app/config/cla-env-utils';

(window as any).global = window;

@Injectable()
export class AuthService {

  auth0 = new auth0.WebAuth({
    clientID: EnvConfig.default['auth0-clientId'],
    domain: EnvConfig.default['auth0-domain'],
    responseType: 'token id_token',
    redirectUri: getAuthURLFromWindow(),
    scope: 'openid email profile'
  });

  constructor(
    private storageService: StorageService
  ) { }

  public login(): void {
    this.auth0.authorize();
  }

  /* parseHash method to parse a URL hash fragment when the user is redirected back to your application
   * in order to extract the result of an Auth0 authentication response
   */
  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        console.log(err);
      }
    });
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const gerritUser = JSON.parse(this.storageService.getItem(AppSettings.AUTH_DATA));
    if (gerritUser) {
      return new Date().getTime() < gerritUser.expires_at;
    }
    return false;
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    this.storageService.removeItem(AppSettings.AUTH_DATA);
  }

  public getIdToken(): string {
    const tokenId = JSON.parse(this.storageService.getItem(AppSettings.ID_TOKEN))
    return tokenId;
  }

  public parseIdToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        resolve(jwt_decode(token));
      } catch (error) {
        return reject(error);
      }
    });
  }

  public getUserInfo(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        reject('Access Token must exist to fetch profile');
      }
      this.auth0.client.userInfo(accessToken, function (err, profile) {
        if (profile) {
          return resolve(profile);
        }
      });
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
    const sessionData = {
      access_token: authResult.accessToken,
      id_token: authResult.idToken,
      expires_at: expiresAt,
      userid: authResult.idTokenPayload.nickname,
      user_email: authResult.idTokenPayload.email,
      user_name: authResult.idTokenPayload.name
    }
    this.storageService.setItem(AppSettings.ID_TOKEN, authResult.idToken);
    this.storageService.setItem(AppSettings.AUTH_DATA, sessionData);
  }
}
