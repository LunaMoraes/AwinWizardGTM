import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IContainer } from '../models/wizard-interfaces';
import { WizardService } from '../Services/wizard-service.service';
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
  selectedOption!: number;
  advertiserID!: number;
  containers: any[] = [];

  // Define the available installation options
  installationOptions = [
    { id: 1, label: 'Option 1: Ecommerce' },
    { id: 2, label: 'Option 2: ActionField' },
    { id: 3, label: 'Option 3: Custom' }
  ];
  requestStatus: string = 'stopped';
  errorMessage: any;
  devToolsActive: boolean = false;
  warn: boolean = false;
  authed: boolean = false;
  
  constructor(private WizardService: WizardService, private authService: AuthenticationService) {}
  startLogin(): void {
    this.authService.signIn();
    this.authed = true;
  }

  toggleDevTools(){
    if(this.devToolsActive == true){
      this.devToolsActive = false;
    }else{
      this.devToolsActive = true;
    }
  }
  // Method to fetch containers
  fetchContainers(): void {
    this.authService.fetchContainers()
      .then((data) => {
        this.containers = data.container || [];
        console.log("Containers fetched:", this.containers);
      })
      .catch(error => {
        console.error("Error fetching containers:", error);
      });
  }
  fetchVariables(): void {
    this.authService.fetchVariables(environment.TEST_CONTAINER_ID, '2');
  }
  fetchTriggers(): void {
    this.authService.fetchTriggers(environment.TEST_CONTAINER_ID, '2').then(triggers => {
      console.log("Triggers fetched successfully:", triggers);
    }).catch(error => {
      console.error("Error fetching triggers:", error);
    });
  }
  fetchTags(): void {
    this.authService.fetchTags(environment.TEST_CONTAINER_ID, '2').then(tags => {
      console.log("Tags fetched successfully:", tags);
    }).catch(error => {
      console.error("Error fetching tags:", error);
    });
  }
  fetchTemplates(): void {
    this.authService.fetchTemplates(environment.TEST_CONTAINER_ID, '2').then(templates => {
        console.log("Templates fetched successfully:", templates);
    }).catch(error => {
        console.error("Error fetching templates:", error);
    });
  }
  fetchAccountId(): void {
    this.authService.fetchAccountIdByContainerPublicId('GTM-MPZ95TMZ')
      .then(accountId => {
        console.log("Account ID fetched successfully:", accountId);
      })
      .catch(error => {
        console.error("Error fetching account ID:", error);
      });
  }

  // Validator for GTM Container ID (must match GTM- followed by digits)
  isValidGTMContainer(gtmContainer: any): boolean {
    const gtmPattern = /^GTM-[A-Z0-9]{7,}$/i;
    return gtmPattern.test(gtmContainer);
  }

  // Validator for Advertiser ID (must be numeric and of length 7)
  isValidAdvertiserID(id: any): boolean {
    const advertiserIdPattern = /^\d{5,}$/;
    if (!advertiserIdPattern.test(id)) {
      return false;
    }
    
    // Convert to a number and check if it is even
    const idNumber = parseInt(id, 10);
    return idNumber % 2 === 0;
  }

  // Function to check all validations before submission
  validateInputs(): boolean {
    if (!this.isValidGTMContainer(this.gtmContainer)) {
      this.errorMessage = 'Invalid GTM Container ID. Format should be GTM-XXXXXXX.';
      this.warn = true;
      return false;
    } else if (!this.isValidAdvertiserID(this.advertiserID)) {
      this.errorMessage = 'Invalid Advertiser ID. It should be a 5-digit number.';
      this.warn = true;
      return false;
    }
    this.errorMessage = ''; // Clear error message if all validations pass
    this.warn = false;
    return true;
  }

  testValidation(){
    this.validateInputs();
    console.log(this.errorMessage)
  }
  // Handle form submission
  onSubmit(): void {
    if (!this.gtmContainer || !this.selectedOption || !this.advertiserID) {
      alert('Please enter a GTM Container ID and select an installation option.');
      return;
    }
    
    // Add logic to process the form data based on the selected installation option
    this.installGTM(this.gtmContainer, this.selectedOption, this.advertiserID);
  }

  private async installGTM(ContainerID: IContainer[], SelectedOption: number, advertiserID:number): Promise<void> {
    this.requestStatus = "in-progress"
    let setup = await this.WizardService.startSetup(ContainerID,SelectedOption,advertiserID)
    if (setup.status=='success'){
      this.requestStatus = "success"
    }
    else{
      this.requestStatus = "error"
      this.errorMessage = setup.message;
    }
  }
}
