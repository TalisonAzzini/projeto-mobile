import { UsuarioProvider } from "./src/contexts/UsuarioContext";
import Navegacao from "./src/navigation/Navegacao";

export default function App() {
  return (
    <UsuarioProvider>
      <Navegacao />
    </UsuarioProvider>
  );
}
