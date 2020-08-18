import { Component, OnInit } from '@angular/core';
import { FirebaseUISignInSuccessWithAuthResult, FirebaseUISignInFailure, FirebaseuiAngularLibraryService } from 'firebaseui-angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private firebaseuiAngularLibraryService: FirebaseuiAngularLibraryService, private router: Router) {
    firebaseuiAngularLibraryService.firebaseUiInstance.disableAutoSignIn();
  }

  ngOnInit() {
  }

  successCallback(signInSuccessData: FirebaseUISignInSuccessWithAuthResult) {
    this.router.navigate(['/chatbot']);
  }

  errorCallback(errorData: FirebaseUISignInFailure) {
    console.log(errorData);
  }

}
