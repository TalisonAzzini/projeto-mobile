import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import Campo from '../components/Campo';
import { formatarQuantidade, paraNumero } from '../utils/formatadores';

// EXEMPLO (substituir futuramente pelos dados vindo do banco de dados)
const ITEM = { nome: 'Farinha de trigo', quantidade: 3, unidade: 'kg' };

export default function TelaMovimentacao() {
  const [tipo, setTipo] = useState('entrada');
  const [quantidade, setQuantidade] = useState('');

  const valor = paraNumero(quantidade);
  const saidaMaiorQueEstoque = tipo === 'saida' && valor > ITEM.quantidade;
  const novoSaldo = tipo === 'entrada' ? ITEM.quantidade + valor : ITEM.quantidade - valor;
  const saldoTexto = saidaMaiorQueEstoque
    ? '—'
    : String(Math.round(novoSaldo * 1000) / 1000).replace('.', ',');
  const podeConfirmar = valor > 0 && !saidaMaiorQueEstoque;

  return (
    <ScrollView contentContainerStyle={estilos.container} keyboardShouldPersistTaps="handled">
      <Text style={estilos.titulo}>Movimentação</Text>

      <Campo rotulo="Item" value={ITEM.nome} editable={false} />

      <Pressable style={estilos.botaoSecundario}>
        <Text style={estilos.textoSecundario}>Ler código de barras</Text>
      </Pressable>

      <View style={estilos.opcoes}>
        <Pressable
          style={[estilos.opcao, tipo === 'entrada' && estilos.opcaoAtiva]}
          onPress={() => setTipo('entrada')}
        >
          <Text style={[estilos.textoOpcao, tipo === 'entrada' && estilos.textoOpcaoAtiva]}>
            Entrada
          </Text>
        </Pressable>
        <Pressable
          style={[estilos.opcao, tipo === 'saida' && estilos.opcaoAtiva]}
          onPress={() => setTipo('saida')}
        >
          <Text style={[estilos.textoOpcao, tipo === 'saida' && estilos.textoOpcaoAtiva]}>
            Saída
          </Text>
        </Pressable>
      </View>

      <Campo
        rotulo="Quantidade"
        value={quantidade}
        onChangeText={(v) => setQuantidade(formatarQuantidade(v))}
        keyboardType="decimal-pad"
      />

      <View style={estilos.resumo}>
        <Text style={estilos.resumoTexto}>
          Em estoque: {ITEM.quantidade} {ITEM.unidade}
        </Text>
        <Text style={estilos.resumoDetalhe}>
          Novo saldo: {saldoTexto} {saidaMaiorQueEstoque ? '' : ITEM.unidade}
        </Text>
      </View>

      {saidaMaiorQueEstoque && (
        <Text style={estilos.erro}>A saída é maior que o estoque disponível.</Text>
      )}

      <Pressable
        style={[estilos.botaoPrincipal, !podeConfirmar && estilos.botaoDesativado]}
        disabled={!podeConfirmar}
      >
        <Text style={estilos.textoPrincipal}>
          Confirmar {tipo === 'entrada' ? 'entrada' : 'saída'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: '#F6F7F9',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  botaoSecundario: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0F766E',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  textoSecundario: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '600',
  },
  opcoes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  opcao: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0F766E',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  opcaoAtiva: {
    backgroundColor: '#0F766E',
  },
  textoOpcao: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '600',
  },
  textoOpcaoAtiva: {
    color: '#FFFFFF',
  },
  resumo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DEE5',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  resumoTexto: {
    fontSize: 16,
  },
  resumoDetalhe: {
    fontSize: 13,
    color: '#4A5563',
    marginTop: 2,
  },
  erro: {
    color: '#B42318',
    fontSize: 14,
    marginBottom: 16,
  },
  botaoPrincipal: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoDesativado: {
    opacity: 0.4,
  },
  textoPrincipal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});