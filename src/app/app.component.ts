import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExampleComponent } from './example/example.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'AwinWizardGTM';
  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;
  
  ngAfterViewInit() {
    const videoElement = this.backgroundVideo.nativeElement;
    videoElement.muted = true;
    videoElement.play().catch(error => {
    console.log('Autoplay was prevented:', error);
  });
  }
}
