import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GlobalErrorInterceptor implements HttpInterceptor {
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';

        if (error.error instanceof ErrorEvent) {
          // Client-side errors (e.g., network issues)
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side errors
          switch (error.status) {
            case 401:
              errorMessage = 'Unauthorized. Please login again.';
              // Optional: trigger logout logic here
              break;
            case 403:
              errorMessage = 'You do not have permission to perform this action.';
              break;
            case 404:
              errorMessage = 'The requested resource was not found.';
              break;
            case 500:
              errorMessage = 'Internal Server Error. Please try again later.';
              break;
            default:
              errorMessage = error.error?.error || errorMessage;
          }
        }

        // You can integrate a Toast/SnackBar service here to show the message
        console.error('Logging Error:', errorMessage);
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}