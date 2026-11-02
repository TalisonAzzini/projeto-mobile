import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';

// Dados de exemplo, só para ver a lista funcionando.
// Depois serão trocados pelos itens que vêm do banco de dados.
const ITENS_ABAIXO_DO_MINIMO = [
  { codigo: '7891000100103', nome: 'Farinha de trigo', quantidade: 3, unidade: 'kg', minimo: 10 },
  { codigo: '7891000200201', nome: 'Fermento biológico', quantidade: 2, unidade: 'un', minimo: 6 },
  { codigo: '7891000300309', nome: 'Açúcar refinado', quantidade: 4, unidade: 'kg', minimo: 8 },
];

export default function TelaPainel() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Painel</Text>
      <Text style={estilos.secao}>Abaixo do mínimo</Text>

      <FlatList
        data={ITENS_ABAIXO_DO_MINIMO}
        keyExtractor={(item) => item.codigo}
        renderItem={({ item }) => (
          <View style={estilos.cartao}>
            <View>
              <Text style={estilos.nome}>{item.nome}</Text>
              <Text style={estilos.detalhe}>
                {item.quantidade} {item.unidade} · mín. {item.minimo} {item.unidade}
              </Text>
            </View>

            <Pressable style={estilos.botao}>
              <Text style={estilos.textoBotao}>Pedir no WhatsApp</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 20,
    backgroundColor: '#F6F7F9',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  secao: {
    fontSize: 15,
    color: '#4A5563',
    marginBottom: 12,
  },
  cartao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DEE5',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  nome: {
    fontSize: 16,
  },
  detalhe: {
    fontSize: 13,
    color: '#4A5563',
  },
  botao: {
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#0F766E',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  textoBotao: {
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '600',
  },
});