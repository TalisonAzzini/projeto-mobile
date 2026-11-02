import { useState } from 'react';
import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import Campo from '../components/Campo';
import { formatarTelefone, formatarData } from '../utils/formatadores';

export default function TelaItem() {
    
  // EXEMPLO (substituir futuramente pelos dados vindo do banco de dados)
  const [form, setForm] = useState({
    nome: 'Farinha de trigo',
    codigo: '7891000100103',
    unidade: 'kg',
    quantidade: '3',
    minimo: '10',
    validade: '',
    fornecedor: 'Distribuidora Silva',
    telefone: '(21) 90000-0000',
  });

  function alterar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  return (
    <ScrollView contentContainerStyle={estilos.container} keyboardShouldPersistTaps="handled">
      <Text style={estilos.titulo}>Item</Text>

      <Campo rotulo="Nome" value={form.nome} onChangeText={(v) => alterar('nome', v)} />
      <Campo
        rotulo="Código de barras"
        value={form.codigo}
        onChangeText={(v) => alterar('codigo', v)}
        keyboardType="numeric"
      />
      <Campo rotulo="Unidade" value={form.unidade} onChangeText={(v) => alterar('unidade', v)} />
      <Campo
        rotulo="Quantidade atual"
        value={form.quantidade}
        onChangeText={(v) => alterar('quantidade', v)}
        keyboardType="decimal-pad"
      />
      <Campo
        rotulo="Estoque mínimo"
        value={form.minimo}
        onChangeText={(v) => alterar('minimo', v)}
        keyboardType="decimal-pad"
      />
      <Campo
        rotulo="Validade (opcional)"
        value={form.validade}
        onChangeText={(v) => alterar('validade', formatarData(v))}
        placeholder="dd/mm/aaaa"
        keyboardType="numeric"
        maxLength={10}
      />
      <Campo
        rotulo="Fornecedor"
        value={form.fornecedor}
        onChangeText={(v) => alterar('fornecedor', v)}
      />
      <Campo
        rotulo="WhatsApp do fornecedor"
        value={form.telefone}
        onChangeText={(v) => alterar('telefone', formatarTelefone(v))}
        keyboardType="phone-pad"
        maxLength={15}
      />

      <Pressable style={estilos.botaoPrincipal}>
        <Text style={estilos.textoPrincipal}>Salvar</Text>
      </Pressable>
      <Pressable style={estilos.botaoSecundario}>
        <Text style={estilos.textoSecundario}>Inativar item</Text>
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
  botaoPrincipal: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  textoPrincipal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoSecundario: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0F766E',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  textoSecundario: {
    color: '#0F766E',
    fontSize: 16,
    fontWeight: '600',
  },
});