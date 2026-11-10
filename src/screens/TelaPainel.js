import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useUsuario } from "../contexts/UsuarioContext";
import { useTema } from "../contexts/TemaContext";
import { listarProdutos } from "../services/produtos";

function formatarQuantidade(quantidade) {
  return String(quantidade).replace(".", ",");
}

export default function TelaPainel({ navigation }) {
  const { usuario } = useUsuario();
  const { temaEscuro } = useTema();
  const ehDono = usuario?.perfil === "dono";
  const [produtosBaixos, setProdutosBaixos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarProdutos = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const produtos = await listarProdutos({ ativos: true });
      setProdutosBaixos(
        produtos.filter((item) => item.quantidade <= item.minimo),
      );
    } catch (error) {
      setErro(error.message || "Não foi possível carregar o painel.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos]),
  );

  async function abrirWhatsApp() {
    try {
      await Linking.openURL("whatsapp://");
    } catch {
      try {
        await Linking.openURL("https://wa.me/");
      } catch {
        Alert.alert(
          "Não foi possível abrir o WhatsApp",
          "Confira se o WhatsApp está instalado no telefone e tente novamente.",
        );
      }
    }
  }

  return (
    <View style={[estilos.container, temaEscuro && estilos.containerEscuro]}>
      <Text style={[estilos.secao, temaEscuro && estilos.textoSecundarioEscuro]}>
        Abaixo do mínimo
      </Text>

      <FlatList
        data={produtosBaixos}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregarProdutos}
        contentContainerStyle={estilos.lista}
        ListHeaderComponent={
          erro ? (
            <View style={estilos.estadoLista}>
              <Text style={[estilos.erro, temaEscuro && estilos.erroEscuro]}>
                {erro}
              </Text>
              <Pressable onPress={carregarProdutos} accessibilityRole="button">
                <Text style={estilos.textoAcao}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : null
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator
              style={estilos.carregando}
              color="#0F766E"
              accessibilityLabel="Carregando produtos abaixo do mínimo"
            />
          ) : erro ? null : (
            <Text
              style={[
                estilos.estadoLista,
                temaEscuro && estilos.textoSecundarioEscuro,
              ]}
            >
              Nenhum produto está abaixo do estoque mínimo.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <View style={[estilos.cartao, temaEscuro && estilos.cartaoEscuro]}>
            <View style={[estilos.icone, temaEscuro && estilos.iconeEscuro]}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={temaEscuro ? "#FCA5A5" : "#B42318"}
              />
            </View>

            <View style={estilos.dadosProduto}>
              <Text style={[estilos.nome, temaEscuro && estilos.textoClaro]}>
                {item.nome}
              </Text>
              <Text
                style={[
                  estilos.detalhe,
                  temaEscuro && estilos.textoSecundarioEscuro,
                ]}
              >
                {formatarQuantidade(item.quantidade)} {item.unidade} · mín.{" "}
                {formatarQuantidade(item.minimo)} {item.unidade}
              </Text>
            </View>

            {ehDono && (
              <Pressable
                style={({ pressed }) => [
                  estilos.botao,
                  pressed && estilos.botaoPressionado,
                ]}
                onPress={abrirWhatsApp}
                accessibilityRole="button"
                accessibilityLabel={`Pedir ${item.nome} no WhatsApp do fornecedor`}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                <Text style={estilos.textoBotao}>WhatsApp</Text>
              </Pressable>
            )}
          </View>
        )}
        ListFooterComponent={
          ehDono ? (
            <Pressable
              style={({ pressed }) => [
                estilos.botaoUsuarios,
                temaEscuro && estilos.cartaoEscuro,
                pressed && estilos.botaoPressionado,
              ]}
              onPress={() => navigation.navigate("Usuarios")}
              accessibilityRole="button"
            >
              <Ionicons
                name="people-outline"
                size={20}
                color={temaEscuro ? "#5EEAD4" : "#0F766E"}
              />
              <Text
                style={[
                  estilos.textoUsuarios,
                  temaEscuro && estilos.textoUsuariosEscuro,
                ]}
              >
                Usuários
              </Text>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}

const sombraSuave = {
  shadowColor: "#000000",
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F6F7F9",
  },
  containerEscuro: {
    backgroundColor: "#101418",
  },
  lista: {
    paddingBottom: 24,
  },
  secao: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5563",
    marginBottom: 12,
  },
  textoSecundarioEscuro: {
    color: "#CBD5E1",
  },
  cartao: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E7ED",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    ...sombraSuave,
  },
  cartaoEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#334155",
    shadowOpacity: 0,
    elevation: 0,
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEE4E2",
    alignItems: "center",
    justifyContent: "center",
  },
  iconeEscuro: {
    backgroundColor: "#3B1F24",
  },
  dadosProduto: {
    flex: 1,
    flexShrink: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B2430",
  },
  textoClaro: {
    color: "#F8FAFC",
  },
  detalhe: {
    fontSize: 13,
    color: "#4A5563",
    marginTop: 2,
  },
  botao: {
    minHeight: 40,
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#1DA851",
    justifyContent: "center",
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  botaoUsuarios: {
    height: 52,
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E3E7ED",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    ...sombraSuave,
  },
  textoUsuarios: {
    color: "#0F766E",
    fontSize: 16,
    fontWeight: "600",
  },
  textoUsuariosEscuro: {
    color: "#5EEAD4",
  },
  carregando: {
    marginVertical: 24,
  },
  estadoLista: {
    color: "#4A5563",
    textAlign: "center",
    paddingVertical: 24,
  },
  erro: {
    color: "#B42318",
    marginBottom: 12,
  },
  erroEscuro: {
    color: "#FDA4AF",
  },
  textoAcao: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
