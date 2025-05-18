import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error en petición HTTP:', error);
        
        // Añadir lógica para manejo específico de errores
        if (error.status === 401) {
          console.log('Error de autenticación: El usuario no está autenticado');
          // Aquí podríamos redirigir al login o mostrar un mensaje
        }
        
        // Devolver un objeto error estructurado para mejor manejo
        return throwError(() => ({
          status: error.status,
          message: error.error?.message || error.statusText,
          error: error.error
        }));
      })
    );
  }
} 