import { UsuarioProvider } from "./src/contexts/UsuarioContext";
import { TemaProvider } from "./src/contexts/TemaContext";
import Navegacao from "./src/navigation/Navegacao";

export default function App() {
  return (
    <TemaProvider>
      <UsuarioProvider>
        <Navegacao />
      </UsuarioProvider>
    </TemaProvider>
  );
}
