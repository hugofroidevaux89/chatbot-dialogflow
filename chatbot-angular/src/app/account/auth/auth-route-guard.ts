import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { take, map, tap } from 'rxjs/operators';

@Injectable()
export class AppRouteGuard implements CanActivate, CanActivateChild, CanLoad {

    constructor(
        private router: Router,
        private afAuth: AngularFireAuth
    ) { }

    canActivateInternal(data: any, state: RouterStateSnapshot): Observable<boolean> {
        return this.afAuth.authState
        .pipe(take(1))
        .pipe(map(authState => !!authState))
        // tslint:disable-next-line: no-shadowed-variable
        .pipe(tap(auth => {
          if (!auth) {
            this.router.navigate([this.selectBestRoute()]);
          }
        }));
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.canActivateInternal(route.data, state);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.canActivate(route, state);
    }

    canLoad(route: any): Observable<boolean> | Promise<boolean> | boolean {
        return this.canActivateInternal(route.data, null);
    }

    selectBestRoute(): string {
       return '/login';
    }
}
