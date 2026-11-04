import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const UsuarioContext = createContext(null);

async function buscarUsuario(sessao) {
  const { data: registro, error } = await supabase
    .from("usuarios")
    .select("nome, cargo")
    .eq("id", sessao.user.id)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST205") {
      throw new Error(
        "A tabela public.usuarios não foi encontrada. Confira o nome da tabela no Supabase.",
      );
    }

    if (error.code === "42703" && error.message.includes("cargo")) {
      throw new Error(
        "A coluna public.usuarios.cargo não existe. Confira o schema da tabela no Supabase.",
      );
    }

    if (error.code === "42501") {
      throw new Error(
        "O banco negou acesso ao perfil. Configure uma política RLS que permita ao usuário ler a própria linha.",
      );
    }

    throw new Error(
      `Falha ao consultar o perfil (${error.code}): ${error.message}`,
    );
  }

  if (!registro) {
    throw new Error(
      `A conta está autenticada, mas não tem perfil em public.usuarios. Cadastre uma linha com id ${sessao.user.id}.`,
    );
  }

  if (registro.cargo !== "dono" && registro.cargo !== "funcionario") {
    throw new Error(
      "O cargo desta conta não é válido. Solicite a correção do cadastro.",
    );
  }

  return {
    id: sessao.user.id,
    email: sessao.user.email,
    nome: registro.nome || sessao.user.email,
    perfil: registro.cargo,
  };
}

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, sessao) => {
      if (evento !== "INITIAL_SESSION" && evento !== "SIGNED_OUT") return;

      setTimeout(async () => {
        if (!ativo) return;

        const inicializando = evento === "INITIAL_SESSION";
        if (inicializando) setCarregando(true);

        try {
          if (!sessao) {
            setUsuario(null);
            return;
          }

          const usuarioCarregado = await buscarUsuario(sessao);
          if (ativo) {
            setUsuario(usuarioCarregado);
            setErro("");
          }
        } catch (erroPerfil) {
          if (ativo) {
            setUsuario(null);
            setErro(erroPerfil.message);
            try {
              const { error: erroSaida } = await supabase.auth.signOut();
              if (erroSaida) {
                setErro(
                  `${erroPerfil.message} Não foi possível encerrar a sessão.`,
                );
              }
            } catch {
              setErro(
                `${erroPerfil.message} Não foi possível encerrar a sessão.`,
              );
            }
          }
        } finally {
          if (ativo && inicializando) {
            setCarregando(false);
          }
        }
      }, 0);
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function entrar(email, senha) {
    setErro("");

    if (!email.trim() || !senha) {
      setErro("Informe seu e-mail e sua senha.");
      return;
    }

    let autenticado = false;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          setErro("E-mail ou senha inválidos.");
        } else if (error.message === "Email not confirmed") {
          setErro("Confirme seu e-mail antes de entrar.");
        } else {
          setErro(
            "Não foi possível entrar. Verifique sua conexão e tente novamente.",
          );
        }
        return;
      }

      autenticado = true;
      const usuarioAutenticado = await buscarUsuario(data.session);
      setUsuario(usuarioAutenticado);
    } catch (erroLogin) {
      setErro(
        erroLogin.message ||
          "Não foi possível entrar. Verifique sua conexão e tente novamente.",
      );
      if (autenticado) {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            setErro("Não foi possível validar o perfil nem encerrar a sessão.");
          }
        } catch {
          setErro("Não foi possível validar o perfil nem encerrar a sessão.");
        }
      }
    }
  }

  async function sair() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error("Não foi possível encerrar a sessão. Tente novamente.");
    }
  }

  function limparErro() {
    setErro("");
  }

  return (
    <UsuarioContext.Provider
      value={{ usuario, entrar, sair, carregando, erro, limparErro }}
    >
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuario() {
  return useContext(UsuarioContext);
}
