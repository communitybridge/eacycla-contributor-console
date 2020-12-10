/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/prefer-for-of */
// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT

import { Injectable } from '@angular/core';
import {
  from,
  of,
  Observable,
  BehaviorSubject,
  combineLatest,
  throwError,
} from 'rxjs';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { tap, catchError, concatMap, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as querystring from 'query-string';
import Url from 'url-parse';
import { EnvConfig } from '../../config/cla-env-utils';
import { AppSettings } from 'src/app/config/app-settings';
import { StorageService } from './storage.service';

function log(text: any, value: any = '') {
  console.log(`(authServr) ${text}`, value && JSON.stringify({log: value}, null, 2)|| '');
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public openCLADialog$ = new BehaviorSubject<any>(false);
  auth0Options = {
    domain: EnvConfig.default['auth0-domain'], // e.g linuxfoundation-dev.auth0.com
    clientId: EnvConfig.default['auth0-clientId'],
    callbackUrl: window.location.origin + '/#/auth'
  };

  currentHref = window.location.href;
  currentSearch = window.location.search;
  loading$ = new BehaviorSubject<any>(true);

  // Create an observable of Auth0 instance of client
  auth0Client$ = (from(
    createAuth0Client({
      domain: this.auth0Options.domain,
      client_id: this.auth0Options.clientId,
    })
  ) as Observable<Auth0Client>).pipe(
    shareReplay(1), // Every subscription receives the same shared value
    catchError((err) => {
      this.loading$.next(false);
      return throwError(err);
    })
  );

  // Define observables for SDK methods that return promises by default
  // For each Auth0 SDK method, first ensure the client instance is ready
  // concatMap: Using the client instance, call SDK method; SDK returns a promise
  // from: Convert that resulting promise into an observable

  isAuthenticated$ = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => from(client.isAuthenticated())),
    tap((res: any) => {
      // *info: once isAuthenticated$ responses , SSO sessiong is loaded
      // this.loading$.next(false);
      this.loggedIn = res;
    })
  );

  handleRedirectCallback$ = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => {
      log('### obser > this.currentHref ', {jhref: this.currentHref, searcj: this.currentSearch});
      // return from(client.handleRedirectCallback(this.currentHref))
      return from(client.handleRedirectCallback(this.currentSearch))
    }),
  );

  // Create subject and public observable of user profile data

  loggedIn = false;
  userProfile;
  userProfileSubject$ = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject$.asObservable();

  // Create a local property for login status

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {
    this.initializeApplication();

    // On initial load, check authentication state with authorization server
    // Set up local auth streams if user is already authenticated

    // const params = this.currentHref;
    // if (params.includes('code=') && params.includes('state=')) {
    //   this.handleAuthCallback();
    // } else {
    //   this.localAuthSetup();
    // }
    // this.handlerReturnToAferlogout();
  }

  async initializeApplication() {
    // On initial load, check authentication state with authorization server
    // Set up local auth streams if user is already authenticated
    const params = this.currentHref;
    log(' > params', params);
    if (params.includes('code=') && params.includes('state=')) {
      this.handleAuthCallback();
      return;
    }

    await this.localAuthSetup();
    this.handlerReturnToAferlogout();
  }

  handlerReturnToAferlogout() {
    const { query } = querystring.parseUrl(this.currentHref);
    const returnTo = query.returnTo;
    if (returnTo) {
      const target = this.getTargetRouteFromReturnTo(returnTo);
      this.router.navigate([target]);
    }
  }

  // When calling, options can be passed if desired
  // https://auth0.github.io/auth0-spa-js/classes/auth0client.html#getuser

  getUser$(options?): Observable<any> {
    return this.auth0Client$.pipe(
      concatMap((client: Auth0Client) => from(client.getUser(options))),
      tap((user) => {
        this.setSession(user);
        this.userProfileSubject$.next(user);
      })
    );
  }

  login() {
    log('entered login');
    setTimeout(() => {
      const header = document.querySelector('#lfx-header');
    if (!header) {
      console.error('not header found');
    }
    const button = header
      .shadowRoot.querySelector('.lfx-header.is-login-link') as HTMLElement;
    if (button) {
      button.click();
    }
    }, 500)
  }

  logout() {
    const header = document.querySelector('#lfx-header');
    if (!header) {
      console.error('not header found');
    }
    const button =header.shadowRoot.querySelector('.lfx-header.is-logout-link') as HTMLElement;
    if (button) {
      button.click();
    }
  }


  getTokenSilently$(options?): Observable<any> {
    return this.auth0Client$.pipe(
      concatMap((client: Auth0Client) => from(client.getTokenSilently(options)))
    );
  }

  getIdToken$(options?): Observable<any> {
    return this.auth0Client$.pipe(
      // *info: if getIdToken fails , just return empty in the catchError
      concatMap((client: Auth0Client) =>
        from(client.getIdTokenClaims(options))
      ),
      concatMap((claims: any) => of((claims && claims.__raw) || '')),
      catchError(() => of(''))
    );
  }

  private async localAuthSetup() {
    log('entered localAuthSetup');
    // This should only be called on app initialization
    // Set up local authentication streams
    const checkAuth$ = this.isAuthenticated$.pipe(
      concatMap((loggedIn: boolean) => {
        if (loggedIn) {
          // If authenticated, get user and set in app
          // NOTE: you could pass options here if needed
          this.loading$.next(false);
          return this.getUser$();
        }
        this.auth0Client$
          .pipe(
            // https://auth0.com/docs/libraries/auth0-single-page-app-sdk#get-access-token-with-no-interaction
            // *info: Allow check user session in public pages to avoid redirecting to login page
            concatMap((client: any) =>
              from(client.getTokenSilently({ ignoreCache: true }))
            ),
            concatMap(() => this.getUser$()),
            concatMap((user) => {
              if (user) {
                return this.isAuthenticated$;
              }
              this.checkUserSessionByCookie();
              return of(null);
            }),
            catchError(() => {
              // *info: by pass error, no needed, it is login_required
              this.checkUserSessionByCookie();
              return of(null);
            })
          )
          .subscribe(() => {
            this.loading$.next(false);
          });
        // If not authenticated, return stream that emits 'false'
        return of(loggedIn);
      })
    );
    checkAuth$.subscribe();
  }

  private checkUserSessionByCookie() {
    const cookieName = `auth-${this.auth0Options.domain}`;
    const cookieExists = this.getCookie(cookieName);
    if (cookieExists) {
      console.log('#### cookieExists com > login');
      this.login();
      return;
    }
  }

  private getCookie(cname) {
    const name = cname + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  private getTargetRouteFromAppState(appState) {
    if (!appState) {
      return '/';
    }
    const { returnTo, target, targetUrl } = appState;
    return (
      this.getTargetRouteFromReturnTo(returnTo) || target || targetUrl || '/'
    );
  }

  private getTargetRouteFromReturnTo(returnTo) {
    if (!returnTo) {
      return '';
    }
    const { fragmentIdentifier } = querystring.parseUrl(returnTo, {
      parseFragmentIdentifier: true,
    });
    if (fragmentIdentifier) {
      return fragmentIdentifier;
    }
    const { pathname } = new Url(returnTo);
    return pathname || '/';
  }

  private handleAuthCallback() {
    log('enntered handleAuthCallback')
    // Call when app reloads after user logs in with Auth0
    const params = this.currentHref;

    if (params.includes('code=') && params.includes('state=')) {
      let targetRoute = ''; // Path to redirect to after login processsed
      const authComplete$ = this.handleRedirectCallback$.pipe(
        // Have client, now call method to handle auth callback redirect
        tap((cbRes: any) => {
          targetRoute = this.getTargetRouteFromAppState(cbRes.appState);
          log('### targetRoute', { targetRoute });
        }),
        concatMap(() =>
          // Redirect callback complete; get user and login status
          combineLatest([this.getUser$(), this.isAuthenticated$])
        ),
        catchError((err) => {
          console.log('handleAuthCallback  > err', err);
          return of(true);
        })
      );
      // Subscribe to authentication completion observable
      // Response will be an array of user and login status
      authComplete$.subscribe(() => {
        log('### redirection to auth');
        this.loading$.next(false);
        
        let url = '/auth';

        if (targetRoute && targetRoute !== '/auth') {
          url = `/auth?targetRoute=${targetRoute}`;
        }
        
        log('### url', { url });
        this.router.navigateByUrl(url);
      });
    }
  }


  /* Extra method added */
  private setSession(authResult): void {
    const { nickname, username, email, name  } = authResult || {};
    const sessionData = {
      userid: nickname || username,
      user_email: email,
      user_name: name
    }
    this.storageService.setItem(AppSettings.AUTH_DATA, sessionData);
  }
}
