import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { useTema } from "../contexts/TemaContext";

// DADOS DE XEMPLO, só para ver a lista funcionando. Depois serão trocados pelos itens que vêm do banco de dados.
const FORNECEDOR = {
  fornecedor: "Distribuidora Silva",
  telefone: "(21) 90000-0000",
};
const ITENS = [
  {
    codigo: "7891000100103",
    nome: "Farinha de trigo",
    quantidade: 3,
    unidade: "kg",
    minimo: 10,
    ...FORNECEDOR,
  },
  {
    codigo: "7891000200201",
    nome: "Fermento biológico",
    quantidade: 2,
    unidade: "un",
    minimo: 6,
    ...FORNECEDOR,
  },
  {
    codigo: "7891000300309",
    nome: "Açúcar refinado",
    quantidade: 4,
    unidade: "kg",
    minimo: 8,
    ...FORNECEDOR,
  },
  {
    codigo: "7891000400407",
    nome: "Manteiga",
    quantidade: 12,
    unidade: "kg",
    minimo: 5,
    ...FORNECEDOR,
  },
  {
    codigo: "7891000500505",
    nome: "Leite integral",
    quantidade: 20,
    unidade: "L",
    minimo: 10,
    ...FORNECEDOR,
  },
];

export default function TelaEstoque({ navigation }) {
  const [busca, setBusca] = useState("");
  const { temaEscuro } = useTema();

  const itensFiltrados = ITENS.filter(
    (item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase()) ||
      item.codigo.includes(busca),
  );

  return (
    <View style={[estilos.container, temaEscuro && estilos.containerEscuro]}>
      <TextInput
        style={[estilos.busca, temaEscuro && estilos.campoEscuro]}
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar item ou código"
        placeholderTextColor={temaEscuro ? "#94A3B8" : "#6B7280"}
      />

      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.codigo}
        ListEmptyComponent={
          <Text style={[estilos.vazio, temaEscuro && estilos.textoSecundarioEscuro]}>
            Nenhum item encontrado
          </Text>
        }
        renderItem={({ item }) => {
          const abaixoDoMinimo = item.quantidade <= item.minimo;

          return (
            <Pressable
              style={[estilos.cartao, temaEscuro && estilos.cartaoEscuro]}
              onPress={() => navigation.navigate("Item", { item })}
            >
              <View>
                <Text style={[estilos.nome, temaEscuro && estilos.textoClaro]}>
                  {item.nome}
                </Text>
                <Text style={[estilos.detalhe, temaEscuro && estilos.textoSecundarioEscuro]}>
                  {item.quantidade} {item.unidade}
                </Text>
              </View>

              {abaixoDoMinimo && (
                <View style={estilos.selo}>
                  <Text style={estilos.textoSelo}>Baixo</Text>
                </View>
              )}
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
  vazio: {
    textAlign: "center",
    color: "#4A5563",
    marginTop: 24,
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
  cartaoEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#334155",
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
});
