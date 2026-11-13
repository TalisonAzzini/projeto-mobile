import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTema } from "../contexts/TemaContext";
import { listarHistoricoMovimentacoes } from "../services/movimentacoes";

function formatarData(valor) {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarQuantidade(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    maximumFractionDigits: 3,
  });
}

function formatarTipo(tipo) {
  const normalizado = String(tipo ?? "").toUpperCase();
  if (normalizado === "ENTRADA") return "Entrada";
  if (normalizado === "SAIDA") return "Saída";
  if (normalizado === "AJUSTE") return "Ajuste";
  return tipo || "Tipo não informado";
}

function ehMesmoDia(primeiraData, segundaData) {
  return Boolean(
    primeiraData &&
    segundaData &&
    primeiraData.getFullYear() === segundaData.getFullYear() &&
    primeiraData.getMonth() === segundaData.getMonth() &&
    primeiraData.getDate() === segundaData.getDate()
  );
}

export default function TelaHistorico() {
  const { temaEscuro } = useTema();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [dataInicioFiltro, setDataInicioFiltro] = useState(null);
  const [dataFimFiltro, setDataFimFiltro] = useState(null);
  const [calendarioVisivel, setCalendarioVisivel] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(() => new Date());

  const carregarHistorico = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      setEventos(await listarHistoricoMovimentacoes());
    } catch (error) {
      setErro(error.message || "Não foi possível carregar o histórico.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [carregarHistorico]),
  );

  const eventosFiltrados = eventos.filter((item) => {
    const tipo = String(item.tipo_movimentacao ?? "").toUpperCase();
    const correspondeAoTipo =
      filtroTipo === "todos" ||
      (filtroTipo === "entradas" && tipo === "ENTRADA") ||
      (filtroTipo === "saidas" && tipo === "SAIDA") ||
      (filtroTipo === "ajustes" && tipo === "AJUSTE");

    if (!correspondeAoTipo) return false;
    if (!dataInicioFiltro) return true;

    const dataEvento = new Date(item.data_movimentacao);
    if (Number.isNaN(dataEvento.getTime())) return false;

    const inicio = new Date(
      dataInicioFiltro.getFullYear(),
      dataInicioFiltro.getMonth(),
      dataInicioFiltro.getDate(),
    );
    const ultimoDia = dataFimFiltro || dataInicioFiltro;
    const fimExclusivo = new Date(
      ultimoDia.getFullYear(),
      ultimoDia.getMonth(),
      ultimoDia.getDate() + 1,
    );

    return dataEvento >= inicio && dataEvento < fimExclusivo;
  });
  const primeiroDiaMes = new Date(
    mesCalendario.getFullYear(),
    mesCalendario.getMonth(),
    1,
  );
  const quantidadeDiasMes = new Date(
    mesCalendario.getFullYear(),
    mesCalendario.getMonth() + 1,
    0,
  ).getDate();
  const espacosAntesDoMes = (primeiroDiaMes.getDay() + 6) % 7;
  const diasCalendario = [
    ...Array(espacosAntesDoMes).fill(null),
    ...Array.from({ length: quantidadeDiasMes }, (_, indice) => indice + 1),
  ];
  const hoje = new Date();
  const nomeMes = mesCalendario.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const formatarDataCurta = (data) =>
    data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const dataFiltroTexto = dataInicioFiltro
    ? dataFimFiltro
      ? `${formatarDataCurta(dataInicioFiltro)} – ${formatarDataCurta(dataFimFiltro)}`
      : `Início: ${formatarDataCurta(dataInicioFiltro)}`
    : "Filtrar por período";

  const filtros = [
    { chave: "todos", label: "Todos" },
    { chave: "entradas", label: "Entradas" },
    { chave: "saidas", label: "Saídas" },
    { chave: "ajustes", label: "Ajustes" },
  ];

  return (
    <View style={[estilos.container, temaEscuro && estilos.containerEscuro]}>
      <View style={[estilos.cardResumo, temaEscuro && estilos.cardResumoEscuro]}>
        <Text style={[estilos.eyebrow, temaEscuro && estilos.textoSecundarioEscuro]}>
          movimentações
        </Text>
        <View style={estilos.cabecalhoResumo}>
          <Text style={[estilos.titulo, temaEscuro && estilos.textoClaro]}>
            Histórico
          </Text>
          <View style={[estilos.badge, temaEscuro && estilos.badgeEscuro]}>
            <Text style={[estilos.badgeTexto, temaEscuro && estilos.badgeTextoEscuro]}>
              {eventosFiltrados.length}
            </Text>
          </View>
        </View>

        <View style={estilos.linhaCalendario}>
          <Pressable
            onPress={() => {
              setMesCalendario(dataInicioFiltro || new Date());
              setCalendarioVisivel(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={
              dataInicioFiltro
                ? `Filtrar pelo período ${dataFiltroTexto}`
                : "Selecionar período no calendário"
            }
            style={[
              estilos.botaoCalendario,
              temaEscuro && estilos.botaoCalendarioEscuro,
              dataInicioFiltro && estilos.botaoCalendarioAtivo,
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={
                dataInicioFiltro
                  ? "#FFFFFF"
                  : temaEscuro
                    ? "#E2E8F0"
                    : "#334155"
              }
            />
            <Text
              style={[
                estilos.textoBotaoCalendario,
                temaEscuro && estilos.textoBotaoCalendarioEscuro,
                dataInicioFiltro && estilos.textoBotaoCalendarioAtivo,
              ]}
            >
              {dataFiltroTexto}
            </Text>
          </Pressable>
          {dataInicioFiltro ? (
            <Pressable
              onPress={() => {
                setDataInicioFiltro(null);
                setDataFimFiltro(null);
              }}
              accessibilityRole="button"
              accessibilityLabel="Limpar período"
              style={estilos.botaoLimparData}
            >
              <Text style={estilos.textoLimparData}>Limpar período</Text>
            </Pressable>
          ) : null}
        </View>

        <Text
          style={[
            estilos.rotuloFiltros,
            estilos.rotuloTipo,
            temaEscuro && estilos.textoSecundarioEscuro,
          ]}
        >
          Tipo
        </Text>
        <View style={estilos.filtros}>
          {filtros.map((filtro) => {
            const ativo = filtroTipo === filtro.chave;

            return (
              <Pressable
                key={filtro.chave}
                onPress={() => setFiltroTipo(filtro.chave)}
                accessibilityRole="button"
                style={[
                  estilos.filtro,
                  temaEscuro && estilos.filtroEscuro,
                  ativo && estilos.filtroAtivo,
                  ativo && temaEscuro && estilos.filtroAtivoEscuro,
                ]}
              >
                <Text
                  style={[
                    estilos.filtroTexto,
                    ativo && estilos.filtroTextoAtivo,
                    temaEscuro && !ativo && estilos.filtroTextoEscuro,
                  ]}
                >
                  {filtro.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={eventosFiltrados}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregarHistorico}
        contentContainerStyle={
          eventosFiltrados.length === 0 ? estilos.listaVazia : estilos.lista
        }
        ListHeaderComponent={
          erro ? (
            <View style={estilos.estado}>
              <Text style={[estilos.erro, temaEscuro && estilos.erroEscuro]}>
                {erro}
              </Text>
              <Pressable onPress={carregarHistorico} accessibilityRole="button">
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
              accessibilityLabel="Carregando histórico"
            />
          ) : erro ? null : (
            <View style={estilos.estadoVazio}>
              <View style={[estilos.iconeVazio, temaEscuro && estilos.iconeVazioEscuro]}>
                <Text style={estilos.iconeVazioTexto}>—</Text>
              </View>
              <Text
                style={[
                  estilos.vazio,
                  temaEscuro && estilos.textoSecundarioEscuro,
                ]}
              >
                Nenhuma movimentação encontrada para este filtro.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const entrada =
            String(item.tipo_movimentacao).toUpperCase() === "ENTRADA";
          const produto = item.produto;
          const nomeProduto =
            produto?.nome || `Produto ${String(item.produto_id).slice(0, 8)}`;
          const quantidade = Number(item.quantidade);

          return (
            <View
              style={[
                estilos.cartao,
                temaEscuro && estilos.cartaoEscuro,
              ]}
            >
              <View style={estilos.cabecalhoCartao}>
                <View style={estilos.tipoContainer}>
                  <View
                    style={[
                      estilos.pontoTipo,
                      entrada ? estilos.pontoEntrada : estilos.pontoSaida,
                    ]}
                  />
                  <Text
                    style={[
                      estilos.tipo,
                      entrada ? estilos.tipoEntrada : estilos.tipoSaida,
                    ]}
                  >
                    {formatarTipo(item.tipo_movimentacao)}
                  </Text>
                </View>
                <Text
                  style={[
                    estilos.data,
                    temaEscuro && estilos.textoSecundarioEscuro,
                  ]}
                >
                  {formatarData(item.data_movimentacao)}
                </Text>
              </View>

              <Text style={[estilos.nomeProduto, temaEscuro && estilos.textoClaro]}>
                {nomeProduto}
              </Text>

              <View style={estilos.detalhesLinha}>
                <Text
                  style={[
                    estilos.detalhe,
                    temaEscuro && estilos.textoSecundarioEscuro,
                  ]}
                >
                  Quantidade: {formatarQuantidade(quantidade)}
                  {produto?.unidade ? ` ${produto.unidade}` : ""}
                </Text>
              </View>

              <Text
                style={[
                  estilos.usuario,
                  temaEscuro && estilos.textoSecundarioEscuro,
                ]}
              >
                Registrado por: {item.nomeUsuario}
              </Text>

              {item.observacao ? (
                <Text
                  style={[
                    estilos.observacao,
                    temaEscuro && estilos.textoSecundarioEscuro,
                  ]}
                >
                  {item.observacao}
                </Text>
              ) : null}
            </View>
          );
        }}
      />
      <Modal
        visible={calendarioVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarioVisivel(false)}
      >
        <View style={estilos.fundoModal}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setCalendarioVisivel(false)}
            accessibilityRole="button"
            accessibilityLabel="Fechar calendário"
          />
          <View
            style={[
              estilos.cartaoCalendario,
              temaEscuro && estilos.cartaoCalendarioEscuro,
            ]}
          >
            <View style={estilos.cabecalhoCalendario}>
              <Text
                style={[
                  estilos.tituloCalendario,
                  temaEscuro && estilos.textoClaro,
                ]}
              >
                Selecionar período
              </Text>
              <Pressable
                onPress={() => setCalendarioVisivel(false)}
                accessibilityRole="button"
                accessibilityLabel="Fechar calendário"
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={temaEscuro ? "#CBD5E1" : "#475569"}
                />
              </Pressable>
            </View>

            <Text
              style={[
                estilos.instrucaoCalendario,
                temaEscuro && estilos.textoSecundarioEscuro,
              ]}
            >
              {dataInicioFiltro && !dataFimFiltro
                ? "Agora escolha o último dia"
                : "Escolha o primeiro dia do período"}
            </Text>

            <View style={estilos.navegacaoMes}>
              <Pressable
                onPress={() =>
                  setMesCalendario(
                    (atual) =>
                      new Date(atual.getFullYear(), atual.getMonth() - 1, 1),
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Mês anterior"
                hitSlop={8}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={temaEscuro ? "#CBD5E1" : "#334155"}
                />
              </Pressable>
              <Text
                style={[
                  estilos.nomeMes,
                  temaEscuro && estilos.textoClaro,
                ]}
              >
                {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}
              </Text>
              <Pressable
                onPress={() =>
                  setMesCalendario(
                    (atual) =>
                      new Date(atual.getFullYear(), atual.getMonth() + 1, 1),
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Próximo mês"
                hitSlop={8}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={temaEscuro ? "#CBD5E1" : "#334155"}
                />
              </Pressable>
            </View>

            <View style={estilos.gradeCalendario}>
              {["S", "T", "Q", "Q", "S", "S", "D"].map((dia, indice) => (
                <View
                  key={`semana-${indice}`}
                  style={estilos.celulaCalendario}
                >
                  <Text
                    style={[
                      estilos.rotuloDiaSemana,
                      temaEscuro && estilos.textoSecundarioEscuro,
                    ]}
                  >
                    {dia}
                  </Text>
                </View>
              ))}
              {diasCalendario.map((dia, indice) => {
                if (!dia) {
                  return (
                    <View
                      key={`vazio-${indice}`}
                      style={estilos.celulaCalendario}
                    />
                  );
                }

                const data = new Date(
                  mesCalendario.getFullYear(),
                  mesCalendario.getMonth(),
                  dia,
                );
                const selecionadaInicio = ehMesmoDia(data, dataInicioFiltro);
                const selecionadaFim = ehMesmoDia(data, dataFimFiltro);
                const estaNoIntervalo =
                  dataInicioFiltro &&
                  dataFimFiltro &&
                  data > dataInicioFiltro &&
                  data < dataFimFiltro;
                const ehHoje = ehMesmoDia(data, hoje);

                return (
                  <View key={`dia-${dia}`} style={estilos.celulaCalendario}>
                    <Pressable
                      onPress={() => {
                        if (!dataInicioFiltro || dataFimFiltro) {
                          setDataInicioFiltro(data);
                          setDataFimFiltro(null);
                          return;
                        }

                        if (data < dataInicioFiltro) {
                          setDataFimFiltro(dataInicioFiltro);
                          setDataInicioFiltro(data);
                        } else {
                          setDataFimFiltro(data);
                        }
                        setCalendarioVisivel(false);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={data.toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      accessibilityState={{
                        selected: Boolean(selecionadaInicio || selecionadaFim),
                      }}
                      style={[
                        estilos.botaoDia,
                        ehHoje && estilos.botaoHoje,
                        estaNoIntervalo &&
                          (temaEscuro
                            ? estilos.botaoDiaNoIntervaloEscuro
                            : estilos.botaoDiaNoIntervalo),
                        (selecionadaInicio || selecionadaFim) &&
                          estilos.botaoDiaSelecionado,
                      ]}
                    >
                      <Text
                        style={[
                          estilos.textoDia,
                          temaEscuro && estilos.textoClaro,
                          ehHoje && estilos.textoHoje,
                          estaNoIntervalo &&
                            (temaEscuro
                              ? estilos.textoDiaNoIntervaloEscuro
                              : estilos.textoDiaNoIntervalo),
                          (selecionadaInicio || selecionadaFim) &&
                            estilos.textoDiaSelecionado,
                        ]}
                      >
                        {dia}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const sombraSuave = {
  shadowColor: "#000000",
  shadowOpacity: 0.1,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F6F7F9",
  },
  containerEscuro: {
    backgroundColor: "#101418",
  },
  lista: {
    paddingBottom: 18,
  },
  listaVazia: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 18,
  },
  carregando: {
    marginVertical: 24,
  },
  estado: {
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  estadoVazio: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  vazio: {
    textAlign: "center",
    color: "#4A5563",
    padding: 24,
    maxWidth: 260,
    lineHeight: 20,
  },
  erro: {
    color: "#B42318",
    textAlign: "center",
    marginBottom: 12,
  },
  erroEscuro: {
    color: "#FDA4AF",
  },
  textoAcao: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "600",
  },
  cardResumo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E3E8F0",
    padding: 16,
    marginBottom: 14,
    ...sombraSuave,
  },
  cardResumoEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#334155",
    shadowOpacity: 0,
    elevation: 0,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#64748B",
    marginBottom: 6,
  },
  cabecalhoResumo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  badge: {
    minWidth: 40,
    height: 40,
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  badgeEscuro: {
    backgroundColor: "#102C35",
  },
  badgeTexto: {
    color: "#0F766E",
    fontSize: 16,
    fontWeight: "700",
  },
  badgeTextoEscuro: {
    color: "#99F6E4",
  },
  filtros: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rotuloFiltros: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  rotuloTipo: {
    marginTop: 12,
  },
  linhaCalendario: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  botaoCalendario: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE5EE",
    backgroundColor: "#F8FAFC",
  },
  botaoCalendarioEscuro: {
    borderColor: "#4B5563",
    backgroundColor: "#374151",
  },
  botaoCalendarioAtivo: {
    borderColor: "#0F766E",
    backgroundColor: "#0F766E",
  },
  textoBotaoCalendario: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
  },
  textoBotaoCalendarioEscuro: {
    color: "#E2E8F0",
  },
  textoBotaoCalendarioAtivo: {
    color: "#FFFFFF",
  },
  instrucaoCalendario: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 14,
  },
  botaoLimparData: {
    paddingVertical: 8,
  },
  textoLimparData: {
    color: "#0F766E",
    fontSize: 13,
    fontWeight: "600",
  },
  filtro: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DDE5EE",
    backgroundColor: "#F8FAFC",
  },
  filtroEscuro: {
    backgroundColor: "#475569",
    borderColor: "#64748B",
  },
  filtroAtivo: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  filtroAtivoEscuro: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  filtroTexto: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
  },
  filtroTextoEscuro: {
    color: "#F1F5F9",
  },
  filtroTextoAtivo: {
    color: "#FFFFFF",
  },
  fundoModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  cartaoCalendario: {
    width: "100%",
    maxWidth: 380,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    ...sombraSuave,
  },
  cartaoCalendarioEscuro: {
    borderColor: "#334155",
    backgroundColor: "#1E2933",
    shadowOpacity: 0,
    elevation: 0,
  },
  cabecalhoCalendario: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tituloCalendario: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
  },
  navegacaoMes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  nomeMes: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  gradeCalendario: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  celulaCalendario: {
    width: "14.2857%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rotuloDiaSemana: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },
  botaoDia: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoHoje: {
    borderWidth: 1,
    borderColor: "#0F766E",
  },
  botaoDiaSelecionado: {
    borderColor: "#0F766E",
    backgroundColor: "#0F766E",
  },
  botaoDiaNoIntervalo: {
    borderRadius: 10,
    backgroundColor: "#CCFBF1",
  },
  botaoDiaNoIntervaloEscuro: {
    borderRadius: 10,
    backgroundColor: "#134E4A",
  },
  textoDia: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "500",
  },
  textoDiaNoIntervalo: {
    color: "#115E59",
    fontWeight: "600",
  },
  textoDiaNoIntervaloEscuro: {
    color: "#99F6E4",
    fontWeight: "600",
  },
  textoHoje: {
    color: "#0F766E",
    fontWeight: "700",
  },
  textoDiaSelecionado: {
    color: "#FFFFFF",
  },
  cartao: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E7EE",
    backgroundColor: "#FFFFFF",
    ...sombraSuave,
  },
  cartaoEscuro: {
    borderColor: "#334155",
    backgroundColor: "#1E2933",
    shadowOpacity: 0,
    elevation: 0,
  },
  cabecalhoCartao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  tipoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pontoTipo: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  pontoEntrada: {
    backgroundColor: "#10B981",
  },
  pontoSaida: {
    backgroundColor: "#EF4444",
  },
  tipo: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  tipoEntrada: {
    color: "#0F766E",
  },
  tipoSaida: {
    color: "#B42318",
  },
  data: {
    flexShrink: 1,
    color: "#64748B",
    fontSize: 12,
    textAlign: "right",
  },
  nomeProduto: {
    color: "#1B2430",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  textoClaro: {
    color: "#F8FAFC",
  },
  textoSecundarioEscuro: {
    color: "#CBD5E1",
  },
  detalhesLinha: {
    marginBottom: 4,
  },
  detalhe: {
    color: "#4A5563",
    fontSize: 14,
    lineHeight: 20,
  },
  usuario: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  observacao: {
    color: "#4A5563",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  iconeVazio: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconeVazioEscuro: {
    backgroundColor: "#102C35",
  },
  iconeVazioTexto: {
    fontSize: 20,
    color: "#0F766E",
    fontWeight: "700",
  },
});
