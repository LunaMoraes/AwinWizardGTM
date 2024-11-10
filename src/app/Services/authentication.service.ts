import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private tokenClient: any;

  constructor() { }

  // Initialize Google Identity Services OAuth
  initGoogleOAuth(): void {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: environment.GAPI_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      callback: (tokenResponse: any) => {
        console.log("Access token received:", tokenResponse.access_token);
        sessionStorage.setItem('accessToken', tokenResponse.access_token);
      }
    });
  }

  // Sign-in method
  signIn(): void {
    if (!this.tokenClient) {
      this.initGoogleOAuth();
    }
    // Prompt the user to select a Google account and grant permissions
    this.tokenClient.requestAccessToken();
  }
  // Callback handling method for OAuthComponent
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

  async fetchContainers(): Promise<any> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error("User is not authenticated.");
    }

    const accountId = environment.ACCOUNT_ID;
    const url = `https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch containers: ${response.statusText}`);
    }

    return response.json();
  }
  
  async fetchVariables(containerId: string, workspaceId: string): Promise<any> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error("User is not authenticated.");
    }

    const accountId = environment.ACCOUNT_ID;
    const url = `https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch variables: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched variables:", data);
    data.variable.forEach((variable: any) => {
      console.log(`Variable Name: ${variable.name}, Type: ${variable.type}, Parameters:`, variable.parameter);
    });

    return data;
  }


  async fetchTags(containerId: string, workspaceId: string): Promise<any> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error("User is not authenticated.");
    }

    const accountId = environment.ACCOUNT_ID;
    const url = `https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched tags:", data);
    data.tag.forEach((tag: any) => {
      console.log(`Tag Name: ${tag.name}, Type: ${tag.type}, Template ID: ${tag.tagTemplateId}, Parameters:`, tag.parameter);
    });

    return data;
  }

  
  async fetchTriggers(containerId: string, workspaceId: string): Promise<any> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error("User is not authenticated.");
    }

    const accountId = environment.ACCOUNT_ID;
    const url = `https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch triggers: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched triggers:", data);
    data.trigger.forEach((trigger: any) => {
      console.log(`Trigger Name: ${trigger.name}, Type: ${trigger.type}, Parameters:`, trigger.parameter);
    });

    return data;
  }

  async fetchDefaultWorkspace(apiUrl: string, accountId: string, containerId: number): Promise<string> {
    const accessToken = sessionStorage.getItem('accessToken');
    const url = `${apiUrl}/accounts/${accountId}/containers/${containerId}/workspaces`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

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
  
  // Sign-out method
  signOut(): void {
    // Clear the token from session storage
    sessionStorage.removeItem('accessToken');
    // You may also want to call google.accounts.id.disableAutoSelect() if applicable
  }
}
