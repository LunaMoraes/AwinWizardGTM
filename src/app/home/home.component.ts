import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IContainer } from '../models/wizard-interfaces';
import { WizardService } from '../Services/wizard-service.service';

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
  
  // Define the available installation options
  installationOptions = [
    { id: 1, label: 'Option 1: Ecommerce' },
    { id: 2, label: 'Option 2: ActionField' },
    { id: 3, label: 'Option 3: Custom' }
  ];

  constructor(private WizardService: WizardService) {}

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
