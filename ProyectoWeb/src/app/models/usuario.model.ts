export interface Usuario {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  token?: string;
  role?: string;
}

export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface RegistroUsuario {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: string;
} 