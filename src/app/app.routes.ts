// app.routes.ts
import { Routes } from '@angular/router';
import { ExampleComponent } from './example/example.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'example', component: ExampleComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];
