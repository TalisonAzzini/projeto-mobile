import { createContext, useContext, useState } from "react";
import { Appearance, useColorScheme } from "react-native";

const TemaContext = createContext(null);

export function TemaProvider({ children }) {
  const esquemaSistema = useColorScheme();
  const [temaManual, setTemaManual] = useState(null);
  const temaEscuro = temaManual ?? (esquemaSistema === "dark");

  function alternarTema() {
    const novoTemaEscuro = !temaEscuro;
    setTemaManual(novoTemaEscuro);
    Appearance.setColorScheme(novoTemaEscuro ? "dark" : "light");
  }

  return (
    <TemaContext.Provider value={{ temaEscuro, alternarTema }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const tema = useContext(TemaContext);
  if (!tema) {
    throw new Error("useTema deve ser usado dentro de TemaProvider.");
  }
  return tema;
}
