import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useUsuario } from "../contexts/UsuarioContext";
import TelaComTeclado from "../components/TelaComTeclado";
import { useTema } from "../contexts/TemaContext";
import {
  autenticarUsuario,
  reenviarConfirmacaoEmail,
  traduzirErroAutenticacao,
} from "../services/autenticacao";

export default function TelaLogin() {
  const { temaEscuro, alternarTema } = useTema();
  const { entrar } = useUsuario();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [emailNaoConfirmado, setEmailNaoConfirmado] = useState(false);
  const [reenvioCarregando, setReenvioCarregando] = useState(false);
  const [mensagemReenvio, setMensagemReenvio] = useState("");
  const podeEntrar = email.trim().length > 0 && senha.length > 0;

  async function realizarLogin() {
    setErro("");
    setEmailNaoConfirmado(false);
    setMensagemReenvio("");
    setCarregando(true);

    try {
      const usuarioAutenticado = await autenticarUsuario(email, senha);
      entrar(usuarioAutenticado);
    } catch (error) {
      const naoConfirmado =
        error.code === "email_not_confirmed" ||
        error.message?.toLowerCase().includes("email not confirmed");
      setEmailNaoConfirmado(naoConfirmado);
      setErro(traduzirErroAutenticacao(error));
    } finally {
      setCarregando(false);
    }
  }

  async function reenviarEmail() {
    setMensagemReenvio("");
    setReenvioCarregando(true);

    try {
      await reenviarConfirmacaoEmail(email);
      setMensagemReenvio("E-mail de confirmação enviado. Verifique sua caixa de entrada.");
    } catch (error) {
      setMensagemReenvio(traduzirErroAutenticacao(error));
    } finally {
      setReenvioCarregando(false);
    }
  }

  return (
    <TelaComTeclado>
    <View
      style={[
        estilos.container,
        temaEscuro && estilos.containerEscuro,
      ]}
    >
      <StatusBar style={temaEscuro ? "light" : "dark"} />
      <Pressable
        style={[
          estilos.botaoTema,
          temaEscuro && estilos.botaoTemaEscuro,
        ]}
        onPress={alternarTema}
        accessibilityRole="button"
        accessibilityLabel={
          temaEscuro ? "Mudar para tema claro" : "Mudar para tema escuro"
        }
        hitSlop={8}
      >
        <Ionicons
          name={temaEscuro ? "moon" : "sunny"}
          size={22}
          color={temaEscuro ? "#FDE68A" : "#0F766E"}
        />
      </Pressable>
      <Image
        source={require("../../assets/logo.png")}
        style={estilos.logo}
        resizeMode="contain"
        accessibilityLabel="Logo da padaria"
      />
      <Text style={[estilos.subtitulo, temaEscuro && estilos.textoSecundarioEscuro]}>
        Entre com a sua conta
      </Text>

      <Text style={[estilos.rotulo, temaEscuro && estilos.textoSecundarioEscuro]}>
        E-mail
      </Text>
      <TextInput
        style={[estilos.campo, temaEscuro && estilos.campoEscuro]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={temaEscuro ? "#94A3B8" : "#6B7280"}
        selectionColor="#0F766E"
      />

      <Text style={[estilos.rotulo, temaEscuro && estilos.textoSecundarioEscuro]}>
        Senha
      </Text>
      <TextInput
        style={[estilos.campo, temaEscuro && estilos.campoEscuro]}
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={temaEscuro ? "#94A3B8" : "#6B7280"}
        selectionColor="#0F766E"
      />

      {erro ? (
        <Text style={[estilos.erro, temaEscuro && estilos.erroEscuro]}>
          {erro}
        </Text>
      ) : null}
      {emailNaoConfirmado && (
        <Pressable
          onPress={reenviarEmail}
          disabled={reenvioCarregando || !email.trim()}
          style={estilos.botaoReenvio}
        >
          {reenvioCarregando ? (
            <ActivityIndicator color="#0F766E" />
          ) : (
            <Text
              style={[
                estilos.textoReenvio,
                temaEscuro && estilos.textoReenvioEscuro,
              ]}
            >
              Reenviar e-mail de confirmação
            </Text>
          )}
        </Pressable>
      )}
      {mensagemReenvio ? (
        <Text
          style={[
            estilos.mensagemReenvio,
            temaEscuro && estilos.textoSecundarioEscuro,
          ]}
        >
          {mensagemReenvio}
        </Text>
      ) : null}

      <Pressable
        style={[
          estilos.botao,
          (!podeEntrar || carregando) && estilos.botaoDesativado,
          temaEscuro && !podeEntrar && estilos.botaoDesativadoEscuro,
        ]}
        onPress={realizarLogin}
        disabled={!podeEntrar || carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={estilos.textoBotao}>Entrar</Text>
        )}
      </Pressable>
    </View>
    </TelaComTeclado>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#F6F7F9",
  },
  containerEscuro: {
    backgroundColor: "#101418",
  },
  botaoTema: {
    position: "absolute",
    top: 64,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoTemaEscuro: {
    backgroundColor: "#263442",
  },
  logo: {
    width: 280,
    height: 163,
    alignSelf: "center",
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 15,
    color: "#4A5563",
    marginBottom: 24,
    textAlign: "center",
  },
  textoSecundarioEscuro: {
    color: "#CBD5E1",
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
  campoEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#475569",
    color: "#F8FAFC",
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
  erroEscuro: {
    color: "#FCA5A5",
  },
  botaoReenvio: {
    alignItems: "center",
    paddingVertical: 12,
  },
  textoReenvio: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "600",
  },
  textoReenvioEscuro: {
    color: "#5EEAD4",
  },
  mensagemReenvio: {
    color: "#4A5563",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  botaoDesativado: {
    backgroundColor: "#A0A8B2",
  },
  botaoDesativadoEscuro: {
    backgroundColor: "#475569",
  },
});