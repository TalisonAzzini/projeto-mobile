import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function TelaScanner() {
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [codigo, setCodigo] = useState("");

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
        onBarcodeScanned={codigo ? undefined : ({ data }) => setCodigo(data)}
      />

      <View style={estilos.sobreposicao} pointerEvents="none">
        <View style={estilos.moldura} />
        <Text style={estilos.dica}>Aponte para o código de barras</Text>
      </View>

      <View style={estilos.rodape}>
        {codigo ? (
          <View style={estilos.resultado}>
            <Text style={estilos.rotulo}>Código lido</Text>
            <Text style={estilos.codigo}>{codigo}</Text>
            <Pressable style={estilos.botao} onPress={() => setCodigo("")}>
              <Text style={estilos.textoBotao}>Ler outro código</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={estilos.botaoContorno}>
            <Text style={estilos.textoContorno}>Digitar código</Text>
          </Pressable>
        )}
      </View>
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
  rotulo: {
    fontSize: 13,
    color: "#4A5563",
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
  textoBotao: {
    color: "#FFFFFF",
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
