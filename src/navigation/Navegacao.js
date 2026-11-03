import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useUsuario } from "../contexts/UsuarioContext";
import TelaLogin from "../screens/TelaLogin";
import TelaPainel from "../screens/TelaPainel";
import TelaEstoque from "../screens/TelaEstoque";
import TelaMovimentacao from "../screens/TelaMovimentacao";
import TelaItem from "../screens/TelaItem";
import TelaScanner from "../screens/TelaScanner";
import TelaUsuarios from "../screens/TelaUsuarios";

const Pilha = createNativeStackNavigator();
const Abas = createBottomTabNavigator();

// Ícone de cada aba (nome do ícone na biblioteca Ionicons)
const ICONES = {
  Painel: "grid-outline",
  Estoque: "cube-outline",
  Movimentacao: "swap-vertical-outline",
};

// As três abas de baixo
function NavegacaoAbas() {
  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0F766E",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONES[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Abas.Screen name="Painel" component={TelaPainel} />
      <Abas.Screen name="Estoque" component={TelaEstoque} />
      <Abas.Screen
        name="Movimentacao"
        component={TelaMovimentacao}
        options={{ tabBarLabel: "Movimentação" }}
      />
    </Abas.Navigator>
  );
}

export default function Navegacao() {
  const { usuario } = useUsuario();
  const ehDono = usuario?.perfil === "dono";

  return (
    <NavigationContainer>
      <Pilha.Navigator screenOptions={{ headerShown: false }}>
        {usuario ? (
          <>
            <Pilha.Screen name="Abas" component={NavegacaoAbas} />
            <Pilha.Screen name="Item" component={TelaItem} />
            <Pilha.Screen name="Scanner" component={TelaScanner} />
            {ehDono && (
              <Pilha.Screen name="Usuarios" component={TelaUsuarios} />
            )}
          </>
        ) : (
          <Pilha.Screen name="Login" component={TelaLogin} />
        )}
      </Pilha.Navigator>
    </NavigationContainer>
  );
}
