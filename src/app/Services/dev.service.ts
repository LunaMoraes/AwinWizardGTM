import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class DevService {

  constructor(private Auth: AuthenticationService) { }

  async fetchVariables(): Promise<any> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error("User is not authenticated.");
    }

    const accountId = environment.TEST_ACCOUNT_ID;
    const containerId = environment.TEST_CONTAINER_ID;
    const workspaceId = environment.TEST_WORKSPACE_ID;
    const url = `https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/variables`;

    const response = await fetch(url, {headers: this.Auth.headers});

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
  async fetchTags(): Promise<any> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error("User is not authenticated.");
    }

    const accountId = environment.TEST_ACCOUNT_ID;
    const containerId = environment.TEST_CONTAINER_ID;
    const workspaceId = environment.TEST_WORKSPACE_ID;
    const url = `https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/tags`;

    const response = await fetch(url, {headers: this.Auth.headers});

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
  async fetchTriggers(): Promise<any> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error("User is not authenticated.");
    }

    const accountId = environment.TEST_ACCOUNT_ID;
    const containerId = environment.TEST_CONTAINER_ID;
    const workspaceId = environment.TEST_WORKSPACE_ID;
    const url = `https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers`;

    const response = await fetch(url, {headers: this.Auth.headers});

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
  async fetchTemplates(): Promise<any> {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error("User is not authenticated.");
    }

    const accountId = environment.TEST_ACCOUNT_ID;
    const containerId = environment.TEST_CONTAINER_ID;
    const workspaceId = environment.TEST_WORKSPACE_ID;
    const url = `https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}/templates`;

    try {
        const response = await fetch(url, {headers: this.Auth.headers});

        if (!response.ok) {
            throw new Error(`Failed to fetch templates: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched templates:", data);
        data.template.forEach((template: any) => {
            console.log(`Template Name: ${template.name}, Template ID: ${template.templateId}, Parameters:`, template.parameter);
        });

        return data;
    } catch (error) {
        console.error("Error fetching templates:", error);
        throw error;
    }
  }
}
