import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTema } from "../contexts/TemaContext";
import { useUsuario } from "../contexts/UsuarioContext";
import { listarProdutos } from "../services/produtos";
import { pedirReposicaoNoWhatsApp } from "../services/whatsapp";

function formatarNumero(valor) {
  return Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
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
                {formatarNumero(item.quantidade)} {item.unidade} · mín.{" "}
                {formatarNumero(item.minimo)} {item.unidade}
              </Text>
            </View>

            {ehDono && (
              <Pressable
                style={estilos.botao}
                onPress={() => pedirReposicaoNoWhatsApp(item)}
                accessibilityRole="button"
              >
                <Text style={estilos.textoBotao}>Pedir no WhatsApp</Text>
              </Pressable>
            )}
          </View>
        )}
        ListFooterComponent={
          ehDono ? (
            <Pressable
              style={[estilos.botaoUsuarios, temaEscuro && estilos.cartaoEscuro]}
              onPress={() => navigation.navigate("Usuarios")}
              accessibilityRole="button"
            >
              <Text style={estilos.textoUsuarios}>Usuários</Text>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}

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
  secao: {
    fontSize: 15,
    color: "#4A5563",
    marginBottom: 12,
  },
  textoSecundarioEscuro: {
    color: "#CBD5E1",
  },
  cartao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DEE5",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  cartaoEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#334155",
  },
  dadosProduto: {
    flex: 1,
    flexShrink: 1,
  },
  nome: {
    fontSize: 16,
  },
  textoClaro: {
    color: "#F8FAFC",
  },
  detalhe: {
    fontSize: 13,
    color: "#4A5563",
  },
  botao: {
    minHeight: 40,
    flexShrink: 0,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#25D366",
    justifyContent: "center",
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  botaoUsuarios: {
    height: 48,
    borderWidth: 1,
    borderColor: "#0F766E",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  textoUsuarios: {
    color: "#0F766E",
    fontSize: 16,
    fontWeight: "600",
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