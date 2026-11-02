import { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';

//EXEMPLO (tirar assim que conectar com o banco de dados)
const ITENS = [
  { codigo: '7891000100103', nome: 'Farinha de trigo', quantidade: 15, unidade: 'kg', minimo: 10 },
  { codigo: '7891000200201', nome: 'Fermento biológico', quantidade: 25, unidade: 'un', minimo: 6 },
  { codigo: '7891000300309', nome: 'Açúcar refinado', quantidade: 4, unidade: 'kg', minimo: 8 },
];

export default function TelaEstoque() {
  const [busca, setBusca] = useState('');

  const itensFiltrados = ITENS.filter(
    (item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase()) ||
      item.codigo.includes(busca)
  );

  return (
    <View style={estilos.container}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.titulo}>Estoque</Text>
        <Pressable>
          <Text style={estilos.link}>Novo item</Text>
        </Pressable>
      </View>

      <TextInput
        style={estilos.busca}
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar item ou código"
      />

      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.codigo}
        ListEmptyComponent={<Text style={estilos.vazio}>Nenhum item encontrado</Text>}
        renderItem={({ item }) => {
          const abaixoDoMinimo = item.quantidade <= item.minimo;

          return (
            <View style={estilos.cartao}>
              <View>
                <Text style={estilos.nome}>{item.nome}</Text>
                <Text style={estilos.detalhe}>
                  {item.quantidade} {item.unidade}
                </Text>
              </View>

              {abaixoDoMinimo && (
                <View style={estilos.selo}>
                  <Text style={estilos.textoSelo}>Baixo</Text>
                </View>
              )}
            </View>
          );
        }}
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
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  link: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '600',
  },
  busca: {
    height: 48,
    borderWidth: 1,
    borderColor: '#8A94A3',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  vazio: {
    textAlign: 'center',
    color: '#4A5563',
    marginTop: 24,
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
  selo: {
    backgroundColor: '#FDF1E3',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 99,
  },
  textoSelo: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '600',
  },
});