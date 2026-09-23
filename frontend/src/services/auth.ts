import { apiRequest } from "./api";

export type UserRole = "USER" | "ADMIN";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export const loginRequest = async (
  email: string,
  password: string
): Promise<LoginResponse> => {

  const response = await apiRequest("/auth/login", {
    method: "POST",

    body: JSON.stringify({
      email,
      password
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No se pudo iniciar sesión."
    );
  }

  return data;
};

export type RegisterResponse = {
  id: number;
  name: string;
  email: string;
};

export const registerRequest = async (
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> => {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No se pudo registrar el usuario."
    );
  }

  return data;
};