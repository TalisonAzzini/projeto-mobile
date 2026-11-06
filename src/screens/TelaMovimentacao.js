import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Campo from "../components/Campo";
import { useTema } from "../contexts/TemaContext";
import {
  buscarProdutoPorCodigo,
  listarProdutosParaMovimentacao,
  registrarMovimentacao,
} from "../services/movimentacoes";
import { formatarQuantidade, paraNumero } from "../utils/formatadores";

export default function TelaMovimentacao({ navigation, route }) {
  const { temaEscuro } = useTema();
  const codigoLido = route.params?.codigo;
  const [produtos, setProdutos] = useState([]);
  const [produto, setProduto] = useState(null);
  const [tipo, setTipo] = useState("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [buscaProduto, setBuscaProduto] = useState("");
  const [seletorVisivel, setSeletorVisivel] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroDeCarregamento, setErroDeCarregamento] = useState(false);
  const [codigoEscaneado, setCodigoEscaneado] = useState("");
  const produtoAtualRef = useRef(produto);
  produtoAtualRef.current = produto;

  const carregarProdutos = useCallback(async () => {
    setCarregandoProdutos(true);
    setErroDeCarregamento(false);

    try {
      const lista = await listarProdutosParaMovimentacao();
      setProdutos(lista);

      if (codigoLido) {
        setErro("");
        setCodigoEscaneado(codigoLido);
        setProduto(null);
        try {
          const produtoLido = await buscarProdutoPorCodigo(codigoLido);
          setProduto(produtoLido);
          setQuantidade("");
        } catch (error) {
          setErro(error.message);
        } finally {
          navigation.setParams({ codigo: undefined });
        }
      } else if (produtoAtualRef.current) {
        setProduto(
          lista.find((item) => item.id === produtoAtualRef.current.id) ?? null,
        );
      }
    } catch (error) {
      setErro(error.message || "Não foi possível carregar os produtos.");
      setErroDeCarregamento(true);
    } finally {
      setCarregandoProdutos(false);
    }
  }, [codigoLido, navigation]);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos]),
  );

  const valor = paraNumero(quantidade);
  const estoqueAtual = Number(produto?.quantidade ?? 0);
  const saidaMaiorQueEstoque = tipo === "saida" && valor > estoqueAtual;
  const novoSaldo =
    tipo === "entrada" ? estoqueAtual + valor : estoqueAtual - valor;
  const saldoTexto = saidaMaiorQueEstoque
    ? "—"
    : String(Math.round(novoSaldo * 1000) / 1000).replace(".", ",");
  const podeConfirmar =
    Boolean(produto) &&
    valor > 0 &&
    !saidaMaiorQueEstoque &&
    !registrando &&
    !carregandoProdutos;

  const produtosFiltrados = produtos.filter((item) => {
    const consulta = buscaProduto.trim().toLowerCase();
    return (
      item.nome.toLowerCase().includes(consulta) ||
      item.codigo.toLowerCase().includes(consulta)
    );
  });

  function selecionarProduto(item) {
    setProduto(item);
    setQuantidade("");
    setErro("");
    setSeletorVisivel(false);
    setBuscaProduto("");
  }

  async function confirmarMovimentacao() {
    if (!podeConfirmar) return;

    setErro("");
    setRegistrando(true);
    try {
      const novoEstoque = await registrarMovimentacao({
        produtoId: produto.id,
        tipo,
        quantidade: valor,
      });

      const produtoAtualizado = { ...produto, quantidade: novoEstoque };
      setProduto(produtoAtualizado);
      setProdutos((lista) =>
        lista.map((item) =>
          item.id === produtoAtualizado.id ? produtoAtualizado : item,
        ),
      );
      setQuantidade("");
      setErro("");
      Alert.alert(
        "Movimentação registrada",
        `${tipo === "entrada" ? "Entrada" : "Saída"} registrada com sucesso. Novo saldo: ${novoEstoque} ${produto.unidade}.`,
      );
    } catch (error) {
      setErro(error.message || "Não foi possível registrar a movimentação.");
      setErroDeCarregamento(false);
    } finally {
      setRegistrando(false);
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          estilos.container,
          temaEscuro && estilos.containerEscuro,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[estilos.rotulo, temaEscuro && estilos.rotuloEscuro]}>
          Item
        </Text>
        <Pressable
          style={[
            estilos.seletorProduto,
            temaEscuro && estilos.campoEscuro,
            !produto && estilos.seletorVazio,
          ]}
          onPress={() => setSeletorVisivel(true)}
          disabled={carregandoProdutos || registrando}
          accessibilityRole="button"
        >
          <Text
            style={[
              estilos.textoSeletor,
              temaEscuro && estilos.textoClaro,
              !produto && estilos.textoPlaceholder,
            ]}
          >
            {carregandoProdutos
              ? "Carregando produtos..."
              : produto
                ? `${produto.nome} (${produto.unidade})`
                : "Selecionar produto"}
          </Text>
          <Text style={estilos.textoAcao}>Escolher</Text>
        </Pressable>

        <Pressable
          style={[
            estilos.botaoSecundario,
            temaEscuro && estilos.botaoSecundarioEscuro,
          ]}
          onPress={() => navigation.navigate("Scanner")}
          disabled={registrando}
        >
          <Text style={estilos.textoSecundario}>Ler código de barras</Text>
        </Pressable>

        {codigoEscaneado ? (
          <Text
            style={[
              estilos.codigoLido,
              temaEscuro && estilos.textoSecundarioEscuro,
            ]}
          >
            Código lido: {codigoEscaneado}
          </Text>
        ) : null}

        <View style={estilos.opcoes}>
          <Pressable
            style={[
              estilos.opcao,
              temaEscuro && estilos.opcaoEscura,
              tipo === "entrada" && estilos.opcaoAtiva,
            ]}
            onPress={() => {
              setTipo("entrada");
              setErro("");
            }}
            disabled={registrando}
          >
            <Text
              style={[
                estilos.textoOpcao,
                temaEscuro && estilos.textoOpcaoEscuro,
                tipo === "entrada" && estilos.textoOpcaoAtiva,
              ]}
            >
              Entrada
            </Text>
          </Pressable>
          <Pressable
            style={[
              estilos.opcao,
              temaEscuro && estilos.opcaoEscura,
              tipo === "saida" && estilos.opcaoAtiva,
            ]}
            onPress={() => {
              setTipo("saida");
              setErro("");
            }}
            disabled={registrando}
          >
            <Text
              style={[
                estilos.textoOpcao,
                temaEscuro && estilos.textoOpcaoEscuro,
                tipo === "saida" && estilos.textoOpcaoAtiva,
              ]}
            >
              Saída
            </Text>
          </Pressable>
        </View>

        <Campo
          rotulo="Quantidade"
          value={quantidade}
          onChangeText={(valorDigitado) => {
            setQuantidade(formatarQuantidade(valorDigitado));
            setErro("");
          }}
          keyboardType="decimal-pad"
          editable={!registrando}
        />

        <View style={[estilos.resumo, temaEscuro && estilos.resumoEscuro]}>
          <Text style={[estilos.resumoTexto, temaEscuro && estilos.textoClaro]}>
            Em estoque: {produto ? estoqueAtual : "—"}
            {produto ? ` ${produto.unidade}` : ""}
          </Text>
          <Text
            style={[
              estilos.resumoDetalhe,
              temaEscuro && estilos.textoSecundarioEscuro,
            ]}
          >
            Novo saldo: {produto ? saldoTexto : "—"}
            {produto && !saidaMaiorQueEstoque ? ` ${produto.unidade}` : ""}
          </Text>
        </View>

        {saidaMaiorQueEstoque && (
          <Text style={[estilos.erro, temaEscuro && estilos.erroEscuro]}>
            A saída é maior que o estoque disponível.
          </Text>
        )}

        {erro ? (
          <View style={estilos.avisoErro}>
            <Text style={[estilos.erro, temaEscuro && estilos.erroEscuro]}>
              {erro}
            </Text>
            {erroDeCarregamento && (
              <Pressable
                onPress={() => {
                  setErro("");
                  carregarProdutos();
                }}
                disabled={carregandoProdutos || registrando}
                accessibilityRole="button"
              >
                <Text style={estilos.textoAcao}>
                  {carregandoProdutos ? "Carregando..." : "Tentar novamente"}
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}

        <Pressable
          style={[
            estilos.botaoPrincipal,
            !podeConfirmar && estilos.botaoDesativado,
          ]}
          disabled={!podeConfirmar}
          onPress={confirmarMovimentacao}
        >
          {registrando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={estilos.textoPrincipal}>
              Confirmar {tipo === "entrada" ? "entrada" : "saída"}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <Modal
        visible={seletorVisivel}
        animationType="slide"
        transparent
        onRequestClose={() => setSeletorVisivel(false)}
      >
        <View style={estilos.fundoModal}>
          <View
            style={[
              estilos.conteudoModal,
              temaEscuro && estilos.modalEscuro,
            ]}
          >
            <Text style={[estilos.tituloModal, temaEscuro && estilos.textoClaro]}>
              Selecionar produto
            </Text>
            <TextInput
              style={[
                estilos.buscaProduto,
                temaEscuro && estilos.campoEscuro,
              ]}
              value={buscaProduto}
              onChangeText={setBuscaProduto}
              placeholder="Buscar por nome ou código"
              placeholderTextColor={temaEscuro ? "#94A3B8" : "#6B7280"}
              autoCapitalize="none"
            />
            {carregandoProdutos ? (
              <ActivityIndicator
                style={estilos.carregando}
                color="#0F766E"
                accessibilityLabel="Carregando produtos"
              />
            ) : (
              <FlatList
                data={produtosFiltrados}
                keyExtractor={(item) => String(item.id)}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <Text
                    style={[
                      estilos.listaVazia,
                      temaEscuro && estilos.textoSecundarioEscuro,
                    ]}
                  >
                    {produtos.length
                      ? "Nenhum produto encontrado."
                      : "Nenhum produto ativo cadastrado."}
                  </Text>
                }
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      estilos.itemLista,
                      temaEscuro && estilos.itemListaEscuro,
                    ]}
                    onPress={() => selecionarProduto(item)}
                  >
                    <View style={estilos.dadosItem}>
                      <Text
                        style={[
                          estilos.nomeProduto,
                          temaEscuro && estilos.textoClaro,
                        ]}
                      >
                        {item.nome}
                      </Text>
                      <Text
                        style={[
                          estilos.detalheProduto,
                          temaEscuro && estilos.textoSecundarioEscuro,
                        ]}
                      >
                        {item.quantidade} {item.unidade}
                        {item.codigo ? ` · ${item.codigo}` : ""}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            )}
            <Pressable
              style={estilos.botaoFecharModal}
              onPress={() => setSeletorVisivel(false)}
            >
              <Text style={estilos.textoAcao}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: "#F6F7F9",
  },
  containerEscuro: {
    backgroundColor: "#101418",
  },
  rotulo: {
    fontSize: 13,
    color: "#4A5563",
    marginBottom: 4,
  },
  rotuloEscuro: {
    color: "#CBD5E1",
  },
  seletorProduto: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#8A94A3",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  seletorVazio: {
    borderColor: "#0F766E",
  },
  textoSeletor: {
    flex: 1,
    color: "#1B2430",
    fontSize: 16,
  },
  textoPlaceholder: {
    color: "#6B7280",
  },
  textoClaro: {
    color: "#F8FAFC",
  },
  campoEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#475569",
    color: "#F8FAFC",
  },
  botaoSecundario: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0F766E",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  botaoSecundarioEscuro: {
    backgroundColor: "#1E2933",
  },
  textoSecundario: {
    color: "#0F766E",
    fontSize: 16,
    fontWeight: "600",
  },
  textoSecundarioEscuro: {
    color: "#CBD5E1",
  },
  textoAcao: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "600",
  },
  codigoLido: {
    fontSize: 13,
    color: "#4A5563",
    marginBottom: 16,
  },
  opcoes: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  opcao: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0F766E",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  opcaoEscura: {
    backgroundColor: "#1E2933",
  },
  opcaoAtiva: {
    backgroundColor: "#0F766E",
  },
  textoOpcao: {
    color: "#0F766E",
    fontSize: 16,
    fontWeight: "600",
  },
  textoOpcaoEscuro: {
    color: "#5EEAD4",
  },
  textoOpcaoAtiva: {
    color: "#FFFFFF",
  },
  resumo: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DEE5",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  resumoEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#334155",
  },
  resumoTexto: {
    fontSize: 16,
    color: "#1B2430",
  },
  resumoDetalhe: {
    fontSize: 13,
    color: "#4A5563",
    marginTop: 2,
  },
  erro: {
    color: "#B42318",
    fontSize: 14,
    marginBottom: 8,
  },
  erroEscuro: {
    color: "#FDA4AF",
  },
  avisoErro: {
    marginBottom: 16,
  },
  botaoPrincipal: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
  },
  botaoDesativado: {
    opacity: 0.4,
  },
  textoPrincipal: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  fundoModal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    padding: 20,
  },
  conteudoModal: {
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  modalEscuro: {
    backgroundColor: "#101418",
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B2430",
    marginBottom: 12,
  },
  buscaProduto: {
    height: 44,
    borderWidth: 1,
    borderColor: "#8A94A3",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#1B2430",
    marginBottom: 8,
  },
  carregando: {
    marginVertical: 24,
  },
  listaVazia: {
    color: "#4A5563",
    textAlign: "center",
    paddingVertical: 24,
  },
  itemLista: {
    minHeight: 58,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D9DEE5",
    justifyContent: "center",
  },
  itemListaEscuro: {
    borderBottomColor: "#334155",
  },
  dadosItem: {
    flex: 1,
  },
  nomeProduto: {
    fontSize: 16,
    color: "#1B2430",
  },
  detalheProduto: {
    fontSize: 13,
    color: "#4A5563",
    marginTop: 2,
  },
  botaoFecharModal: {
    alignItems: "center",
    paddingTop: 16,
  },
});
