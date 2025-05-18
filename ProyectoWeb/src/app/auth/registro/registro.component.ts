import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  registroForm: FormGroup;
  error: string = '';
  loading: boolean = false;
  mostrarCodigoAdmin: boolean = false;
  codigoAdminCorrecto: string = 'admin123'; // Código secreto para crear admin

  roles = [
    { value: 'buyer', label: 'Comprador' },
    { value: 'seller', label: 'Vendedor' },
    { value: 'admin', label: 'Administrador' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]],
      role: ['buyer', [Validators.required]],
      codigoAdmin: [{ value: '', disabled: true }]
    }, { 
      validators: this.passwordMatchValidator
    });

    // Escuchar cambios en el rol seleccionado
    this.registroForm.get('role')?.valueChanges.subscribe(role => {
      this.mostrarCodigoAdmin = role === 'admin';
      
      const codigoAdminControl = this.registroForm.get('codigoAdmin');
      if (this.mostrarCodigoAdmin) {
        codigoAdminControl?.enable();
        codigoAdminControl?.setValidators([Validators.required]);
      } else {
        codigoAdminControl?.disable();
        codigoAdminControl?.clearValidators();
      }
      codigoAdminControl?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmarPassword = form.get('confirmarPassword')?.value;
    return password === confirmarPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registroForm.valid) {
      // Verificar el código de administrador si es necesario
      if (this.mostrarCodigoAdmin) {
        const codigoIngresado = this.registroForm.get('codigoAdmin')?.value;
        if (codigoIngresado !== this.codigoAdminCorrecto) {
          this.error = 'Código de administrador incorrecto';
          return;
        }
      }
      
      this.loading = true;
      this.error = '';
      
      // Eliminar confirmarPassword y codigoAdmin antes de enviar
      const datosUsuario = { ...this.registroForm.value };
      delete datosUsuario.confirmarPassword;
      delete datosUsuario.codigoAdmin;
      
      this.authService.registro(datosUsuario)
        .subscribe({
          next: () => {
            this.router.navigate(['/login']);
          },
          error: (err) => {
            if (err.error && err.error.message) {
              this.error = err.error.message;
            } else {
              this.error = 'Error al registrar el usuario. Intente nuevamente.';
            }
            this.loading = false;
            console.error('Error de registro:', err);
          }
        });
    }
  }

  verificarCodigoAdmin(): boolean {
    if (!this.mostrarCodigoAdmin) return true;
    
    const codigo = this.registroForm.get('codigoAdmin')?.value;
    return codigo === this.codigoAdminCorrecto;
  }
} 