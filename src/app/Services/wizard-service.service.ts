import { Injectable } from '@angular/core';
import { IContainer } from '../models/wizard-interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../Services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class WizardService {

  private readonly AllPagesTrigger = environment.ALL_PAGES_TRIGGER;
  private readonly apiUrl = 'https://www.googleapis.com/tagmanager/v2';
  private headers = new HttpHeaders({
    Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  });
  private containerId: number = 0;
  private readonly mastertagID = "1";
  private readonly converionTagID = "1";
  private readonly awLastId = "1";
  private savedVariables: { [key: string]: string } = {};
  private FolderID: any = {};
  private accountId: any = undefined;
  private customTriggerId: any = {};
  private isFetchComplete = false;
  private MasterTagPublicID: any = {};
  private MasterTagTemplateID: any = 127;
  private LastClickPublicID: any = {};
  private LastClickTemplateID: any = 128;
  private ConversionTagPublicID: any = {};
  private ConversionTemplateID: any = 126;

  constructor(private http: HttpClient, private authService: AuthenticationService) {}

  // Function to start the setup
  async startSetup(container: IContainer[], optionId: number, AdvertiserID: number): Promise<{ status: string, message?: any }> {
    console.log('Starting setup | Option ID:', optionId, '| Advertiser ID:', AdvertiserID);
    let prefix = this.getPrefix(optionId);

    //Grab account ID for future requests
    await this.fetchAccountId(container);
    
    // Fetch containers to get the numeric containerId
    try {
      const containersData = await this.authService.fetchContainers();
      const targetContainer = containersData.container.find((cont: any) => cont.publicId === container); // Match with public ID if available
      if (targetContainer) {
        this.containerId = targetContainer.containerId;  // Save the numeric ID
        console.log("Found numeric container ID:", this.containerId);
      } else {
        throw new Error("Container with the specified public ID not found.");
      }

      // Fetch default workspace ID for the container
      const workspaceId = await this.authService.fetchDefaultWorkspace(this.apiUrl, this.accountId, this.containerId);
      
      // Proceed with the setup routine now that we have the correct containerId and workspaceId
      await this.startBasicRoutine(container, AdvertiserID, prefix, workspaceId);

      // If everything was successful, return "success"
      console.log("Setup completed successfully.");
      return { status: "success" };

    } catch (error) {
      console.error("Error fetching containers or starting setup:", error);
      return { status: "failed", message: error || "An error has occurred. Check Logs for detail" };
    }
  }
  
  // Helper to get prefix based on option ID
  private getPrefix(optionId: number): string {
    switch (optionId) {
      case 1: return 'ecommerce.';
      case 2: return 'actionField.';
      case 3: return 'custom.';
      default: return '';
    }
  }

  // Basic setup routine
  private async startBasicRoutine(container: IContainer[], AdvertiserID: any, prefix: string, workspaceId: string) {
    let parameters:any = [];

    //ensuring that the headers are not null
    this.headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    });

    await this.createFolder(workspaceId);
    
    await this.createVariables(this.containerId, workspaceId, this.FolderID, prefix);
    await this.createTrigger(this.containerId, workspaceId, this.FolderID);

    const Amount = this.savedVariables['Awin - Total Value'];
    const OrderID = this.savedVariables['Awin - Order ID'];
    const PLT = this.savedVariables['Awin - PLT'];
    const Coupon = this.savedVariables['Awin - Voucher'];
    const Cookie = this.savedVariables['AwinChannelCookie'];

    await this.waitTimeout() //Removing chance of getting denial
    this.MasterTagPublicID = 'cvt_'+this.containerId+"_"+this.MasterTagTemplateID
    this.LastClickPublicID = 'cvt_'+this.containerId+"_"+this.LastClickTemplateID
    this.ConversionTagPublicID = 'cvt_'+this.containerId+"_"+this.ConversionTemplateID

    parameters = [{ key: 'advertiserId', type: 'TEMPLATE', value: AdvertiserID }];
    await this.importCommunityTag(this.containerId, workspaceId, this.MasterTagPublicID, "Awin - Mastertag", this.AllPagesTrigger, parameters, this.FolderID);
    
    parameters = [
      { key: 'sourceParameters', type: 'template', value: 'utm_source,source,gclid,fbclid' },
      { key: 'awinSource', type: 'template', value: 'awin' },
      { key: 'overwriteCookieDomain', type: 'boolean', value: 'false' },
      { key: 'cookiePeriod', type: 'template', value: '30' },
      { key: 'cookieName', type: 'template', value: 'AwinChannelCookie' },
      { key: 'organicFilter', type: 'boolean', value: 'false' }
    ];
  
    await this.importCommunityTag(
        this.containerId,
        workspaceId,
        this.LastClickPublicID,
        "Awin - AW Last Click Identifier",
        this.AllPagesTrigger,
        parameters,
        this.FolderID
    );
    
    parameters = [
      { key: 'amount', type: 'template', value: '{{Awin - Total Value}}' },
      { key: 'cg', type: 'template', value: 'DEFAULT' },
      { key: 'test', type: 'template', value: '0' },
      { key: 'orderRef', type: 'template', value: '{{Awin - Order ID}}' },
      { key: 'overrideDatafields', type: 'boolean', value: 'false' },
      { key: 'voucher', type: 'template', value: '{{Awin - Voucher}}' },
      { key: 'channel', type: 'template', value: '{{AwinChannelCookie}}' },
      { key: 'plt', type: 'template', value: '{{Awin - PLT}}' },
      { key: 'currency', type: 'template', value: 'BRL' },
      { key: 'advertiserId', type: 'template', value: AdvertiserID }
    ];

    await this.importCommunityTag(
      this.containerId,
      workspaceId,
      this.ConversionTagPublicID, // The community template type ID for the conversion tag
      "Awin - Conversion Tag",
      this.customTriggerId, // Use the custom trigger created earlier
      parameters,
      this.FolderID
  );
  }

  // Folder creation
  private async createFolder(workspaceId: string): Promise<void> {
    const url = `${this.apiUrl}/accounts/${this.accountId}/containers/${this.containerId}/workspaces/${workspaceId}/folders`;
    const body = { name: 'Awin' };
    try {
        const response = await this.http.post<any>(url, body, { headers: this.headers }).toPromise();
        console.log('Folder created:', response);
        this.FolderID = response.folderId;
    } catch (error) {
        console.error('Error creating folder:', error);
        this.FolderID = null;
        throw new Error("Folder Couldn't be Created.");
    }
  }

  //Get ID
  private async fetchAccountId(container: IContainer[]){
    await this.authService.fetchAccountIdByContainerPublicId(container)
      .then(accountId => {
        this.accountId = accountId;
        this.isFetchComplete = true;
        console.log("Account ID fetched successfully:", accountId);
      })
      .catch(error => {
        console.error("Error fetching account ID:", error);
        throw new Error("Account ID Couldn't be found.");
      });
  }
  
  // Variable creation
  private async createVariables(containerId: number, workspaceId: string, folderId: string, prefix: string): Promise<void> {
    const url = `${this.apiUrl}/accounts/${this.accountId}/containers/${containerId}/workspaces/${workspaceId}/variables`;
    const variables = [
        {
            name: 'AwinChannelCookie',
            type: 'k',  // GTM type for the cookie variable
            parameters: [
                { key: 'decodeCookie', type: 'boolean', value: 'false' },
                { key: 'name', type: 'template', value: 'AwinChannelCookie' }  // Replace with your actual cookie name
            ]
        },
        {
            name: 'Awin - Total Value',
            type: 'v',  // GTM type for the DataLayer variable
            parameters: [
                { key: 'dataLayerVersion', type: 'integer', value: '2' },
                { key: 'setDefaultValue', type: 'boolean', value: 'false' },
                { key: 'name', type: 'template', value: prefix + 'value' }
            ]
        },
        {
            name: 'Awin - Order ID',
            type: 'v',
            parameters: [
                { key: 'dataLayerVersion', type: 'integer', value: '2' },
                { key: 'setDefaultValue', type: 'boolean', value: 'false' },
                { key: 'name', type: 'template', value: prefix + 'transaction_id' }
            ]
        },
        {
            name: 'Awin - Voucher',
            type: 'v',
            parameters: [
                { key: 'dataLayerVersion', type: 'integer', value: '2' },
                { key: 'setDefaultValue', type: 'boolean', value: 'false' },
                { key: 'name', type: 'template', value: prefix + 'coupon' }
            ]
        },
        {
            name: 'Awin - PLT',
            type: 'v',
            parameters: [
                { key: 'dataLayerVersion', type: 'integer', value: '2' },
                { key: 'setDefaultValue', type: 'boolean', value: 'false' },
                { key: 'name', type: 'template', value: prefix + 'items' }
            ]
        }
    ];

    const createdVariableIds: { [key: string]: string } = {};

    for (const variable of variables) {
        const body = {
            name: variable.name,
            type: variable.type,
            parameter: variable.parameters,
            parentFolderId: folderId
        };

        try {
            const response = await this.http.post<any>(url, body, { headers: this.headers }).toPromise();
            console.log(`Variable "${variable.name}" created:`, response);
            createdVariableIds[variable.name] = response.variableId; // Assuming response contains variableId
        } catch (error) {
            console.error(`Error creating variable "${variable.name}":`, error);
            throw new Error("Variables couldn't be created. Check log for more details.");
        }
    }

    this.savedVariables = createdVariableIds;
  }

  // Trigger creation
  private async createTrigger(containerId: number, workspaceId: string, folderId: string): Promise<string | null> {
    const url = `${this.apiUrl}/accounts/${this.accountId}/containers/${containerId}/workspaces/${workspaceId}/triggers`;
    const body = {
        name: 'Awin - Custom Trigger',
        type: 'customEvent', // Specify the trigger type as customEvent
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
                        value: 'purchase' // Replace with the desired event name
                    }
                ]
            }
        ],
        parentFolderId: folderId
    };

    try {
        const response = await this.http.post<any>(url, body, { headers: this.headers }).toPromise();
        console.log('Trigger created:', response);
        
        // Store and return the trigger ID if creation was successful
        const triggerId = response?.triggerId;
        this.customTriggerId = triggerId; // Save the trigger ID to a class variable
        return triggerId;
    } catch (error) {
        console.error('Error creating trigger:', error);
        throw new Error("Trigger couldn't be created.");
        return null;
    }
  }

  // Tag import
  private async importCommunityTag(
      containerId: number,
      workspaceId: string,
      tagTemplateId: string,
      tagName: string,
      triggerId: string,
      parameters: any[],
      folderId: string
    ): Promise<void> {
    const url = `${this.apiUrl}/accounts/${this.accountId}/containers/${containerId}/workspaces/${workspaceId}/tags`;
    
    const body = {
        name: tagName,
        type: tagTemplateId, // Use the provided tag template type (e.g., "cvt_199645065_41")
        parameter: parameters.map(param => ({
            key: param.key,
            type: 'template',
            value: param.value
        })),
        firingTriggerId: [triggerId], // Set to the provided All Pages Trigger ID
        tagFiringOption: 'oncePerEvent', // Matches the example tag firing option
        parentFolderId: folderId,
        consentSettings: {
            consentStatus: 'notSet' // Matches the example consent settings
        }
    };

    try {
        const response = await this.http.post<any>(url, body, { headers: this.headers }).toPromise();
        console.log(`${tagName} tag created successfully:`, response);
    } catch (error) {
        console.error(`Error creating ${tagName} tag:`, error);
        throw new Error("Tags couldn't be imported.");
    }
  }
  private async importCommunityTemplate(
    containerId: number,
    workspaceId: string,
    templateName: string,
    templateId: string,
    parameters: any[],
    folderId: string
  ): Promise<void> {
  const url = `${this.apiUrl}/accounts/${this.accountId}/containers/${containerId}/workspaces/${workspaceId}/templates`;

    const body = {
      name: templateName,
      templateId: templateId, // The provided template ID (if required by GTM)
      parameter: parameters.map(param => ({
        key: param.key,
        type: 'template',
        value: param.value
      })),
      parentFolderId: folderId
    };

    try {
      const response = await this.http.post<any>(url, body, { headers: this.headers }).toPromise();
      console.log(`${templateName} template created successfully:`, response);
    } catch (error) {
      console.error(`Error creating ${templateName} template:`, error);
      throw new Error("Template couldn't be imported.");
    }
  }

  //This function exists because otherwise we would get errors for utilising the API too quickly
  private waitTimeout() {
    return new Promise((resolve) => {
      setTimeout(resolve, 30000); // 1 minute = 60000 milliseconds
    });
  }
  
}
