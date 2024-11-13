import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private tokenClient: any;
  public headers:any = {}

  constructor() { }

  // Basic functions 
  private async waitTimeout() {
    return new Promise((resolve) => {
      setTimeout(resolve, 5000); // 1 minute = 60000 milliseconds
    });
  }

  initGoogleOAuth(): void {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: environment.GAPI_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/tagmanager.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/tagmanager.edit.containers',
      callback: async (tokenResponse: any) => {
        console.log("Access token received:", tokenResponse.access_token);
        sessionStorage.setItem('accessToken', tokenResponse.access_token);
        try {
          await this.updateHeaders();
        } catch (error) {
          console.log("Tivemos um erro: ", error)
        }
      }
    });
  }

  updateHeaders() {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('Access token not found in sessionStorage');
      return;
    }
  
    // Use a plain object instead of HttpHeaders
    this.headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  //   OAuthComponent handling
  async handleOAuthCallback(): Promise<void> {
    return new Promise((resolve, reject) => {
      const accessToken = sessionStorage.getItem('accessToken');
      if (accessToken) {
        console.log("Access token found:", accessToken);
        resolve();
      } else {
        reject("No access token found");
      }
    });
  }

  async signIn(): Promise<void> {
    if (!this.tokenClient) {
      this.initGoogleOAuth();
    }
    this.tokenClient.requestAccessToken();
  }
  signOut(): void {
    sessionStorage.removeItem('accessToken');
  }


  // Wizard functions
  async fetchContainers(accountID: any): Promise<any> {

    const accountId = accountID;
    const url = `https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers`;

    const response = await fetch(url, {headers: this.headers});

    if (!response.ok) {
      throw new Error(`Failed to fetch containers: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchDefaultWorkspace(accountId: string, containerId: number): Promise<string> {
    const url = `https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces`;

    try {
        const response = await fetch(url, {headers: this.headers});

        if (!response.ok) {
            throw new Error(`Failed to fetch workspaces: ${response.statusText}`);
        }

        const data = await response.json();
        const defaultWorkspace = data.workspace.find((workspace: any) => workspace.name === 'Default Workspace');

        if (defaultWorkspace) {
            console.log("Found default workspace ID:", defaultWorkspace.workspaceId);
            return defaultWorkspace.workspaceId;
        } else {
            throw new Error("Default workspace not found.");
        }
    } catch (error) {
        console.error("Error fetching default workspace:", error);
        throw error;
    }
  }
  
  async fetchAccountIdByContainerPublicId(containerPublicId: any): Promise<string | null> {
    const apiUrl = 'https://tagmanager.googleapis.com/tagmanager/v2/accounts';

    try {
        const accountsResponse = await fetch(apiUrl, { headers: this.headers });

        if (!accountsResponse.ok) {
            throw new Error(`Failed to fetch accounts: ${accountsResponse.statusText}`);
        }

        const accountsData = await accountsResponse.json();
        
        for (const account of accountsData.account) {
            console.log("Fetching containers for account ID:", account.accountId);
            await this.waitTimeout();
            const containersResponse = await fetch(`${apiUrl}/${account.accountId}/containers`, {headers: this.headers});
            if (!containersResponse.ok) {
                throw new Error(`Failed to fetch containers for account ${account.accountId}: ${containersResponse.statusText}`);
            }

            const containersData = await containersResponse.json();
            // Check if any container has the matching public ID if its not empty            
            if(containersData && containersData.container){
              const matchingContainer = containersData.container.find(
                (container: any) => container.publicId === containerPublicId
              );
              if (matchingContainer) {
                console.log(`Found container with public ID ${containerPublicId} in account ID ${account.accountId}`);
                return account.accountId;
              }
            }
            else{
              console.log("No containers on account, consider removing it: ", account)
            }
        }

        console.log(`No container with public ID ${containerPublicId} found.`);
        return null;
    } catch (error) {
        console.error("Error fetching account ID by container public ID:", error);
        throw error;
    }
  }
}
