/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import Keycloak, { KeycloakConfig } from 'keycloak-js';

export default class AuthService {
  private keycloak: Keycloak;

  constructor(private options: KeycloakConfig) {
    this.keycloak = new Keycloak(options);
  }

  public async init(): Promise<boolean> {
    const loggedIn = await this.keycloak.init({
      onLoad: 'login-required',
    });
    if (loggedIn) {
      setInterval(() => {
        this.keycloak
          .updateToken(70)
          .then((refreshed) => {
            if (refreshed) {
              console.log(`Token refreshed: ${refreshed}, ${new Date()}`);
            }
          })
          .catch((e) => {
            console.error('Failed to refresh token', e);
          });
      }, 6000);
      return true;
    } else {
      return false;
    }
  }

  public manageAccount(): void {
    this.keycloak.accountManagement();
  }

  public logout(): void {
    this.keycloak.logout({ redirectUri: window.location.href });
  }

  public getToken(): string | undefined {
    return this.keycloak.token;
  }
}
