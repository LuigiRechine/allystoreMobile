
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  Perfil,
  login,
  cadastrar,
  buscarPerfil,
  logout,
} from "../services/auth";

import { obterToken } from "../services/token";

interface CadastroDados {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf: string;
  lojaId: number;
}

interface AuthContextData {
  perfil: Perfil | null;
  carregando: boolean;
  autenticado: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  registrar: (dados: CadastroDados) => Promise<void>;
  sair: () => Promise<void>;
  atualizarPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  async function atualizarPerfil() {
    const dados = await buscarPerfil();
    setPerfil(dados);
  }

  async function entrar(email: string, senha: string) {
    const dados = await login({ email, senha });
    setPerfil(dados);
  }

  async function registrar(dados: CadastroDados) {
    const resposta = await cadastrar(dados);
    setPerfil(resposta);
  }

  async function sair() {
    await logout();
    setPerfil(null);
  }

  useEffect(() => {
    async function carregarSessao() {
      try {
        const token = await obterToken();

        if (!token) {
          setPerfil(null);
          return;
        }

        const dados = await buscarPerfil();
        setPerfil(dados);
      } catch {
        await logout();
        setPerfil(null);
      } finally {
        setCarregando(false);
      }
    }

    carregarSessao();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        perfil,
        carregando,
        autenticado: !!perfil,
        entrar,
        registrar,
        sair,
        atualizarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
