import { Linking, Alert } from "react-native";
import { somenteNumeros } from "../utils/formatadores";

export async function pedirReposicaoNoWhatsApp(item) {
  const numero = somenteNumeros(item.telefone ?? "");

  if (numero.length < 10) {
    Alert.alert(
      "Sem WhatsApp",
      "Cadastre o WhatsApp do fornecedor no item para fazer o pedido.",
    );
    return;
  }

  const mensagem =
    `Olá! Preciso repor o item "${item.nome}". ` +
    `Estoque atual: ${item.quantidade} ${item.unidade} ` +
    `(mínimo: ${item.minimo} ${item.unidade}).`;

    const url = `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
  }
}