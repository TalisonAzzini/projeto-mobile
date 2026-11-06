import { listarProdutos } from "./produtos";
import { supabase } from "./supabase";

function traduzirErroMovimentacao(error) {
  const codigo = String(error?.code ?? "");
  const mensagem = String(error?.message ?? "").toLowerCase();

  if (mensagem.includes("estoque_insuficiente")) {
    return "A saída é maior que o estoque disponível.";
  }

  if (mensagem.includes("produto_nao_encontrado")) {
    return "O produto não foi encontrado ou está inativo.";
  }

  if (mensagem.includes("quantidade_invalida")) {
    return "Informe uma quantidade maior que zero e com no máximo três casas decimais.";
  }

  if (mensagem.includes("tipo_invalido")) {
    return "O tipo de movimentação informado é inválido.";
  }

  if (mensagem.includes("usuario_nao_autenticado")) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  if (mensagem.includes("saldo_invalido")) {
    return "O produto está com saldo inválido no banco de dados. Confira o cadastro antes de movimentar.";
  }

  if (codigo === "42501" || codigo === "PGRST301") {
    return "O Supabase negou a movimentação. Confira se a função registrar_movimentacao permite execução para usuários autenticados.";
  }

  if (codigo === "PGRST202" || codigo === "42883") {
    return "A função registrar_movimentacao não foi encontrada pelo Supabase. Execute novamente o SQL de configuração e aguarde alguns minutos para atualizar o esquema.";
  }

  if (codigo === "42P01" || codigo === "PGRST205") {
    return "A tabela public.movimentacoes não foi encontrada. Execute o SQL de configuração no Supabase.";
  }

  if (codigo === "42703" || codigo === "PGRST204") {
    const colunaCache = mensagem.match(
      /could not find the ['"]([^'"]+)['"] column of ['"]([^'"]+)['"]/,
    );
    if (colunaCache) {
      return `A coluna "${colunaCache[1]}" não existe na tabela "${colunaCache[2]}". Confira e ajuste essa coluna no Supabase.`;
    }

    const colunaSql = mensagem.match(
      /column ["']?([\w.]+)["']?(?: of relation ["']?([\w]+)["']?)? does not exist/,
    );
    if (colunaSql) {
      const tabela = colunaSql[2]
        ? ` da tabela "${colunaSql[2]}"`
        : " referenciada pela função";
      return `A coluna "${colunaSql[1]}"${tabela} não existe. Confira o esquema no Supabase.`;
    }

    return "Falta uma coluna necessária em public.produtos ou public.movimentacoes. Confira o esquema das tabelas no SQL de configuração.";
  }

  if (codigo === "23503") {
    return "O produto ou usuário relacionado à movimentação não foi encontrado. Confira os registros no Supabase.";
  }

  if (codigo === "23514") {
    const nomeRestricao = mensagem.match(/constraint ["']([^"']+)["']/)?.[1];
    return nomeRestricao
      ? `A tabela public.movimentacoes recusou o registro pela regra "${nomeRestricao}". Confira os valores aceitos por essa restrição no Supabase.`
      : "A tabela public.movimentacoes recusou o registro por uma regra CHECK. Confira os valores aceitos para tipo_movimentacao e quantidade no Supabase.";
  }

  if (codigo === "22003") {
    return "O saldo ou a quantidade excede o limite numérico configurado no banco de dados.";
  }

  if (
    error?.name === "TypeError" ||
    mensagem.includes("network request failed") ||
    mensagem.includes("failed to fetch")
  ) {
    return "Não foi possível conectar ao Supabase. Verifique a internet e tente novamente.";
  }

  return `O Supabase não conseguiu registrar a movimentação${codigo ? ` (código ${codigo})` : ""}. Confira a função e as tabelas no SQL de configuração.`;
}

export async function listarProdutosParaMovimentacao() {
  return listarProdutos({ ativos: true });
}

export async function listarHistoricoMovimentacoes() {
  const { data: movimentacoes, error } = await supabase
    .from("movimentacoes")
    .select(
      "id, produto_id, usuario_id, tipo_movimentacao, quantidade, observacao, data_movimentacao",
    )
    .order("data_movimentacao", { ascending: false });

  if (error) {
    if (error.code === "42501" || error.code === "PGRST301") {
      throw new Error(
        "O Supabase negou o acesso ao histórico. Configure uma policy de leitura para o dono na tabela public.movimentacoes.",
      );
    }

    if (error.code === "42P01" || error.code === "PGRST205") {
      throw new Error(
        "A tabela public.movimentacoes não foi encontrada no Supabase.",
      );
    }

    throw new Error(
      "Não foi possível carregar o histórico de movimentações. Verifique a conexão e tente novamente.",
    );
  }

  if (!movimentacoes?.length) {
    return [];
  }

  const produtoIds = [...new Set(movimentacoes.map((item) => item.produto_id))];
  const usuarioIds = [...new Set(movimentacoes.map((item) => item.usuario_id))];
  const [
    { data: produtos, error: erroProdutos },
    { data: usuarios, error: erroUsuarios },
  ] = await Promise.all([
    supabase
      .from("produtos")
      .select("id, nome, unidade")
      .in("id", produtoIds),
    supabase
      .from("usuarios")
      .select("id, nome, email")
      .in("id", usuarioIds),
  ]);

  if (erroProdutos) {
    throw new Error(
      "Não foi possível carregar os nomes dos produtos do histórico. Confira as permissões de leitura da tabela public.produtos.",
    );
  }

  if (erroUsuarios) {
    throw new Error(
      "Não foi possível carregar os nomes dos usuários do histórico. Confira as permissões de leitura da tabela public.usuarios para o dono.",
    );
  }

  const produtosPorId = new Map(
    (produtos ?? []).map((produto) => [produto.id, produto]),
  );
  const usuariosPorId = new Map(
    (usuarios ?? []).map((usuario) => [
      usuario.id,
      usuario.nome || usuario.email || String(usuario.id).slice(0, 8),
    ]),
  );

  return movimentacoes.map((movimentacao) => ({
    ...movimentacao,
    produto: produtosPorId.get(movimentacao.produto_id) ?? null,
    nomeUsuario:
      usuariosPorId.get(movimentacao.usuario_id) ??
      String(movimentacao.usuario_id).slice(0, 8),
  }));
}

export async function buscarProdutoPorCodigo(codigo) {
  const codigoNormalizado = String(codigo ?? "").trim();
  if (!codigoNormalizado) {
    throw new Error("Informe um código de barras válido.");
  }

  const produtos = await listarProdutosParaMovimentacao();
  const produto = produtos.find((item) => item.codigo === codigoNormalizado);

  if (!produto) {
    throw new Error(
      "Nenhum produto ativo foi encontrado com esse código de barras.",
    );
  }

  return produto;
}

export async function registrarMovimentacao({
  produtoId,
  tipo,
  quantidade,
}) {
  if (!produtoId) {
    throw new Error("Selecione um produto para registrar a movimentação.");
  }

  if (tipo !== "entrada" && tipo !== "saida") {
    throw new Error("Selecione entrada ou saída para a movimentação.");
  }

  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw new Error("Informe uma quantidade maior que zero.");
  }

  if ((String(quantidade).split(".")[1] ?? "").length > 3) {
    throw new Error("Informe a quantidade com no máximo três casas decimais.");
  }

  let resposta;
  try {
    resposta = await supabase.rpc("registrar_movimentacao", {
      p_produto_id: produtoId,
      p_tipo: tipo,
      p_quantidade: quantidade,
    });
  } catch (error) {
    console.error("Falha de comunicação ao registrar movimentação.", {
      name: error?.name,
      message: error?.message,
    });
    throw new Error(traduzirErroMovimentacao(error));
  }

  const { data, error } = resposta;
  if (error) {
    console.error("Supabase recusou registrar movimentação.", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(traduzirErroMovimentacao(error));
  }

  if (data == null || data === "") {
    throw new Error(
      "O banco não confirmou o novo saldo. Confira o estoque antes de tentar novamente.",
    );
  }

  const novoSaldo = Number(data);
  if (!Number.isFinite(novoSaldo) || novoSaldo < 0) {
    throw new Error(
      "O banco retornou um saldo inválido após a movimentação. Confira o estoque antes de tentar novamente.",
    );
  }

  return novoSaldo;
}
