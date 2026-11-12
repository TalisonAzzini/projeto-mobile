import { useContext } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { HeaderHeightContext } from "@react-navigation/elements";

export default function TelaComTeclado({ children }) {
  
  const alturaCabecalho = useContext(HeaderHeightContext) ?? 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      enabled={Platform.OS === "ios"}
      keyboardVerticalOffset={alturaCabecalho}
    >
      {children}
    </KeyboardAvoidingView>
  );
}