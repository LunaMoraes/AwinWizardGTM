import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../Services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-oauth-callback',
  template: '<p>Authenticating...</p>'
})
export class OauthComponent implements OnInit {

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Call a method in AuthenticationService to handle the callback
    this.authService.handleOAuthCallback().then(() => {
      // Redirect to home or another page once authenticated
      this.router.navigate(['/home']);
    }).catch(error => {
      console.error("Authentication failed", error);
      // Handle authentication errors or redirect to a login page
      this.router.navigate(['/home']);
    });
  }
}