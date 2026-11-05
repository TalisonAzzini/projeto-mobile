import { useCallback, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTema } from "../contexts/TemaContext";
import { useUsuario } from "../contexts/UsuarioContext";
import {
  listarProdutos,
  reativarProdutos,
} from "../services/produtos";

export default function TelaEstoque({ navigation }) {
  const [busca, setBusca] = useState("");
  const [itens, setItens] = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [reativandoSelecionados, setReativandoSelecionados] = useState(false);
  const [erro, setErro] = useState("");
  const { temaEscuro } = useTema();
  const { usuario } = useUsuario();
  const ehDono = usuario?.perfil === "dono";

  const carregarItens = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      setItens(await listarProdutos({ ativos: !mostrarInativos }));
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [mostrarInativos]);

  useFocusEffect(
    useCallback(() => {
      carregarItens();
    }, [carregarItens]),
  );

  const itensFiltrados = itens.filter(
    (item) =>
      item.nome.toLowerCase().includes(busca.trim().toLowerCase()) ||
      item.codigo.includes(busca.trim()),
  );

  function alternarSelecaoProduto(id) {
    setProdutosSelecionados((selecionados) =>
      selecionados.includes(id)
        ? selecionados.filter((selecionado) => selecionado !== id)
        : [...selecionados, id],
    );
  }

  function alternarListaInativos() {
    setMostrarInativos((visiveis) => !visiveis);
    setModoSelecao(false);
    setProdutosSelecionados([]);
  }

  function confirmarReativacaoEmLote() {
    const quantidade = produtosSelecionados.length;
    Alert.alert(
      "Reativar produtos",
      `Deseja reativar ${quantidade} produto${quantidade === 1 ? "" : "s"} selecionado${quantidade === 1 ? "" : "s"}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reativar",
          onPress: async () => {
            setErro("");
            setReativandoSelecionados(true);
            try {
              await reativarProdutos(produtosSelecionados);
              setProdutosSelecionados([]);
              setModoSelecao(false);
              await carregarItens();
            } catch (error) {
              setErro(error.message);
            } finally {
              setReativandoSelecionados(false);
            }
          },
        },
      ],
    );
  }

  return (
    <View style={[estilos.container, temaEscuro && estilos.containerEscuro]}>
      <TextInput
        style={[estilos.busca, temaEscuro && estilos.campoEscuro]}
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar item ou código"
        placeholderTextColor={temaEscuro ? "#94A3B8" : "#6B7280"}
      />

      <View style={estilos.acoesLista}>
        <Pressable
          style={[
            estilos.alternarInativos,
            temaEscuro && estilos.alternarInativosEscuro,
            !mostrarInativos && estilos.botaoInativos,
            !mostrarInativos && temaEscuro && estilos.botaoInativosEscuro,
          ]}
          onPress={alternarListaInativos}
          accessibilityRole="button"
        >
          <Text
            style={[
              estilos.textoAcao,
              !mostrarInativos && estilos.textoInativos,
              !mostrarInativos && temaEscuro && estilos.textoInativosEscuro,
            ]}
          >
            {mostrarInativos ? "Ver produtos ativos" : "Ver produtos inativos"}
          </Text>
        </Pressable>

        {mostrarInativos && ehDono && (
          <View style={estilos.acoesSelecao}>
            {!modoSelecao ? (
              <Pressable
                style={estilos.botaoSelecao}
                onPress={() => setModoSelecao(true)}
                accessibilityRole="button"
              >
                <Text style={estilos.textoAcao}>Selecionar</Text>
              </Pressable>
            ) : null}
            {modoSelecao && produtosSelecionados.length > 0 && (
              <Pressable
                style={[
                  estilos.botaoReativarLote,
                  reativandoSelecionados && estilos.botaoDesativado,
                ]}
                onPress={confirmarReativacaoEmLote}
                disabled={reativandoSelecionados}
              >
                {reativandoSelecionados ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={estilos.textoReativarLote}>
                    Reativar ({produtosSelecionados.length})
                  </Text>
                )}
              </Pressable>
            )}
            {modoSelecao && (
              <Pressable
                style={estilos.botaoSelecao}
                onPress={() => {
                  setModoSelecao(false);
                  setProdutosSelecionados([]);
                }}
                accessibilityRole="button"
              >
                <Text style={estilos.textoAcao}>Cancelar</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {modoSelecao && mostrarInativos ? (
        <View style={estilos.linhaSelecao}>
          <Text
            style={[
              estilos.contagemSelecao,
              temaEscuro && estilos.textoSecundarioEscuro,
            ]}
            >
              {produtosSelecionados.length} selecionado(s)
            </Text>
        </View>
      ) : null}

      {erro ? (
        <View style={estilos.avisoErro}>
          <Text style={[estilos.erro, temaEscuro && estilos.erroEscuro]}>
            {erro}
          </Text>
          <Pressable onPress={carregarItens} disabled={carregando}>
            <Text style={estilos.textoAcao}>
              {carregando ? "Carregando..." : "Tentar novamente"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator
              style={estilos.carregando}
              color="#0F766E"
              accessibilityLabel="Carregando itens do estoque"
            />
          ) : erro ? null : (
            <Text
              style={[
                estilos.vazio,
                temaEscuro && estilos.textoSecundarioEscuro,
              ]}
            >
              {busca.trim()
                ? "Nenhum item encontrado."
                : mostrarInativos
                  ? "Nenhum produto inativo."
                  : "Nenhum item cadastrado."}
            </Text>
          )
        }
        refreshing={carregando}
        onRefresh={carregarItens}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const abaixoDoMinimo =
            item.ativo !== false && item.quantidade <= item.minimo;

          return (
            <Pressable
              style={[
                estilos.cartao,
                temaEscuro && estilos.cartaoEscuro,
                modoSelecao &&
                  produtosSelecionados.includes(item.id) &&
                  estilos.cartaoSelecionado,
              ]}
              onPress={() =>
                modoSelecao
                  ? alternarSelecaoProduto(item.id)
                  : navigation.navigate("Item", { item })
              }
              accessibilityRole={modoSelecao ? "checkbox" : "button"}
              accessibilityState={
                modoSelecao
                  ? { checked: produtosSelecionados.includes(item.id) }
                  : undefined
              }
            >
              <View style={estilos.detalhesProduto}>
                {modoSelecao && (
                  <View
                    style={[
                      estilos.caixaSelecao,
                      temaEscuro && estilos.caixaSelecaoEscura,
                      produtosSelecionados.includes(item.id) &&
                        estilos.caixaSelecaoAtiva,
                    ]}
                  >
                    {produtosSelecionados.includes(item.id) ? (
                      <Text style={estilos.marcaSelecao}>✓</Text>
                    ) : null}
                  </View>
                )}
                <View style={estilos.informacoesProduto}>
                  <Text
                    style={[estilos.nome, temaEscuro && estilos.textoClaro]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.nome}
                  </Text>
                  <Text style={[estilos.detalhe, temaEscuro && estilos.textoSecundarioEscuro]}>
                    {item.quantidade} {item.unidade}
                  </Text>
                </View>

                <View style={estilos.selos}>
                  {abaixoDoMinimo && (
                    <View style={estilos.selo}>
                      <Text style={estilos.textoSelo}>Baixo</Text>
                    </View>
                  )}
                  {item.ativo === false && (
                    <View style={estilos.seloInativo}>
                      <Text style={estilos.textoSeloInativo}>Inativo</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
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
  busca: {
    height: 48,
    borderWidth: 1,
    borderColor: "#8A94A3",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  campoEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#475569",
    color: "#F8FAFC",
  },
  alternarInativos: {
    alignSelf: "flex-start",
    flexShrink: 1,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0F766E",
  },
  alternarInativosEscuro: {
    backgroundColor: "#1E2933",
  },
  botaoInativos: {
    borderColor: "#B42318",
    backgroundColor: "#FEF2F2",
  },
  botaoInativosEscuro: {
    borderColor: "#F87171",
    backgroundColor: "#3A2024",
  },
  textoInativos: {
    color: "#B42318",
  },
  textoInativosEscuro: {
    color: "#FCA5A5",
  },
  acoesLista: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  acoesSelecao: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  botaoSelecao: {
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#0F766E",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoReativarLote: {
    minHeight: 40,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#0F766E",
    alignItems: "center",
    justifyContent: "center",
  },
  textoReativarLote: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  botaoDesativado: {
    opacity: 0.6,
  },
  contagemSelecao: {
    marginBottom: 12,
    fontSize: 13,
    color: "#4A5563",
  },
  linhaSelecao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -8,
  },
  vazio: {
    textAlign: "center",
    color: "#4A5563",
    marginTop: 24,
  },
  carregando: {
    marginVertical: 24,
  },
  avisoErro: {
    marginBottom: 16,
  },
  erro: {
    color: "#B42318",
    fontSize: 14,
    marginBottom: 8,
  },
  erroEscuro: {
    color: "#FDA4AF",
  },
  textoAcao: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "600",
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
  },
  detalhesProduto: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  informacoesProduto: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    marginRight: 8,
  },
  caixaSelecao: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#64748B",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  caixaSelecaoEscura: {
    borderColor: "#94A3B8",
  },
  caixaSelecaoAtiva: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  marcaSelecao: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  cartaoSelecionado: {
    borderColor: "#0F766E",
  },
  selos: {
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  cartaoEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#334155",
  },
  nome: {
    fontSize: 16,
    flexShrink: 1,
  },
  textoClaro: {
    color: "#F8FAFC",
  },
  detalhe: {
    fontSize: 13,
    color: "#4A5563",
  },
  selo: {
    backgroundColor: "#FDF1E3",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 99,
  },
  textoSelo: {
    color: "#92400E",
    fontSize: 13,
    fontWeight: "600",
  },
  seloInativo: {
    backgroundColor: "#EEF0F3",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 99,
  },
  textoSeloInativo: {
    color: "#4A5563",
    fontSize: 13,
    fontWeight: "600",
  },
});
