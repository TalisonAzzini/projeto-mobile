import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import Campo from "../components/Campo";

// EXEMPLO (substituir depois por dados do banco de dados)
const FUNCIONARIOS = [
  { id: "1", nome: "Maria Souza", email: "maria@exemplo.com" },
  { id: "2", nome: "João Lima", email: "joao@exemplo.com" },
];

export default function TelaUsuarios() {
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });

  function alterar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  const emailValido = /\S+@\S+\.\S+/.test(form.email);
  const senhaCurta = form.senha.length > 0 && form.senha.length < 6;
  const podeCadastrar =
    form.nome.trim() !== "" && emailValido && form.senha.length >= 6;

  const cabecalho = (
    <View>
      <Text style={estilos.titulo}>Usuários</Text>
      <Text style={estilos.secao}>Funcionários cadastrados</Text>
    </View>
  );

  const formulario = (
    <View style={estilos.formulario}>
      <Text style={estilos.secao}>Novo funcionário</Text>

      <Campo
        rotulo="Nome"
        value={form.nome}
        onChangeText={(v) => alterar("nome", v)}
        maxLength={60}
      />
      <Campo
        rotulo="E-mail"
        value={form.email}
        onChangeText={(v) => alterar("email", v)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Campo
        rotulo="Senha"
        value={form.senha}
        onChangeText={(v) => alterar("senha", v)}
        placeholder="Mínimo de 6 caracteres"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      {senhaCurta && (
        <Text style={estilos.aviso}>
          A senha precisa ter pelo menos 6 caracteres.
        </Text>
      )}

      <Pressable
        style={[estilos.botao, !podeCadastrar && estilos.botaoDesativado]}
        disabled={!podeCadastrar}
      >
        <Text style={estilos.textoBotao}>Cadastrar</Text>
      </Pressable>
    </View>
  );

  return (
    <FlatList
      style={estilos.lista}
      contentContainerStyle={estilos.conteudo}
      data={FUNCIONARIOS}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={cabecalho}
      ListFooterComponent={formulario}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <View style={estilos.cartao}>
          <View>
            <Text style={estilos.nome}>{item.nome}</Text>
            <Text style={estilos.detalhe}>{item.email}</Text>
          </View>
          <Text style={estilos.perfil}>Funcionário</Text>
        </View>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  lista: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },
  conteudo: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  secao: {
    fontSize: 15,
    color: "#4A5563",
    marginBottom: 12,
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
  nome: {
    fontSize: 16,
  },
  detalhe: {
    fontSize: 13,
    color: "#4A5563",
  },
  perfil: {
    fontSize: 13,
    color: "#4A5563",
  },
  formulario: {
    marginTop: 16,
  },
  aviso: {
    color: "#B42318",
    fontSize: 14,
    marginBottom: 16,
  },
  botao: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
  },
  botaoDesativado: {
    opacity: 0.4,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
