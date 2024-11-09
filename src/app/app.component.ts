import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExampleComponent } from './example/example.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ExampleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'AwinWizardGTM';
}
