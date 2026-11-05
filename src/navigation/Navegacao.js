import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useUsuario } from "../contexts/UsuarioContext";
import { useTema } from "../contexts/TemaContext";
import TelaLogin from "../screens/TelaLogin";
import TelaPainel from "../screens/TelaPainel";
import TelaEstoque from "../screens/TelaEstoque";
import TelaMovimentacao from "../screens/TelaMovimentacao";
import TelaItem from "../screens/TelaItem";
import TelaScanner from "../screens/TelaScanner";
import TelaUsuarios from "../screens/TelaUsuarios";

const Pilha = createNativeStackNavigator();
const Abas = createBottomTabNavigator();

const ICONES = {
  Painel: "grid-outline",
  Estoque: "cube-outline",
  Movimentacao: "swap-vertical-outline",
};

function BotaoTema() {
  const { temaEscuro, alternarTema } = useTema();

  return (
    <Pressable
      onPress={alternarTema}
      accessibilityRole="switch"
      accessibilityLabel={
        temaEscuro ? "Modo escuro ativado" : "Modo claro ativado"
      }
      accessibilityState={{ checked: temaEscuro }}
      hitSlop={8}
      android_ripple={{
        color: temaEscuro ? "rgba(248, 250, 252, 0.12)" : "rgba(15, 118, 110, 0.12)",
        borderless: false,
      }}
      style={({ pressed }) => [
        estilos.botaoTema,
        temaEscuro && estilos.botaoTemaEscuro,
        pressed && estilos.botaoTemaPressionado,
      ]}
    >
      <Ionicons
        name={temaEscuro ? "moon" : "sunny"}
        size={20}
        color={temaEscuro ? "#FDE68A" : "#0F766E"}
      />
    </Pressable>
  );
}

function BotoesCabecalho({ children }) {
  return (
    <View style={estilos.botoesCabecalho}>
      {children}
      <BotaoTema />
    </View>
  );
}

const estilos = StyleSheet.create({
  botoesCabecalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  botaoTema: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F4F1",
    borderWidth: 1,
    borderColor: "#C8E7E1",
    overflow: "hidden",
    marginRight: 8,
  },
  botaoTemaEscuro: {
    backgroundColor: "#263442",
    borderColor: "#475569",
  },
  botaoTemaPressionado: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },
});

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
  const { temaEscuro } = useTema();
  const ehDono = usuario?.perfil === "dono";
  const opcoesCabecalho = {
    headerStyle: { backgroundColor: temaEscuro ? "#101418" : "#F6F7F9" },
    headerShadowVisible: false,
    headerTintColor: "#0F766E",
    headerTitleStyle: {
      color: temaEscuro ? "#F8FAFC" : "#1B2430",
      fontWeight: "bold",
    },
  };

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
        ...opcoesCabecalho,
        headerRight: () => <BotaoTema />,
        sceneStyle: { backgroundColor: temaEscuro ? "#101418" : "#F6F7F9" },
        tabBarStyle: {
          backgroundColor: temaEscuro ? "#1E2933" : "#FFFFFF",
          borderTopColor: temaEscuro ? "#334155" : "#D9DEE5",
        },
        tabBarActiveTintColor: "#0F766E",
        tabBarInactiveTintColor: temaEscuro ? "#94A3B8" : "#64748B",
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
            <BotoesCabecalho>
              <BotaoCabecalho texto="Sair" aoPressionar={encerrarSessao} />
            </BotoesCabecalho>
          ),
        }}
      />
      <Abas.Screen
        name="Estoque"
        component={TelaEstoque}
        options={({ navigation }) => ({
          headerRight: () => (
            <BotoesCabecalho>
              {ehDono ? (
                <BotaoCabecalho
                  texto="Novo item"
                  aoPressionar={() => navigation.navigate("Item")}
                />
              ) : null}
            </BotoesCabecalho>
          ),
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
  const { temaEscuro } = useTema();
  const ehDono = usuario?.perfil === "dono";
  const opcoesCabecalho = {
    headerStyle: { backgroundColor: temaEscuro ? "#101418" : "#F6F7F9" },
    headerShadowVisible: false,
    headerTintColor: "#0F766E",
    headerTitleStyle: {
      color: temaEscuro ? "#F8FAFC" : "#1B2430",
      fontWeight: "bold",
    },
    headerRight: () => <BotaoTema />,
    contentStyle: { backgroundColor: temaEscuro ? "#101418" : "#F6F7F9" },
  };

  if (carregando) {
    return <ActivityIndicator style={{ flex: 1 }} color="#0F766E" />;
  }

  return (
    <NavigationContainer theme={temaEscuro ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={temaEscuro ? "light-content" : "dark-content"}
        backgroundColor={temaEscuro ? "#101418" : "#F6F7F9"}
      />
      <Pilha.Navigator screenOptions={opcoesCabecalho}>
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
