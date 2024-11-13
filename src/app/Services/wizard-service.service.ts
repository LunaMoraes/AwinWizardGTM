import { Injectable } from '@angular/core';
import { IContainer, ITemplate } from '../models/wizard-interfaces';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../Services/authentication.service';
import { GAPIService } from '../Services/gapi.service';
import { templateData } from './templateData';
import { parameterData } from './parameterData';

@Injectable({
  providedIn: 'root'
})
export class WizardService {

  private containerId: number = 0;
  private FolderID: any = {};
  private accountId: any = undefined;
  private customTriggerId: any = {};
  private TemplateIDs: ITemplate = {};

  constructor(
    private authService: AuthenticationService,
    private gapiService: GAPIService,
  ) {}

  // Basic Functions
  private getPrefix(optionId: number): string {
    switch (optionId) {
      case 1: return 'ecommerce.';
      case 2: return 'actionField.';
      case 3: return 'custom.';
      default: return '';
    }
  }
  
  private waitTimeout() { 
    //This function exists because otherwise we would get errors for utilising the API too quickly
    return new Promise((resolve) => {
      setTimeout(resolve, 20000); // 1 minute = 60000 milliseconds
    });
  }


  // Pre-routine function
  async startSetup(container: IContainer[], optionId: number, AdvertiserID: number, accountIDValue:number): Promise<{ status: string, message?: any }> {
    console.log('Starting setup | Option ID:', optionId, '| Advertiser ID:', AdvertiserID);

    // Fetch account ID if not provided
    if(accountIDValue == 0){
      console.log("Starting Setup without account ID provided")
      this.accountId = await this.gapiService.fetchAccountId(container);
    } else{
      console.log("Starting Setup with account ID: ", accountIDValue)
      this.accountId = accountIDValue;
    }
    
    let prefix = this.getPrefix(optionId);

    try {
      // Fetch containers to get the numeric containerId
      const containersData = await this.authService.fetchContainers(this.accountId);
      const targetContainer = containersData.container.find((cont: any) => cont.publicId === container); // Match with public ID if available
      if (targetContainer) {
        this.containerId = targetContainer.containerId; 
        console.log("Found numeric container ID:", this.containerId);
      } else {
        throw new Error("Container with the specified public ID not found.");
      }

      // Fetch default workspace ID for the container
      const workspaceId = await this.authService.fetchDefaultWorkspace(this.accountId, this.containerId);
      
      // Proceed with the setup routine now that we have the necessary parameters
      await this.startBasicRoutine(AdvertiserID, prefix, workspaceId);


      console.log("Setup completed successfully.");
      return { status: "success" };

    } catch (error) {
      console.error("Error fetching containers or starting setup:", error);
      return { status: "failed", message: error || "An error has occurred. Check Logs for detail" };
    }
  }


  // Basic setup routine
  private async startBasicRoutine(AdvertiserID: any, prefix: string, workspaceId: string) {
    let parameters:any = [];

    //ensuring that the headers are not null
    if(this.authService.headers == null){
      console.log("Headers are null, updating")
      this.authService.updateHeaders();
    }

    this.FolderID = await this.gapiService.createFolder(workspaceId, this.accountId, this.containerId);

    parameters = [
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
        },
        {
          name: 'Awin - Currency',
          type: 'v',
          parameters: [
              { key: 'dataLayerVersion', type: 'integer', value: '2' },
              { key: 'setDefaultValue', type: 'boolean', value: 'false' },
              { key: 'name', type: 'template', value: prefix + 'currency' }
          ]
      }
    ];
    await this.gapiService.createVariables(this.containerId, workspaceId, this.FolderID, prefix, parameters, this.accountId);
    this.customTriggerId = await this.gapiService.createTrigger(this.containerId, workspaceId, this.FolderID, this.accountId);

    await this.waitTimeout() //Removing chance of getting denial

    this.TemplateIDs.MasterTagTemplateID = await this.gapiService.importCommunityTemplate(this.containerId, workspaceId, "Awin - Mastertag", [parameterData.MASTERTAG_TEMPLATE], this.FolderID, templateData.MASTERTAG, this.accountId);
    this.TemplateIDs.LastClickTemplateID= await this.gapiService.importCommunityTemplate(this.containerId, workspaceId, "Awin - AW Last Click Identifier", [parameterData.LASTCLICK_TEMPLATE], this.FolderID, templateData.LASTCLICK, this.accountId);
    this.TemplateIDs.ConversionTemplateID = await this.gapiService.importCommunityTemplate(this.containerId, workspaceId, "Awin - Conversion Tag", [parameterData.CONVERSION_TEMPLATE], this.FolderID, templateData.CONVERSION, this.accountId);
    
    await this.waitTimeout() //Removing chance of getting denial

    parameters = [{ key: 'advertiserId', type: 'TEMPLATE', value: AdvertiserID }];
    await this.gapiService.importCommunityTag(
      this.containerId, workspaceId, 
      'cvt_'+this.containerId+"_"+this.TemplateIDs.MasterTagTemplateID, 
      "Awin - Mastertag", 
      environment.ALL_PAGES_TRIGGER, 
      parameters, 
      this.FolderID,
      this.accountId
    );
    
    await this.gapiService.importCommunityTag(
      this.containerId,
      workspaceId,
      'cvt_'+this.containerId+"_"+this.TemplateIDs.LastClickTemplateID,
      "Awin - AW Last Click Identifier",
      environment.ALL_PAGES_TRIGGER,
      [...parameterData.LASTCLICK_TAG],
      this.FolderID,
      this.accountId
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
      { key: 'currency', type: 'template', value: '{{Awin - Currency}}' },
      { key: 'advertiserId', type: 'template', value: AdvertiserID }
    ];

    await this.gapiService.importCommunityTag(
      this.containerId,
      workspaceId,
      'cvt_'+this.containerId+"_"+this.TemplateIDs.ConversionTemplateID, 
      "Awin - Conversion Tag",
      this.customTriggerId,
      parameters,
      this.FolderID,
      this.accountId
    );
  }

}
