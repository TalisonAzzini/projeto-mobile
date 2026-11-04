import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { mapearUsuario } from "../services/autenticacao";

// Guarda quem está logado e deixa qualquer tela consultar ou mudar isso.
const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setUsuario(mapearUsuario(sessao?.user));
      setCarregando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  function entrar(usuarioAutenticado) {
    setUsuario(usuarioAutenticado);
  }

  async function sair() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }

    setUsuario(null);
  }

  return (
    <UsuarioContext.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </UsuarioContext.Provider>
  );
}

// Atalho para as telas usarem: const { usuario, entrar, sair } = useUsuario();
export function useUsuario() {
  return useContext(UsuarioContext);
}
