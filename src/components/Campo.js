import { useRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTema } from "../contexts/TemaContext";

export default function Campo({ rotulo, onFocus, ...resto }) {
  const { temaEscuro } = useTema();
  const campoRef = useRef(null);

  return (
    <View style={estilos.grupo}>
      <Text style={[estilos.rotulo, temaEscuro && estilos.rotuloEscuro]}>
        {rotulo}
      </Text>
      <TextInput
        ref={campoRef}
        onFocus={(event) => onFocus?.(campoRef.current, event)}
        style={[
          estilos.campo,
          temaEscuro && estilos.campoEscuro,
          resto.editable === false && estilos.somenteLeitura,
          temaEscuro && resto.editable === false && estilos.somenteLeituraEscuro,
        ]}
        placeholderTextColor={temaEscuro ? "#94A3B8" : "#6B7280"}
        {...resto}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: {
    marginBottom: 16,
  },
  rotulo: {
    fontSize: 13,
    color: "#4A5563",
    marginBottom: 4,
  },
  rotuloEscuro: {
    color: "#CBD5E1",
  },
  campo: {
    height: 48,
    borderWidth: 1,
    borderColor: "#8A94A3",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  campoEscuro: {
    backgroundColor: "#1E2933",
    borderColor: "#475569",
    color: "#F8FAFC",
  },
  somenteLeitura: {
    backgroundColor: "#EEF0F3",
    color: "#4A5563",
  },
  somenteLeituraEscuro: {
    backgroundColor: "#263442",
    color: "#CBD5E1",
  },
});
