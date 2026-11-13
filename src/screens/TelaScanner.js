import { useState } from "react";
import {
  Alert,
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Campo from "../components/Campo";
import { useTema } from "../contexts/TemaContext";
import { useUsuario } from "../contexts/UsuarioContext";
import {
  buscarProdutoPorCodigo,
  CODIGO_ERRO_PRODUTO_NAO_CADASTRADO,
} from "../services/movimentacoes";

export default function TelaScanner({ navigation }) {
  const { temaEscuro } = useTema();
  const { usuario } = useUsuario();
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [codigo, setCodigo] = useState("");
  const [digitando, setDigitando] = useState(false);
  const [texto, setTexto] = useState("");

  function enviarParaMovimentacao(valor) {
    navigation.navigate("Abas", {
      screen: "Movimentacao",
      params: { codigo: valor },
    });
  }

  async function usarCodigo(valor) {
    try {
      await buscarProdutoPorCodigo(valor);
      enviarParaMovimentacao(valor);
    } catch (error) {
      if (
        error.code === CODIGO_ERRO_PRODUTO_NAO_CADASTRADO &&
        usuario?.perfil === "dono"
      ) {
        Alert.alert(
          "Atenção",
          "Produto não cadastrado. Deseja realizar o cadastro?",
          [
            {
              text: "Sim",
              onPress: () => {
                setCodigo("");
                setTexto("");
                setDigitando(false);
                navigation.navigate("Item", { codigo: valor });
                Alert.alert(
                  "Cadastro de produto",
                  "Por favor, realize o cadastro",
                );
              },
            },
            {
              text: "Não",
              style: "cancel",
              onPress: () => {
                setCodigo("");
                setTexto("");
                setDigitando(false);
              },
            },
          ],
        );
        return;
      }

      enviarParaMovimentacao(valor);
    }
  }
  const codigoDigitado = texto.replace(/\s/g, "");

  if (!permissao) {
    return <View style={estilos.container} />;
  }

  if (!permissao.granted) {
    return (
      <View style={[estilos.container, estilos.centro]}>
        <Text style={estilos.mensagem}>
          O app precisa da câmera para ler os códigos de barras.
        </Text>
        {permissao.canAskAgain ? (
          <Pressable style={estilos.botao} onPress={pedirPermissao}>
            <Text style={estilos.textoBotao}>Permitir câmera</Text>
          </Pressable>
        ) : (
          <Pressable
            style={estilos.botao}
            onPress={() => Linking.openSettings()}
          >
            <Text style={estilos.textoBotao}>Abrir configurações</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={estilos.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "code128", "qr"],
        }}
        onBarcodeScanned={
          codigo || digitando ? undefined : ({ data }) => setCodigo(data)
        }
      />

      {!digitando && (
        <View style={estilos.sobreposicao} pointerEvents="none">
          <View style={estilos.moldura} />
          <Text style={estilos.dica}>Aponte para o código de barras</Text>
        </View>
      )}

      {digitando && (
        <View
          style={[
            estilos.painelDigitar,
            temaEscuro && estilos.painelDigitarEscuro,
          ]}
        >
          <Campo
            rotulo="Código do item"
            value={texto}
            onChangeText={setTexto}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
          />
          <Pressable
            style={[estilos.botao, !codigoDigitado && estilos.botaoDesativado]}
            disabled={!codigoDigitado}
            onPress={() => usarCodigo(codigoDigitado)}
          >
            <Text style={estilos.textoBotao}>Usar este código</Text>
          </Pressable>
          <Pressable
            style={[
              estilos.botaoSecundario,
              temaEscuro && estilos.botaoSecundarioEscuro,
            ]}
            onPress={() => {
              setDigitando(false);
              setTexto("");
            }}
          >
            <Text style={estilos.textoSecundario}>Cancelar</Text>
          </Pressable>
        </View>
      )}

      {!digitando && (
        <View style={estilos.rodape}>
          {codigo ? (
            <View style={[estilos.resultado, temaEscuro && estilos.resultadoEscuro]}>
              <Text style={[estilos.rotulo, temaEscuro && estilos.rotuloEscuro]}>
                Código lido
              </Text>
              <Text style={[estilos.codigo, temaEscuro && estilos.rotuloEscuro]}>
                {codigo}
              </Text>
              <Pressable
                style={estilos.botao}
                onPress={() => usarCodigo(codigo)}
              >
                <Text style={estilos.textoBotao}>Usar este código</Text>
              </Pressable>
              <Pressable
                style={[
                  estilos.botaoSecundario,
                  temaEscuro && estilos.botaoSecundarioEscuro,
                ]}
                onPress={() => setCodigo("")}
              >
                <Text style={estilos.textoSecundario}>Ler outro código</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={estilos.botaoContorno}
              onPress={() => setDigitando(true)}
            >
              <Text style={estilos.textoContorno}>Digitar código</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101418",
  },
  centro: {
    justifyContent: "center",
    padding: 28,
  },
  mensagem: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  sobreposicao: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  moldura: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 16,
  },
  dica: {
    marginTop: 24,
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  painelDigitar: {
    position: "absolute",
    top: 16,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
  },
  painelDigitarEscuro: {
    backgroundColor: "#1E2933",
  },
  rodape: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingBottom: 32,
  },
  resultado: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
  },
  resultadoEscuro: {
    backgroundColor: "#1E2933",
  },
  rotulo: {
    fontSize: 13,
    color: "#4A5563",
  },
  rotuloEscuro: {
    color: "#F8FAFC",
  },
  codigo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
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
  },
  textoSecundario: {
    color: "#0F766E",
    fontSize: 16,
    fontWeight: "600",
  },
  botaoContorno: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  textoContorno: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
