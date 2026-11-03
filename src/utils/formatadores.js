// Limpa a string e deixa somente os números, removendo espaços, parênteses, traços etc.
export function somenteNumeros(texto) {
  return texto.replace(/\D/g, '');
}

// Formata o que foi digitado em (xx) xxxxx-xxxx ou (xx) xxxx-xxxx
export function formatarTelefone(texto) {
  const n = somenteNumeros(texto).slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

// Formata a data para dd/mm/aaaa
export function formatarData(texto) {
  const n = somenteNumeros(texto).slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

// Valida a data ao clicar em Salvar: precisa ter 10 caracteres, e ser uma data real (não 31/02/2024, por exemplo).
export function dataValida(texto) {
  if (texto.length !== 10) return false;
  const [dia, mes, ano] = texto.split('/').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia
  );
}

// Valida o telefone ao clicar em Salvar: precisa ter pelo menos 10 números.
export function telefoneValido(texto) {
  return somenteNumeros(texto).length >= 10;
}

// Formata a quantidade, com vírgula como separador decimal.
export function formatarQuantidade(texto) {
  const limpo = texto.replace(/[^\d.,]/g, '').replace(/\./g, ',');
  const [inteira, ...resto] = limpo.split(',');
  return resto.length ? `${inteira},${resto.join('')}` : inteira;
}
 
// Converte a quantidade para número. Se não for um número válido, retorna 0.
export function paraNumero(texto) {
  const numero = Number(texto.replace(',', '.'));
  return Number.isNaN(numero) ? 0 : numero;
}