import Keycloak, {KeycloakConfig} from 'keycloak-js';

export default class AuthService {
  private keycloak: Keycloak;

  constructor(private options: KeycloakConfig) {
    this.keycloak = Keycloak(options);
  }

  public async init() {
    const loggedIn = await this.keycloak.init({ onLoad: 'login-required' });
    if(loggedIn) {
      setInterval(() => {
        this.keycloak.updateToken(70).then((refreshed) => {
          if (refreshed) {
            console.log('Token refreshed' + refreshed);
          } else {
            console.log('Token not refreshed, valid for '
              + Math.round(this.keycloak.tokenParsed.exp + this.keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
          }
        }).catch(() => {
          console.error('Failed to refresh token');
        });
      }, 6000)
      return true;
    } else {
      return false;
    }
  }

  public logout():void {
    this.keycloak.logout({redirectUri: window.location.host});
  }

  public getToken():string|undefined {
    return this.keycloak.token;
  }
}
