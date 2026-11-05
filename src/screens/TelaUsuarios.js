import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Campo from "../components/Campo";
import { useTema } from "../contexts/TemaContext";
import {
  cadastrarFuncionario,
  emailDominioGenerico,
  emailFuncionarioValido,
  listarFuncionarios,
} from "../services/usuarios";

const FORMULARIO_INICIAL = { nome: "", email: "", senha: "" };

export default function TelaUsuarios() {
  const { temaEscuro } = useTema();
  const [form, setForm] = useState(FORMULARIO_INICIAL);
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroLista, setErroLista] = useState("");
  const [erroCadastro, setErroCadastro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const carregarFuncionarios = useCallback(async () => {
    setCarregando(true);
    setErroLista("");

    try {
      setFuncionarios(await listarFuncionarios());
    } catch (error) {
      setErroLista(error.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarFuncionarios();
  }, [carregarFuncionarios]);

  function alterar(campo, valor) {
    setForm((formAtual) => ({ ...formAtual, [campo]: valor }));
    setErroCadastro("");
    setMensagemSucesso("");
  }

  async function cadastrar() {
    setErroCadastro("");
    setMensagemSucesso("");
    setSalvando(true);

    try {
      const resultado = await cadastrarFuncionario({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
      });

      setForm(FORMULARIO_INICIAL);
      setMensagemSucesso(
        resultado.emailConfirmacaoEnviado
          ? "Funcionário cadastrado. Um e-mail de confirmação foi enviado."
          : "Funcionário cadastrado, mas não foi possível enviar o e-mail de confirmação. Ele poderá solicitar o reenvio na tela de login.",
      );
      await carregarFuncionarios();
    } catch (error) {
      setErroCadastro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  const emailValido = emailFuncionarioValido(form.email);
  const emailGenerico =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    emailDominioGenerico(form.email);
  const senhaCurta = form.senha.length > 0 && form.senha.length < 6;
  const podeCadastrar =
    form.nome.trim() !== "" && emailValido && form.senha.length >= 6;

  const cabecalho = (
    <View>
      <Text style={[estilos.titulo, temaEscuro && estilos.textoClaro]}>
        Usuários
      </Text>
      <Text style={[estilos.secao, temaEscuro && estilos.textoSecundarioEscuro]}>
        Funcionários cadastrados
      </Text>

      {erroLista ? (
        <View style={estilos.avisoLista}>
          <Text style={[estilos.erro, temaEscuro && estilos.erroEscuro]}>
            {erroLista}
          </Text>
          <Pressable onPress={carregarFuncionarios} disabled={carregando}>
            <Text style={estilos.textoAcao}>
              {carregando ? "Carregando..." : "Tentar novamente"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  const formulario = (
    <View style={estilos.formulario}>
      <Text style={[estilos.secao, temaEscuro && estilos.textoSecundarioEscuro]}>
        Novo funcionário
      </Text>

      <Campo
        rotulo="Nome"
        value={form.nome}
        onChangeText={(valor) => alterar("nome", valor)}
        maxLength={60}
        editable={!salvando}
      />
      <Campo
        rotulo="E-mail"
        value={form.email}
        onChangeText={(valor) => alterar("email", valor)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!salvando}
      />
      {emailGenerico ? (
        <Text style={[estilos.aviso, temaEscuro && estilos.erroEscuro]}>
          E-mails de teste ou genéricos, como usuario@teste.com, não são aceitos.
        </Text>
      ) : null}
      <Campo
        rotulo="Senha"
        value={form.senha}
        onChangeText={(valor) => alterar("senha", valor)}
        placeholder="Mínimo de 6 caracteres"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!salvando}
      />

      {senhaCurta ? (
        <Text style={[estilos.aviso, temaEscuro && estilos.erroEscuro]}>
          A senha precisa ter pelo menos 6 caracteres.
        </Text>
      ) : null}
      {erroCadastro ? (
        <Text style={[estilos.erro, temaEscuro && estilos.erroEscuro]}>
          {erroCadastro}
        </Text>
      ) : null}
      {mensagemSucesso ? (
        <Text style={[estilos.sucesso, temaEscuro && estilos.sucessoEscuro]}>
          {mensagemSucesso}
        </Text>
      ) : null}

      <Pressable
        style={[
          estilos.botao,
          (!podeCadastrar || salvando) && estilos.botaoDesativado,
        ]}
        disabled={!podeCadastrar || salvando}
        onPress={cadastrar}
      >
        {salvando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={estilos.textoBotao}>Cadastrar</Text>
        )}
      </Pressable>
    </View>
  );

  return (
    <FlatList
      style={[estilos.lista, temaEscuro && estilos.listaEscura]}
      contentContainerStyle={[
        estilos.conteudo,
        temaEscuro && estilos.conteudoEscuro,
      ]}
      data={funcionarios}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={cabecalho}
      ListFooterComponent={formulario}
      ListEmptyComponent={
        carregando ? (
          <ActivityIndicator
            style={estilos.carregando}
            color="#0F766E"
            accessibilityLabel="Carregando funcionários"
          />
        ) : erroLista ? null : (
          <Text style={[estilos.listaVazia, temaEscuro && estilos.textoSecundarioEscuro]}>
            Nenhum funcionário cadastrado.
          </Text>
        )
      }
      refreshing={carregando}
      onRefresh={carregarFuncionarios}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <View style={[estilos.cartao, temaEscuro && estilos.cartaoEscuro]}>
          <View>
            <Text style={[estilos.nome, temaEscuro && estilos.textoClaro]}>
              {item.nome}
            </Text>
            <Text style={[estilos.detalhe, temaEscuro && estilos.textoSecundarioEscuro]}>
              {item.email}
            </Text>
          </View>
          <Text style={[estilos.perfil, temaEscuro && estilos.textoSecundarioEscuro]}>
            Funcionário
          </Text>
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
  listaEscura: {
    backgroundColor: "#101418",
  },
  conteudo: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  conteudoEscuro: {
    backgroundColor: "#101418",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  textoClaro: {
    color: "#F8FAFC",
  },
  secao: {
    fontSize: 15,
    color: "#4A5563",
    marginBottom: 12,
  },
  textoSecundarioEscuro: {
    color: "#CBD5E1",
  },
  avisoLista: {
    marginBottom: 16,
  },
  textoAcao: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "600",
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
  detalhe: {
    fontSize: 13,
    color: "#4A5563",
  },
  perfil: {
    fontSize: 13,
    color: "#4A5563",
  },
  carregando: {
    marginVertical: 16,
  },
  listaVazia: {
    color: "#4A5563",
    fontSize: 14,
    marginBottom: 12,
  },
  formulario: {
    marginTop: 16,
  },
  aviso: {
    color: "#B42318",
    fontSize: 14,
    marginBottom: 16,
  },
  erro: {
    color: "#B42318",
    fontSize: 14,
    marginBottom: 12,
  },
  erroEscuro: {
    color: "#FDA4AF",
  },
  sucesso: {
    color: "#067647",
    fontSize: 14,
    marginBottom: 12,
  },
  sucessoEscuro: {
    color: "#6EE7B7",
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
