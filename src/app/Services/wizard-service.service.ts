import { Injectable } from '@angular/core';
import { IContainer } from '../models/wizard-interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WizardService {
  
  private readonly accountId = 'YOUR_ACCOUNT_ID'; // Define your account ID as a class constant
  private readonly apiUrl = 'https://www.googleapis.com/tagmanager/v2';
  private readonly headers = new HttpHeaders({
    Authorization: `Bearer YOUR_ACCESS_TOKEN`, // Replace with the actual OAuth token
    'Content-Type': 'application/json'
  });
  private readonly mastertagID = "1"
  private readonly AllPagesTrigger = "1"
  private savedVariables: { [key: string]: string } = {};

  constructor(private http: HttpClient) {}

  // Function to start the setup with specified container and option
  startSetup(container: IContainer[], optionId: number, AdvertiserID: number): void {
    console.log('Starting setup service |','Container ID:', container,'| Selected Option ID:', optionId, '| MID: ', AdvertiserID);


    //Var Definitions
    let prefix: string = '';
    let folderID: any = '';
    let parameters: any = {};
    
    //Selected Option definition:
    switch(optionId){
      case 1:
        prefix = 'ecommerce.'
        break
      case 2:
        prefix = 'actionField.'
        break
      case 3:
        prefix = 'custom.'
        break
    }

    //Start Basic Routine
    folderID = this.createFolder(container);
    this.createVariables(container, folderID, prefix);
    this.createTrigger(container);

    //Retrieve Variables
    const Amount = this.savedVariables['Awin - Total Value']
    const OrderID = this.savedVariables['Awin - Order ID']
    const PLT = this.savedVariables['Awin - PLT']
    const Coupon = this.savedVariables['Awin - Voucher']
    const Cookie = this.savedVariables['AwinChannelCookie']

    parameters = [
      { key: 'advertiserID', type: 'TEMPLATE', value: AdvertiserID }
    ];
    this.importCommunityTag(container, this.mastertagID, "Awin - Mastertag", this.AllPagesTrigger, parameters)
    
    parameters = [
      { key: 'cookie', type: 'TEMPLATE', value: 'AwinChannelCookie' }
    ];
    this.importCommunityTag(container, this.mastertagID, "Awin - Mastertag", this.AllPagesTrigger, parameters)
    
    parameters = [
      { key: 'advertiserID', type: 'TEMPLATE', value: AdvertiserID },
      { key: 'Amount', type: 'TEMPLATE', value: Amount },
      { key: 'OrderID', type: 'TEMPLATE', value: OrderID },
      { key: 'PLT', type: 'TEMPLATE', value: PLT },
      { key: 'Coupon', type: 'TEMPLATE', value: Coupon },
      { key: 'Cookie', type: 'TEMPLATE', value: Cookie }
    ];
    this.importCommunityTag(container, this.mastertagID, "Awin - Mastertag", this.AllPagesTrigger, parameters)
  
  }

  //Create Awin folder
  private createFolder(containerId: IContainer[]): any {
    const body = {
      name: 'Awin'
    };
  
    const url = `${this.apiUrl}/accounts/${this.accountId}/containers/${containerId}/workspaces/default/folders`;
    console.log("Creating Folder")
    /*this.http.post(url, body, { headers: this.headers })
      .subscribe(
        (response) => {
          console.log('Folder created successfully:', response);
          return response.folderId;
        },
        (error) => {
          console.error('Error creating folder:', error);
        }
      );*/
  }

  //Create all used variables
  private createVariables(containerId: IContainer[], folderId: string, prefix: string): void {
    const url = `${this.apiUrl}/accounts/${this.accountId}/containers/${containerId}/workspaces/default/variables`;

    // Define five specific variables with their configurations
    const variables = [
      { name: 'AwinChannelCookie', type: '1stPartyCookie', cookieName: 'AwinChannelCookie' },
      { name: 'Awin - Total Value', type: 'DataLayer', dataLayerKey: prefix+'value' },
      { name: 'Awin - Order ID', type: 'DataLayer', dataLayerKey: prefix+'transaction_id' },
      { name: 'Awin - Voucher', type: 'DataLayer', dataLayerKey: prefix+'coupon' },
      { name: 'Awin - PLT', type: 'DataLayer', dataLayerKey: prefix+'items' }
    ];

    const createdVariableIds: { [key: string]: string } = {};

    // Loop through each variable and create it
    console.log("Creating Variables");
    variables.forEach(variable => {
      const body = {
        name: variable.name,
        type: variable.type === '1stPartyCookie' ? '1stPartyCookie' : 'jsm', // Set the type
        parameter: [
          variable.type === '1stPartyCookie'
            ? { key: 'cookieName', value: variable.cookieName }
            : { key: 'dataLayerVersion', value: '2' },
          ...(variable.type === 'DataLayer'
            ? [{ key: 'dataLayerVariable', value: variable.dataLayerKey }]
            : [])
        ],
        parentFolderId: folderId
      };
      createdVariableIds[variable.name] = "1";
      /*
      this.http.post(url, body, { headers: this.headers })
        .subscribe(
          response => {
            console.log(`Variable "${variable.name}" created successfully:`, response);
          },
          error => {
            console.error(`Error creating variable "${variable.name}":`, error);
          }
        );*/
    });
    this.savedVariables = createdVariableIds;
  }

  //Create Purchase trigger
  createTrigger(containerId: IContainer[]): any {
    const url = `${this.apiUrl}/accounts/${this.accountId}/containers/${containerId}/workspaces/default/triggers`;
    const body = {
      name: 'Awin - Custom Trigger',
      type: 'CUSTOM_EVENT',
      customEventFilter: [
        {
          type: 'EQUALS',
          parameter: [
            {
              type: 'TEMPLATE',
              key: 'event',
              value: 'purchase'
            }
          ]
        }
      ],
      filter: [], // Optional: specify additional filters if needed
    };
    
    console.log("Creating Trigger")
    /*return this.http.post<any>(url, body, { headers: this.headers }).pipe(
      map(response => {
        console.log('Purchase Trigger created successfully:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error creating Purchase Trigger:', error);
        throw error;
      })
    );*/
  }

  //Import Tags
  importCommunityTag(containerId: IContainer[], tagTemplateId: string, tagName: string, trigger: string, parameters: any): any {
    const url = `${this.apiUrl}/accounts/${this.accountId}/containers/${containerId}/workspaces/default/tags`;
    
    const body = {
      name: tagName,
      type: 'template', // Specifies it’s a community template tag
      tagTemplateId: tagTemplateId,
      parameter: parameters, // Pass in any parameters required by the template
      firingTriggerId: [trigger] // Replace with your desired trigger ID
    };
    console.log(parameters)
    /*return this.http.post<any>(url, body, { headers: this.headers }).pipe(
      map(response => {
        console.log(`${tagName} tag created successfully:`, response);
        return response;
      }),
      catchError(error => {
        console.error(`Error creating ${tagName} tag:`, error);
        throw error;
      })
    );*/
  }
}
