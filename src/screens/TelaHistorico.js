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

export default function TelaHistorico() {
  const { temaEscuro } = useTema();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

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

  return (
    <View style={[estilos.container, temaEscuro && estilos.containerEscuro]}>
      <FlatList
        data={eventos}
        keyExtractor={(item) => String(item.id)}
        refreshing={carregando}
        onRefresh={carregarHistorico}
        contentContainerStyle={eventos.length === 0 && estilos.listaVazia}
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
            <Text
              style={[
                estilos.vazio,
                temaEscuro && estilos.textoSecundarioEscuro,
              ]}
            >
              Nenhuma movimentação registrada.
            </Text>
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
                <Text
                  style={[
                    estilos.tipo,
                    entrada ? estilos.tipoEntrada : estilos.tipoSaida,
                  ]}
                >
                  {formatarTipo(item.tipo_movimentacao)}
                </Text>
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
              <Text
                style={[
                  estilos.detalhe,
                  temaEscuro && estilos.textoSecundarioEscuro,
                ]}
              >
                Quantidade: {formatarQuantidade(quantidade)}
                {produto?.unidade ? ` ${produto.unidade}` : ""}
              </Text>
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
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F6F7F9",
  },
  containerEscuro: {
    backgroundColor: "#101418",
  },
  listaVazia: {
    flexGrow: 1,
    justifyContent: "center",
  },
  carregando: {
    marginVertical: 24,
  },
  estado: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  vazio: {
    textAlign: "center",
    color: "#4A5563",
    padding: 24,
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
  cartao: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9DEE5",
    backgroundColor: "#FFFFFF",
  },
  cartaoEscuro: {
    borderColor: "#334155",
    backgroundColor: "#1E2933",
  },
  cabecalhoCartao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  tipo: {
    fontSize: 13,
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
    marginBottom: 4,
  },
  textoClaro: {
    color: "#F8FAFC",
  },
  textoSecundarioEscuro: {
    color: "#CBD5E1",
  },
  detalhe: {
    color: "#4A5563",
    fontSize: 14,
  },
  usuario: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 6,
  },
  observacao: {
    color: "#4A5563",
    fontSize: 13,
    marginTop: 6,
  },
});
