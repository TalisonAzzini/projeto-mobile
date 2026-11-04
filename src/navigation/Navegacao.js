import { ActivityIndicator, Alert, Pressable, Text } from "react-native";
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

const OPCOES_CABECALHO = {
  headerStyle: { backgroundColor: "#F6F7F9" },
  headerShadowVisible: false,
  headerTintColor: "#0F766E",
  headerTitleStyle: { color: "#1B2430", fontWeight: "bold" },
};

const ICONES = {
  Painel: "grid-outline",
  Estoque: "cube-outline",
  Movimentacao: "swap-vertical-outline",
};

function BotaoCabecalho({ texto, aoPressionar }) {
  return (
    <Pressable onPress={aoPressionar} hitSlop={8}>
      <Text style={{ color: "#0F766E", fontSize: 16, fontWeight: "600" }}>
        {texto}
      </Text>
    </Pressable>
  );
}

function NavegacaoAbas() {
  const { usuario, sair } = useUsuario();
  const ehDono = usuario?.perfil === "dono";

  async function encerrarSessao() {
    try {
      await sair();
    } catch (error) {
      Alert.alert("Não foi possível sair", error.message);
    }
  }

  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
        ...OPCOES_CABECALHO,
        tabBarActiveTintColor: "#0F766E",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONES[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Abas.Screen
        name="Painel"
        component={TelaPainel}
        options={{
          headerRight: () => (
            <BotaoCabecalho texto="Sair" aoPressionar={encerrarSessao} />
          ),
        }}
      />
      <Abas.Screen
        name="Estoque"
        component={TelaEstoque}
        options={({ navigation }) => ({
          headerRight: ehDono
            ? () => (
                <BotaoCabecalho
                  texto="Novo item"
                  aoPressionar={() => navigation.navigate("Item")}
                />
              )
            : undefined,
        })}
      />
      <Abas.Screen
        name="Movimentacao"
        component={TelaMovimentacao}
        options={{ title: "Movimentação", tabBarLabel: "Movimentação" }}
      />
    </Abas.Navigator>
  );
}

export default function Navegacao() {
  const { usuario, carregando } = useUsuario();
  const ehDono = usuario?.perfil === "dono";

  if (carregando) {
    return <ActivityIndicator style={{ flex: 1 }} color="#0F766E" />;
  }

  return (
    <NavigationContainer>
      <Pilha.Navigator screenOptions={OPCOES_CABECALHO}>
        {usuario ? (
          <>
            <Pilha.Screen
              name="Abas"
              component={NavegacaoAbas}
              options={{ headerShown: false }}
            />
            <Pilha.Screen
              name="Item"
              component={TelaItem}
              options={({ route }) => ({
                title: route.params?.item ? "Item" : "Novo item",
              })}
            />
            <Pilha.Screen
              name="Scanner"
              component={TelaScanner}
              options={{ title: "Ler código" }}
            />
            {ehDono && (
              <Pilha.Screen
                name="Usuarios"
                component={TelaUsuarios}
                options={{ title: "Usuários" }}
              />
            )}
          </>
        ) : (
          <Pilha.Screen
            name="Login"
            component={TelaLogin}
            options={{ headerShown: false }}
          />
        )}
      </Pilha.Navigator>
    </NavigationContainer>
  );
}
