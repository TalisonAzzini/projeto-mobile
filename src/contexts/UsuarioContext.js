import { createContext, useContext, useState } from "react";

// Guarda quem está logado e deixa qualquer tela consultar ou mudar isso.
const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  // PROVISÓRIO (parte do front): entra direto como dono, sem conferir senha.
  // Quem fizer o login de verdade troca o conteúdo desta função pela chamada ao auth.js.
  // Para testar o visual do funcionário, troque 'dono' por 'funcionario'.
  function entrar() {
    setUsuario({ nome: "Usuário de teste", perfil: "dono" });
  }

  function sair() {
    setUsuario(null);
  }

  return (
    <UsuarioContext.Provider value={{ usuario, entrar, sair }}>
      {children}
    </UsuarioContext.Provider>
  );
}

// Atalho para as telas usarem: const { usuario, entrar, sair } = useUsuario();
export function useUsuario() {
  return useContext(UsuarioContext);
}
