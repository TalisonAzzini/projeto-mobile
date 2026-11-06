import { supabase } from "./supabase";

function traduzirErroConsultaProdutos(codigo) {
  if (codigo === "42501" || codigo === "PGRST301") {
    return "O Supabase negou o acesso ao estoque. Verifique a sessão e as permissões de leitura da tabela public.produtos.";
  }

  if (codigo === "PGRST205" || codigo === "42P01") {
    return "A tabela public.produtos não foi encontrada no Supabase. Confira o nome da tabela e atualize o esquema no painel do projeto.";
  }

  if (codigo === "PGRST204" || codigo === "42703") {
    return "A tabela public.produtos não contém todas as colunas esperadas para exibir o estoque.";
  }

  return "Não foi possível carregar os itens do banco de dados. Verifique sua conexão e tente novamente.";
}

function traduzirErroSalvarProduto(codigo) {
  if (codigo === "42501" || codigo === "PGRST301") {
    return "O Supabase negou a gravação. Configure as policies de inclusão e edição na tabela public.produtos para o perfil dono.";
  }

  if (codigo === "23505") {
    return "Já existe um produto cadastrado com esse código de barras.";
  }

  if (codigo === "23502" || codigo === "22P02" || codigo === "22003") {
    return "Confira os campos obrigatórios e os valores informados para o produto.";
  }

  if (codigo === "PGRST205" || codigo === "42P01") {
    return "A tabela public.produtos não foi encontrada no Supabase.";
  }

  if (codigo === "PGRST204" || codigo === "42703") {
    return "A tabela public.produtos não contém as colunas necessárias para salvar o produto.";
  }

  return "Não foi possível salvar o produto. Verifique sua conexão e tente novamente.";
}

export async function listarProdutos({ ativos = true } = {}) {
  const resultado = await supabase
    .from("produtos")
    .select(
      "id, nome, codigo_barras, quantidade_atual, unidade, estoque_minimo, validade, fornecedor, telefone_fornecedor, preco_venda, ativo",
    )
    .eq("ativo", ativos)
    .order("nome", { ascending: true });
  const { data, error } = resultado;

  if (error) {
    throw new Error(traduzirErroConsultaProdutos(error.code));
  }

  if (!data) {
    throw new Error(traduzirErroConsultaProdutos());
  }

  return data.map((item) => {
    if (item.quantidade_atual == null || item.estoque_minimo == null) {
      throw new Error(
        "Há um produto com dados incompletos na tabela public.produtos. Confira quantidade atual e estoque mínimo.",
      );
    }

    const quantidade = Number(item.quantidade_atual);
    const minimo = Number(item.estoque_minimo);

    if (
      !item.id ||
      !item.nome ||
      !item.unidade ||
      !Number.isFinite(quantidade) ||
      !Number.isFinite(minimo)
    ) {
      throw new Error(
        "Há um produto com dados incompletos na tabela public.produtos. Confira nome, unidade, quantidade atual e estoque mínimo.",
      );
    }

    return {
      id: item.id,
      nome: item.nome,
      codigo: String(item.codigo_barras ?? ""),
      quantidade,
      unidade: item.unidade,
      minimo,
      validade: item.validade,
      fornecedor: item.fornecedor,
      telefone: item.telefone_fornecedor,
      preco: item.preco_venda == null ? "" : String(item.preco_venda),
      ativo: item.ativo,
    };
  });
}

export async function salvarProduto({ id, produto }) {
  const dados = {
    nome: produto.nome,
    codigo_barras: produto.codigo || null,
    unidade: produto.unidade,
    quantidade_atual: produto.quantidade,
    estoque_minimo: produto.minimo,
    preco_venda: produto.preco,
    validade: produto.validade || null,
    fornecedor: produto.fornecedor || null,
    telefone_fornecedor: produto.telefone || null,
  };

  const resultado = id
    ? await supabase.from("produtos").update(dados).eq("id", id)
    : await supabase.from("produtos").insert(dados);

  if (resultado.error) {
    throw new Error(traduzirErroSalvarProduto(resultado.error.code));
  }
}

export async function inativarProduto(id) {
  await alterarStatusProduto(id, false, "inativar");
}

export async function reativarProduto(id) {
  await alterarStatusProduto(id, true, "reativar");
}

export async function reativarProdutos(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Selecione pelo menos um produto para reativar.");
  }

  const { data, error } = await supabase
    .from("produtos")
    .update({ ativo: true })
    .in("id", ids)
    .select("id");

  if (error) {
    if (error.code === "42501" || error.code === "PGRST301") {
      throw new Error(
        "O Supabase negou a operação. Confira a policy de UPDATE da tabela public.produtos para o perfil dono.",
      );
    }

    throw new Error(
      "Não foi possível reativar os produtos selecionados. Verifique sua conexão e tente novamente.",
    );
  }

  if (!data || data.length !== ids.length) {
    throw new Error(
      "Nem todos os produtos foram reativados. Confira as permissões e tente novamente.",
    );
  }
}

async function alterarStatusProduto(id, ativo, acao) {
  const { data, error } = await supabase
    .from("produtos")
    .update({ ativo })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "42501" || error.code === "PGRST301") {
      throw new Error(
        `O Supabase negou a operação. Configure uma policy de UPDATE na tabela public.produtos para permitir ${acao} produtos ao perfil dono.`,
      );
    }

    throw new Error(
      `Não foi possível ${acao} o produto. Verifique sua conexão e tente novamente.`,
    );
  }

  if (!data) {
    throw new Error(
      "O produto não foi encontrado ou você não tem permissão para alterar seu status.",
    );
  }
}
