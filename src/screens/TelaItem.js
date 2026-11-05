import { useState } from "react";
import { ScrollView, Text, Pressable, StyleSheet } from "react-native";
import Campo from "../components/Campo";
import { formatarTelefone, formatarData } from "../utils/formatadores";
import { useUsuario } from "../contexts/UsuarioContext";
import { useTema } from "../contexts/TemaContext";

export default function TelaItem({ route }) {
  const { usuario } = useUsuario();
  const { temaEscuro } = useTema();
  const somenteLeitura = usuario?.perfil !== "dono";

  const item = route.params?.item;

  const [form, setForm] = useState({
    nome: item?.nome ?? "",
    codigo: item?.codigo ?? "",
    unidade: item?.unidade ?? "",
    quantidade: item ? String(item.quantidade).replace(".", ",") : "",
    minimo: item ? String(item.minimo).replace(".", ",") : "",
    validade: item?.validade ?? "",
    fornecedor: item?.fornecedor ?? "",
    telefone: item?.telefone ?? "",
  });

  function alterar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.container,
        temaEscuro && estilos.containerEscuro,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Campo
        rotulo="Nome"
        value={form.nome}
        onChangeText={(v) => alterar("nome", v)}
        editable={!somenteLeitura}
      />
      <Campo
        rotulo="Código de barras"
        value={form.codigo}
        onChangeText={(v) => alterar("codigo", v)}
        keyboardType="numeric"
        editable={!somenteLeitura}
      />
      <Campo
        rotulo="Unidade"
        value={form.unidade}
        onChangeText={(v) => alterar("unidade", v)}
        editable={!somenteLeitura}
      />
      <Campo
        rotulo="Quantidade atual"
        value={form.quantidade}
        onChangeText={(v) => alterar("quantidade", v)}
        keyboardType="decimal-pad"
        editable={!somenteLeitura}
      />
      <Campo
        rotulo="Estoque mínimo"
        value={form.minimo}
        onChangeText={(v) => alterar("minimo", v)}
        keyboardType="decimal-pad"
        editable={!somenteLeitura}
      />
      <Campo
        rotulo="Validade (opcional)"
        value={form.validade}
        onChangeText={(v) => alterar("validade", formatarData(v))}
        placeholder="dd/mm/aaaa"
        keyboardType="numeric"
        maxLength={10}
        editable={!somenteLeitura}
      />
      <Campo
        rotulo="Fornecedor"
        value={form.fornecedor}
        onChangeText={(v) => alterar("fornecedor", v)}
        editable={!somenteLeitura}
      />
      <Campo
        rotulo="WhatsApp do fornecedor"
        value={form.telefone}
        onChangeText={(v) => alterar("telefone", formatarTelefone(v))}
        keyboardType="phone-pad"
        maxLength={15}
        editable={!somenteLeitura}
      />

      {!somenteLeitura && (
        <Pressable style={estilos.botaoPrincipal}>
          <Text style={estilos.textoPrincipal}>Salvar</Text>
        </Pressable>
      )}
      {/* "Inativar" só faz sentido para um item que já existe */}
      {!somenteLeitura && item && (
        <Pressable
          style={[
            estilos.botaoSecundario,
            temaEscuro && estilos.botaoSecundarioEscuro,
          ]}
        >
          <Text style={estilos.textoSecundario}>Inativar item</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: "#F6F7F9",
  },
  containerEscuro: {
    backgroundColor: "#101418",
  },
  botaoPrincipal: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  textoPrincipal: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  botaoSecundario: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0F766E",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  botaoSecundarioEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#0F766E",
  },
  textoSecundario: {
    color: "#0F766E",
    fontSize: 16,
    fontWeight: "600",
  },
});
