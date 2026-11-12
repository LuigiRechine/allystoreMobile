
import { api } from "./api";
import {
  salvarToken,
  removerToken,
} from "./token";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  status: string;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  lojaId: number;
}

export interface Perfil {
  usuario: Usuario;
  clientes?: Cliente[];
  token?: string;
}

interface LoginData {
  email: string;
  senha: string;
}

interface CadastroData {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf: string;
  lojaId: number;
}

export async function login(dados: LoginData): Promise<Perfil> {
  const resposta = await api<Perfil & { token: string }>(
    "/api/auth/login",
    {
      method: "POST",
      authenticated: false,
      body: JSON.stringify(dados),
    }
  );

  await salvarToken(resposta.token);

  return resposta;
}

export async function cadastrar(
  dados: CadastroData
): Promise<Perfil> {
  const resposta = await api<Perfil & { token: string }>(
    "/api/auth/registrar",
    {
      method: "POST",
      authenticated: false,
      body: JSON.stringify({
        ...dados,
        tipo: "cliente",
      }),
    }
  );

  await salvarToken(resposta.token);

  return resposta;
}

export async function buscarPerfil(): Promise<Perfil> {
  return api<Perfil>("/api/auth/me");
}

export async function logout() {
  await removerToken();
}
