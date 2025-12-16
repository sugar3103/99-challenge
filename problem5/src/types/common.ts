import { Request } from "express";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateResourceRequest {
  title: string;
  description: string;
}

export interface UpdateResourceRequest {
  title?: string;
  description?: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, "password">;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface RequestWithUser extends Request {
  user?: Omit<User, "password">;
}
