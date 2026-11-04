import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useUsuario } from "../contexts/UsuarioContext";

export default function TelaLogin() {
  const { entrar, erro, limparErro } = useUsuario();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const podeEntrar = email.trim().length > 0 && senha.length > 0 && !enviando;

  async function realizarLogin() {
    if (!podeEntrar) return;
    setEnviando(true);
    try {
      await entrar(email, senha);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Estoque da Padaria</Text>
      <Text style={estilos.subtitulo}>Entre com a sua conta</Text>

      <Text style={estilos.rotulo}>E-mail</Text>
      <TextInput
        style={estilos.campo}
        value={email}
        onChangeText={(valor) => {
          setEmail(valor);
          limparErro();
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        returnKeyType="next"
      />

      <Text style={estilos.rotulo}>Senha</Text>
      <TextInput
        style={estilos.campo}
        value={senha}
        onChangeText={(valor) => {
          setSenha(valor);
          limparErro();
        }}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        returnKeyType="done"
        onSubmitEditing={realizarLogin}
      />

      {!!erro && <Text style={estilos.erro}>{erro}</Text>}

      <Pressable
        style={[estilos.botao, !podeEntrar && estilos.botaoDesativado]}
        onPress={realizarLogin}
        disabled={!podeEntrar}
      >
        {enviando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={estilos.textoBotao}>Entrar</Text>
        )}
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#F6F7F9",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitulo: {
    fontSize: 15,
    color: "#4A5563",
    marginBottom: 24,
  },
  rotulo: {
    fontSize: 13,
    color: "#4A5563",
    marginBottom: 4,
  },
  campo: {
    height: 48,
    borderWidth: 1,
    borderColor: "#8A94A3",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  botao: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  erro: {
    color: "#B42318",
    fontSize: 14,
    marginBottom: 16,
  },
  botaoDesativado: {
    backgroundColor: "#A0A8B3",
  },
});
