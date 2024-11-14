import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { IContainer } from '../models/wizard-interfaces';

@Injectable({
  providedIn: 'root'
})
export class GAPIService {
  private readonly apiUrl = 'https://www.googleapis.com/tagmanager/v2';

  constructor(private http: HttpClient, private authService: AuthenticationService) { }

    // Folder creation
    async createFolder(fullURL: any): Promise<void> {
      const url = `${this.apiUrl}/${fullURL}/folders`;
      const body = { name: 'Awin' };
      try {
          const response = await this.http.post<any>(url, body, { headers: this.authService.headers }).toPromise();
          console.log('Folder created:', response);
          return response.folderId;
      } catch (error:any) {
          console.error('Error creating folder:', error);
          if(error.error.error.message=="Found entity with duplicate name."){
            throw new Error("Folder already exists, aborting creation.")
          } else {
            throw new Error("Folder Couldn't be Created.");
          }
      }
    }
  
    // Get ID
    async fetchAccountId(container: IContainer[]): Promise<string | null> {
      return await this.authService.fetchAccountIdByContainerPublicId(container)
      .then(accountId => {
        return accountId;
      })
      .catch(error => {
        console.error("Error fetching account ID:", error);
        return null;
      });
    }
    
    // Variable creation
    async createVariables(
        fullURL: any, 
        folderId: string, 
        variables: any,
      ) : Promise<void> {
      const url = `${this.apiUrl}/${fullURL}/variables`;
      
      for (const variable of variables) {
          const body = {
              name: variable.name,
              type: variable.type,
              parameter: variable.parameters,
              parentFolderId: folderId
          };
  
          try {
              const response = await this.http.post<any>(url, body, { headers: this.authService.headers }).toPromise();
              console.log(`Variable "${variable.name}" created:`, response);
          } catch (error) {
              console.error(`Error creating variable "${variable.name}":`, error);
              throw new Error("Variables couldn't be created. Check log for more details.");
          }
      }
    }
  
    // Trigger creation
    async createTrigger(
        fullURL: any, 
        folderId: string,
      ): Promise<string | null> {
      const url = `${this.apiUrl}/${fullURL}/triggers`;
      const body = {
          name: 'Awin - Custom Trigger',
          type: 'customEvent',
          customEventFilter: [
              {
                  type: 'equals',
                  parameter: [
                      {
                          key: 'arg0',
                          type: 'template',
                          value: '{{_event}}'
                      },
                      {
                          key: 'arg1',
                          type: 'template',
                          value: 'purchase'
                      }
                  ]
              }
          ],
          parentFolderId: folderId
        };
  
      try {
          const response = await this.http.post<any>(url, body, { headers: this.authService.headers }).toPromise();
          console.log('Trigger created:', response);
          
          // Store and return the trigger ID if creation was successful
          const triggerId = response?.triggerId;
          return triggerId;
      } catch (error:any) {
          console.error('Error creating trigger:', error);
          if(error.error.error.message=="Found entity with duplicate name."){
            throw new Error("Trigger already exists, aborting creation.")
          } else {
            throw new Error("Trigger couldn't be created.");
          }
      }
    }
  
    // Tag import
    async importCommunityTag(
        fullURL: any,
        tagTemplateId: string,
        tagName: string,
        triggerId: string,
        parameters: any[],
        folderId: string,
      ): Promise<void> {
      const url = `${this.apiUrl}/${fullURL}/tags`;
      
      const body = {
        name: tagName,
        type: tagTemplateId,
        parameter: parameters.map(param => ({
          key: param.key,
          type: param.type,
          value: param.value
        })),
        firingTriggerId: [triggerId],
        tagFiringOption: 'oncePerEvent',
        parentFolderId: folderId,
        monitoringMetadata: {
            "type": "map"
        },
        consentSettings: {
          consentStatus: 'notSet'
        }
      };

      try {
          const response = await this.http.post<any>(url, body, { headers: this.authService.headers }).toPromise();
          console.log(`${tagName} tag created successfully:`, response);
      } catch (error:any) {
          console.error(`Error creating ${tagName} tag:`, error);
          if(error.error.error.message=="Found entity with duplicate name."){
            throw new Error("Tag already exists, aborting creation.")
          } else {
            throw new Error("Tags couldn't be imported.");
          }
      }
    }
    
    // Template import
    async importCommunityTemplate(
        fullURL: any,
        templateName: string,
        parameters: any[],
        folderId: string,
        templateData: any,
      ): Promise<void> {
      const url = `${this.apiUrl}/${fullURL}/templates`;
  
      const body = {
        templateData: templateData,
        type: "TAG",
        name: templateName,
        parentFolderId: folderId,
        galleryReference: parameters[0].galleryReference
      };
  
      try {
        const response = await this.http.post<any>(url, body, { headers: this.authService.headers }).toPromise();
        console.log(`${templateName} template created successfully:`, response);
        return response.templateId;
      } catch (error:any) {
        console.error(`Error creating ${templateName} template:`, error); 
        if(error.error.error.message=="Found entity with duplicate name."){
          throw new Error("Template already exists, aborting creation.")
        } else {
          throw new Error("Template couldn't be imported.");
        }
      }
    }
    
}
