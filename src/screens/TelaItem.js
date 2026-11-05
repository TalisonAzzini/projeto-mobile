import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Campo from "../components/Campo";
import {
  dataValida,
  formatarData,
  formatarTelefone,
} from "../utils/formatadores";
import { useUsuario } from "../contexts/UsuarioContext";
import { useTema } from "../contexts/TemaContext";
import {
  inativarProduto,
  reativarProduto,
  salvarProduto,
} from "../services/produtos";

export default function TelaItem({ navigation, route }) {
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
    preco: item?.preco ? String(item.preco).replace(".", ",") : "",
    validade: item?.validade
      ? item.validade.split("-").reverse().join("/")
      : "",
    fornecedor: item?.fornecedor ?? "",
    telefone: item?.telefone ?? "",
  });
  const [salvando, setSalvando] = useState(false);
  const [inativando, setInativando] = useState(false);
  const [erro, setErro] = useState("");
  const [alturaTeclado, setAlturaTeclado] = useState(0);
  const rolagemRef = useRef(null);
  const campoFocadoRef = useRef(null);
  const tecladoVisivelRef = useRef(false);
  const topoTecladoRef = useRef(null);
  const deslocamentoRolagemRef = useRef(0);

  function rolarAteCampo() {
    const campo = campoFocadoRef.current;
    const topoTeclado = topoTecladoRef.current;
    const rolagem = rolagemRef.current;
    if (!campo || !rolagem || topoTeclado == null) return;

    campo.measureInWindow((_campoX, campoY, _campoLargura, campoAltura) => {
      rolagem.measureInWindow((_rolagemX, rolagemY, _rolagemLargura, rolagemAltura) => {
        const limiteVisivel = Math.min(
          rolagemY + rolagemAltura,
          topoTeclado,
        ) - 72;
        const fimDoCampo = campoY + campoAltura;
        const quantoRolar = fimDoCampo - limiteVisivel;

        if (quantoRolar > 0) {
          rolagem.scrollTo({
            y: deslocamentoRolagemRef.current + quantoRolar,
            animated: true,
          });
        }
      });
    });
  }

  function aoFocarCampo(campo) {
    campoFocadoRef.current = campo;
    if (tecladoVisivelRef.current) {
      setTimeout(rolarAteCampo, 100);
    }
  }

  useEffect(() => {
    const mostrar = Keyboard.addListener("keyboardDidShow", (event) => {
      tecladoVisivelRef.current = true;
      setAlturaTeclado(event.endCoordinates.height);
      topoTecladoRef.current = event.endCoordinates.screenY;
      setTimeout(rolarAteCampo, 150);
    });
    const esconder = Keyboard.addListener("keyboardDidHide", () => {
      tecladoVisivelRef.current = false;
      setAlturaTeclado(0);
      topoTecladoRef.current = null;
    });

    return () => {
      mostrar.remove();
      esconder.remove();
    };
  }, []);

  function dataParaBanco(data) {
    if (!data) return null;
    const [dia, mes, ano] = data.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  function paraNumeroValido(valor) {
    const normalizado = valor.trim().replace(",", ".");
    if (!/^\d+(\.\d+)?$/.test(normalizado)) return NaN;
    return Number(normalizado);
  }

  function alterar(campo, valor) {
    setForm((formAtual) => ({ ...formAtual, [campo]: valor }));
    setErro("");
  }

  async function salvar() {
    setErro("");

    if (!form.nome.trim()) {
      setErro("Informe o nome do produto.");
      return;
    }

    if (!form.unidade.trim()) {
      setErro("Informe a unidade do produto.");
      return;
    }

    if (!form.quantidade.trim() || !form.minimo.trim()) {
      setErro("Informe a quantidade atual e o estoque mínimo.");
      return;
    }

    if (!form.preco.trim()) {
      setErro("Informe o preço de venda.");
      return;
    }

    const quantidade = paraNumeroValido(form.quantidade);
    const minimo = paraNumeroValido(form.minimo);
    const preco = paraNumeroValido(form.preco);

    if (
      !Number.isFinite(quantidade) ||
      !Number.isFinite(minimo) ||
      !Number.isFinite(preco) ||
      quantidade < 0 ||
      minimo < 0 ||
      preco < 0
    ) {
      setErro("Quantidade, estoque mínimo e preço devem ser valores válidos e não negativos.");
      return;
    }

    if (form.validade && !dataValida(form.validade)) {
      setErro("Informe uma validade válida no formato dd/mm/aaaa.");
      return;
    }

    setSalvando(true);
    try {
      await salvarProduto({
        id: item?.id,
        produto: {
          nome: form.nome.trim(),
          codigo: form.codigo.trim(),
          unidade: form.unidade.trim(),
          quantidade,
          minimo,
          preco,
          validade: dataParaBanco(form.validade),
          fornecedor: form.fornecedor.trim(),
          telefone: form.telefone.trim(),
        },
      });
      navigation.goBack();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarAlteracaoStatus() {
    const produtoInativo = item.ativo === false;
    const acao = produtoInativo ? "reativar" : "inativar";
    Alert.alert(
      produtoInativo ? "Reativar produto" : "Inativar produto",
      produtoInativo
        ? `Deseja reativar "${item.nome}" e exibi-lo novamente no estoque?`
        : `Deseja inativar "${item.nome}"? Ele deixará de aparecer no estoque, mas não será excluído.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: produtoInativo ? "Reativar" : "Inativar",
          style: produtoInativo ? "default" : "destructive",
          onPress: async () => {
            setErro("");
            setInativando(true);

            try {
              if (produtoInativo) {
                await reativarProduto(item.id);
              } else {
                await inativarProduto(item.id);
              }
              navigation.goBack();
            } catch (error) {
              setErro(error.message);
            } finally {
              setInativando(false);
            }
          },
        },
      ],
    );
  }

  return (
    <View style={estilos.ajustadorTeclado}>
      <KeyboardAvoidingView
        style={estilos.rolagem}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={Platform.OS === "ios"}
      >
        <ScrollView
          ref={rolagemRef}
          style={estilos.rolagem}
          contentContainerStyle={[
            estilos.container,
            temaEscuro && estilos.containerEscuro,
            { paddingBottom: alturaTeclado > 0 ? alturaTeclado + 24 : 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          scrollEventThrottle={16}
          onScroll={(event) => {
            deslocamentoRolagemRef.current =
              event.nativeEvent.contentOffset.y;
          }}
        >
          <Campo
            rotulo="Nome"
            value={form.nome}
            onChangeText={(v) => alterar("nome", v)}
            onFocus={aoFocarCampo}
            editable={!somenteLeitura && !salvando && !inativando}
          />
          <Campo
            rotulo="Código de barras"
            value={form.codigo}
            onChangeText={(v) => alterar("codigo", v)}
            onFocus={aoFocarCampo}
            keyboardType="numeric"
            editable={!somenteLeitura && !salvando && !inativando}
          />
          <Campo
            rotulo="Unidade"
            value={form.unidade}
            onChangeText={(v) => alterar("unidade", v)}
            onFocus={aoFocarCampo}
            editable={!somenteLeitura && !salvando && !inativando}
          />
          <Campo
            rotulo="Quantidade atual"
            value={form.quantidade}
            onChangeText={(v) => alterar("quantidade", v)}
            onFocus={aoFocarCampo}
            keyboardType="decimal-pad"
            editable={!somenteLeitura && !salvando && !inativando}
          />
          <Campo
            rotulo="Estoque mínimo"
            value={form.minimo}
            onChangeText={(v) => alterar("minimo", v)}
            onFocus={aoFocarCampo}
            keyboardType="decimal-pad"
            editable={!somenteLeitura && !salvando && !inativando}
          />
          <Campo
            rotulo="Preço de venda"
            value={form.preco}
            onChangeText={(v) => alterar("preco", v.replace(/[^\d.,]/g, ""))}
            onFocus={aoFocarCampo}
            keyboardType="decimal-pad"
            placeholder="Ex.: 12,50"
            editable={!somenteLeitura && !salvando && !inativando}
          />
          <Campo
            rotulo="Validade (opcional)"
            value={form.validade}
            onChangeText={(v) => alterar("validade", formatarData(v))}
            onFocus={aoFocarCampo}
            placeholder="dd/mm/aaaa"
            keyboardType="numeric"
            maxLength={10}
            editable={!somenteLeitura && !salvando && !inativando}
          />
          <Campo
            rotulo="Fornecedor"
            value={form.fornecedor}
            onChangeText={(v) => alterar("fornecedor", v)}
            onFocus={aoFocarCampo}
            editable={!somenteLeitura && !salvando && !inativando}
          />
          <Campo
            rotulo="WhatsApp do fornecedor"
            value={form.telefone}
            onChangeText={(v) => alterar("telefone", formatarTelefone(v))}
            onFocus={aoFocarCampo}
            keyboardType="phone-pad"
            maxLength={15}
            editable={!somenteLeitura && !salvando && !inativando}
          />

          {erro ? (
            <Text style={[estilos.erro, temaEscuro && estilos.erroEscuro]}>
              {erro}
            </Text>
          ) : null}

          {!somenteLeitura && (
            <Pressable
              style={[
                estilos.botaoPrincipal,
                (salvando || inativando) && estilos.botaoDesativado,
              ]}
              onPress={salvar}
              disabled={salvando || inativando}
            >
              {salvando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={estilos.textoPrincipal}>Salvar</Text>
              )}
            </Pressable>
          )}
          {!somenteLeitura && item && (
            <Pressable
              style={[
                estilos.botaoSecundario,
                temaEscuro && estilos.botaoSecundarioEscuro,
                inativando && estilos.botaoDesativado,
              ]}
              onPress={confirmarAlteracaoStatus}
              disabled={salvando || inativando}
            >
              {inativando ? (
                <ActivityIndicator color="#0F766E" />
              ) : (
                <Text style={estilos.textoSecundario}>
                  {item.ativo === false ? "Reativar item" : "Inativar item"}
                </Text>
              )}
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const estilos = StyleSheet.create({
  ajustadorTeclado: {
    flex: 1,
  },
  rolagem: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
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
  botaoDesativado: {
    opacity: 0.65,
  },
  erro: {
    color: "#B42318",
    fontSize: 14,
    marginBottom: 12,
  },
  erroEscuro: {
    color: "#FDA4AF",
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
