import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function Campo({ rotulo, ...resto }) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput style={estilos.campo} {...resto} />
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: {
    marginBottom: 16,
  },
  rotulo: {
    fontSize: 13,
    color: '#4A5563',
    marginBottom: 4,
  },
  campo: {
    height: 48,
    borderWidth: 1,
    borderColor: '#8A94A3',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
});