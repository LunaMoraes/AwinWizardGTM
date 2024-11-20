import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IContainer } from '../models/wizard-interfaces';
import { WizardService } from '../Services/wizard-service.service';
import { DevService } from '../Services/dev.service';
import { AuthenticationService } from '../Services/authentication.service';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  styleUrls: ['../app.component.scss', './home.component.scss', '../../styles.scss'],
  imports: [FormsModule, CommonModule]
})

export class HomeComponent {
  gtmContainer: IContainer[] = [];
  gtmContainerS2S: IContainer[] = [];
  gtmContainerS2SClient: IContainer[] = [];
  selectedOption!: number;
  advertiserID!: number;
  advertiserIDS2S!: number;
  containers: any[] = [];
  requestStatus: string = 'stopped';
  errorMessage: any;
  warnMessage: any;
  warnMessageS2S: any;
  devToolsActive: boolean = false;
  warn: boolean = false;
  warnS2S: boolean = false;
  authed: boolean = false;
  provideAccountID: boolean = true;
  accountIDValue: number = 0;
  accountIDValueS2S!: number;
  touchedFields: { [key: string]: boolean } = {};

  // Define the available installation options
  installationOptions = [
    { id: 1, label: 'Option 1: Ecommerce' },
    { id: 2, label: 'Option 2: ActionField' },
    { id: 3, label: 'Option 3: Custom' }
  ];
  
  constructor(public devService: DevService, private WizardService: WizardService, private authService: AuthenticationService) {}
  
  // Basic Functions
  startLogin(): void {
    this.authService.signIn();
    this.authed = true;
  }
  signOut(){
    this.authService.signOut();
    this.authed = false;
  }

  // Validators
  isValidGTMContainer(gtmContainer: any): boolean {
    const gtmPattern = /^GTM-[A-Z0-9]{6,}$/i;
    return gtmPattern.test(gtmContainer);
  }
  isValidAdvertiserID(id: any): boolean {
    const advertiserIdPattern = /^\d{3,}$/;
    if (!advertiserIdPattern.test(id)) {
      return false;
    }
    
    // Convert to a number and check if it is even
    const idNumber = parseInt(id, 10);
    return idNumber % 2 === 1;
  }
  isValidAccountID(AccountID: any): boolean {
    if (this.provideAccountID == false) {return true;}
    
    const accountPattern = /^\d{6,}$/;
    return accountPattern.test(AccountID);
  }

  validateInputs(): boolean {
    if (!this.isValidGTMContainer(this.gtmContainer)) {
      setTimeout(() => {
        this.warnMessage = 'Invalid GTM Container ID. Format should be GTM-XXXXXXX.';
        this.warn = true;
      });
      return false;
    } else if (!this.isValidAdvertiserID(this.advertiserID)) {
      setTimeout(() => {
        this.warnMessage = 'Invalid Advertiser ID. It should be at least a 3-digit odd number.';
        this.warn = true;
      });
      return false;
    } else if (!this.isValidAccountID(this.accountIDValue)) {
      setTimeout(() => {
        this.warnMessage = 'Invalid Account ID. It should be at least a 6-digit number.';
        this.warn = true;
      });
      return false;
    } 
    setTimeout(() => {
      this.warnMessage = ''; // Clear error message if all validations pass
      this.warn = false;
    });
    return true;
  }
  validateInputsS2S(){
    
    if (!this.isValidGTMContainer(this.gtmContainerS2S)) {
      setTimeout(() => {
        this.warnMessageS2S = 'Invalid Server GTM Container ID. Format should be GTM-XXXXXXX.';
        this.warnS2S = true;
      });
      return false;
    } else if (!this.isValidAdvertiserID(this.gtmContainerS2SClient)) {
      setTimeout(() => {
        this.warnMessageS2S = 'Invalid Client GTM Container ID. Format should be GTM-XXXXXXX.';
        this.warnS2S = true;
      });
      return false;
    } else if (!this.isValidAdvertiserID(this.advertiserIDS2S)) {
      setTimeout(() => {
        this.warnMessageS2S = 'Invalid Advertiser ID. It should be at least a 3-digit odd number.';
        this.warnS2S = true;
      });
      return false;
    } else if (!this.isValidAccountID(this.accountIDValueS2S)) {
      setTimeout(() => {
        this.warnMessageS2S = 'Invalid Account ID. It should be at least a 6-digit number.';
        this.warnS2S = true;
      });
      return false;
    } 
    setTimeout(() => {
      this.warnMessage = ''; // Clear error message if all validations pass
      this.warn = false;
    });
    return true;
  }


  // Handle form submission and setup start
  onSubmit(): void {
    if(this.provideAccountID==false){this.accountIDValue = 0}

    this.installGTM(this.gtmContainer, this.selectedOption, this.advertiserID, this.accountIDValue);
  }
  onSubmitS2S(): void {
  }

  private async installGTM(ContainerID: IContainer[], SelectedOption: number, advertiserID:number, accountIDValue: number): Promise<void> {
    this.requestStatus = "in-progress"
    let setup = await this.WizardService.startSetup(ContainerID,SelectedOption,advertiserID,accountIDValue)
    if (setup.status=='success'){
      this.requestStatus = "success"
    }
    else{
      this.requestStatus = "error"
      this.errorMessage = setup.message;
    }
  }




  //Dev Tools Buttons
  toggleDevTools(){
    if(this.devToolsActive == true){
      this.devToolsActive = false;
    }else{
      this.devToolsActive = true;
    }
  }
  fetchContainers(): void {
    this.authService.fetchContainers(environment.TEST_ACCOUNT_ID)
      .then((data) => {
        this.containers = data.container || [];
        console.log("Containers fetched:", this.containers);
      });
  }
  fetchAccountId(): void {
    this.authService.fetchAccountIdByContainerPublicId('GTM-MPZ95TMZ');
  }
  testValidation(){
    this.validateInputs();
  }
  logErrors(){
    console.log(this.warnMessage)
    console.log(this.errorMessage)
  }
  debug(){}

}
