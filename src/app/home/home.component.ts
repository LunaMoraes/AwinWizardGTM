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
  styleUrls: ['./home.component.scss', '../../styles.scss'],
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

  constructor(private WizardService: WizardService, private authService: AuthenticationService) {}
  startLogin(): void {
    this.authService.signIn();
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
    this.authService.fetchVariables(environment.CONTAINER_ID, '2');
  }
  fetchTriggers(): void {
    this.authService.fetchTriggers(environment.CONTAINER_ID, '2').then(triggers => {
      console.log("Triggers fetched successfully:", triggers);
    }).catch(error => {
      console.error("Error fetching triggers:", error);
    });
  }
  fetchTags(): void {
    this.authService.fetchTags(environment.CONTAINER_ID, '2').then(tags => {
      console.log("Tags fetched successfully:", tags);
    }).catch(error => {
      console.error("Error fetching tags:", error);
    });
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

  private installGTM(ContainerID: IContainer[], SelectedOption: number, advertiserID:number): void {
    this.WizardService.startSetup(ContainerID,SelectedOption,advertiserID)
  }
}
