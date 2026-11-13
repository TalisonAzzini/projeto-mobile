import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

  const resumoTexto =
    produtosBaixos.length === 0
      ? "Tudo em dia"
      : produtosBaixos.length === 1
        ? "1 item em alerta"
        : `${produtosBaixos.length} itens em alerta`;

  return (
    <View style={[estilos.container, temaEscuro && estilos.containerEscuro]}>
      <FlatList
        data={produtosBaixos}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregarProdutos}
        contentContainerStyle={estilos.lista}
        ListHeaderComponent={
          <>
            <View
              style={[estilos.cardResumo, temaEscuro && estilos.cardResumoEscuro]}
            >
              <View style={estilos.cabecalhoResumo}>
                <View>
                  <Text
                    style={[
                      estilos.eyebrow,
                      temaEscuro && estilos.textoSecundarioEscuro,
                    ]}
                  >
                    Painel de estoque
                  </Text>
                  <Text style={[estilos.titulo, temaEscuro && estilos.textoClaro]}>
                    Abaixo do mínimo
                  </Text>
                </View>

                <View
                  style={[
                    estilos.badgeResumo,
                    produtosBaixos.length === 0
                      ? estilos.badgeSucesso
                      : estilos.badgeAlerta,
                  ]}
                >
                  <Text style={estilos.badgeTexto}>{produtosBaixos.length}</Text>
                </View>
              </View>

              <View style={estilos.gridResumo}>
                <View
                  style={[estilos.blocoResumo, temaEscuro && estilos.blocoResumoEscuro]}
                >
                  <Text
                    style={[
                      estilos.rotuloResumo,
                      temaEscuro && estilos.textoSecundarioEscuro,
                    ]}
                  >
                    Status
                  </Text>
                  <Text style={[estilos.valorResumo, temaEscuro && estilos.textoClaro]}>
                    {resumoTexto}
                  </Text>
                </View>

                <View
                  style={[estilos.blocoResumo, temaEscuro && estilos.blocoResumoEscuro]}
                >
                  <Text
                    style={[
                      estilos.rotuloResumo,
                      temaEscuro && estilos.textoSecundarioEscuro,
                    ]}
                  >
                    Ação
                  </Text>
                  <Text style={[estilos.valorResumo, temaEscuro && estilos.textoClaro]}>
                    {produtosBaixos.length === 0 ? "Revisar depois" : "Reabastecer"}
                  </Text>
                </View>
              </View>
            </View>

            {erro ? (
              <View style={estilos.estadoLista}>
                <Text style={[estilos.erro, temaEscuro && estilos.erroEscuro]}>
                  {erro}
                </Text>
                <Pressable onPress={carregarProdutos} accessibilityRole="button">
                  <Text style={estilos.textoAcao}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator
              style={estilos.carregando}
              color="#0F766E"
              accessibilityLabel="Carregando produtos abaixo do mínimo"
            />
          ) : erro ? null : (
            <View style={estilos.estadoVazio}>
              <View style={[estilos.iconeVazio, temaEscuro && estilos.iconeVazioEscuro]}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={28}
                  color={temaEscuro ? "#5EEAD4" : "#0F766E"}
                />
              </View>
              <Text
                style={[
                  estilos.textoEstadoVazio,
                  temaEscuro && estilos.textoSecundarioEscuro,
                ]}
              >
                Nenhum produto está abaixo do estoque mínimo.
              </Text>
            </View>
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

              <View style={estilos.linhaDetalhes}>
                <View style={[estilos.badgeEstoque, temaEscuro && estilos.badgeEstoqueEscuro]}>
                  <Text
                    style={[
                      estilos.badgeEstoqueTexto,
                      temaEscuro && estilos.badgeEstoqueTextoEscuro,
                    ]}
                  >
                    {formatarNumero(item.quantidade)} {item.unidade}
                  </Text>
                </View>

                <Text style={[estilos.detalhe, temaEscuro && estilos.textoSecundarioEscuro]}>
                  mín. {formatarNumero(item.minimo)} {item.unidade}
                </Text>
              </View>
            </View>

            {ehDono && (
              <Pressable
                style={estilos.botao}
                onPress={() => pedirReposicaoNoWhatsApp(item)}
                accessibilityRole="button"
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
                temaEscuro && estilos.botaoUsuariosEscuro,
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
  cardResumo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7ECF3",
    padding: 18,
    marginBottom: 18,
    ...sombraSuave,
  },
  cardResumoEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#334155",
    shadowOpacity: 0,
    elevation: 0,
  },
  cabecalhoResumo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 4,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  badgeResumo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSucesso: {
    backgroundColor: "#DCFCE7",
  },
  badgeAlerta: {
    backgroundColor: "#FEE2E2",
  },
  badgeTexto: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
  },
  gridResumo: {
    flexDirection: "row",
    gap: 10,
  },
  blocoResumo: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    minHeight: 74,
    justifyContent: "center",
  },
  blocoResumoEscuro: {
    backgroundColor: "#0F172A",
  },
  rotuloResumo: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "600",
  },
  valorResumo: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },
  linhaDetalhes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  badgeEstoque: {
    backgroundColor: "#ECFDF5",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeEstoqueEscuro: {
    backgroundColor: "#123E39",
  },
  badgeEstoqueTexto: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "700",
  },
  badgeEstoqueTextoEscuro: {
    color: "#99F6E4",
  },
  estadoVazio: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },
  iconeVazio: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconeVazioEscuro: {
    backgroundColor: "#102C35",
  },
  textoEstadoVazio: {
    textAlign: "center",
    color: "#4A5563",
    maxWidth: 260,
    lineHeight: 18,
    fontSize: 14,
  },
  botaoUsuariosEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#334155",
    shadowOpacity: 0,
    elevation: 0,
  },
});