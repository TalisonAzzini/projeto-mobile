import { supabase } from "./supabase";

const MENSAGENS_ERRO = {
  NAO_AUTENTICADO: "Sua sessão expirou. Entre novamente para continuar.",
  SEM_PERMISSAO: "Somente o dono pode gerenciar os funcionários.",
  NOME_OBRIGATORIO: "Informe o nome do funcionário.",
  EMAIL_INVALIDO: "Informe um endereço de e-mail válido.",
  EMAIL_DOMINIO_GENERICO:
    "Use um e-mail de domínio real. Endereços como usuario@teste.com não são aceitos.",
  EMAIL_JA_CADASTRADO: "Já existe uma conta cadastrada com esse e-mail.",
  SENHA_CURTA: "A senha precisa ter pelo menos 6 caracteres.",
  ACAO_INVALIDA: "A operação solicitada não é válida.",
  CONFIGURACAO_AUSENTE: "O serviço de usuários não está configurado no Supabase.",
  ERRO_LISTAR: "Não foi possível carregar os funcionários. Tente novamente.",
  ERRO_CADASTRAR: "Não foi possível cadastrar o funcionário. Tente novamente.",
  ERRO_SINCRONIZAR_USUARIO:
    "Não foi possível adicionar o funcionário à lista de usuários. O cadastro foi revertido; tente novamente.",
  ERRO_REVERTER_CADASTRO:
    "A conta foi criada, mas houve um erro ao registrar o funcionário na lista. Procure o administrador antes de tentar novamente.",
  FUNCTIONS_FETCH_ERROR:
    "Não foi possível conectar ao serviço de usuários. Verifique sua conexão.",
};

function traduzirErroUsuarios(codigo) {
  const codigoNormalizado = String(codigo || "")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase();

  return (
    MENSAGENS_ERRO[codigoNormalizado] ||
    "Não foi possível concluir a operação. Tente novamente."
  );
}

function traduzirErroConsultaUsuarios(codigo) {
  if (codigo === "42501" || codigo === "PGRST301") {
    return "O Supabase negou a leitura dos funcionários. Confira a policy e as permissões de leitura da tabela public.usuarios.";
  }

  if (codigo === "PGRST204" || codigo === "42703") {
    return "A tabela public.usuarios não contém as colunas esperadas (id, nome, email e perfil).";
  }

  return "Não foi possível carregar os funcionários do banco de dados. Tente novamente.";
}

const DOMINIOS_GENERICOS = [
  "test.com",
  "teste.com",
  "example.com",
  "example.net",
  "example.org",
];

export function emailDominioGenerico(email) {
  const normalizado = String(email || "").trim().toLowerCase();
  const dominio = normalizado.split("@")[1];
  return (
    DOMINIOS_GENERICOS.some(
      (dominioTeste) =>
        dominio === dominioTeste || dominio.endsWith(`.${dominioTeste}`),
    ) || /\.(test|teste|example|invalid|localhost|local)$/.test(dominio)
  );
}

export function emailFuncionarioValido(email) {
  const normalizado = String(email || "").trim().toLowerCase();
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado) &&
    !emailDominioGenerico(normalizado)
  );
}

async function chamarServicoUsuarios(body, codigoErroResposta) {
  let resultado;
  try {
    resultado = await supabase.functions.invoke("gerenciar-usuarios", {
      body,
    });
  } catch (error) {
    throw new Error(traduzirErroUsuarios(error?.name));
  }

  const { data, error } = resultado;

  if (error) {
    let codigo = error.name;

    if (error.context && typeof error.context.json === "function") {
      try {
        const resposta = await error.context.clone().json();
        codigo = resposta.code || codigo;
      } catch {
        codigo = error.name;
      }
    }

    throw new Error(traduzirErroUsuarios(codigo));
  }

  if (!data) {
    throw new Error(traduzirErroUsuarios(codigoErroResposta));
  }

  if (data.code) {
    throw new Error(traduzirErroUsuarios(data.code));
  }

  return data;
}

export async function listarFuncionarios() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nome, email, perfil")
    .eq("perfil", "funcionario")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(traduzirErroConsultaUsuarios(error.code));
  }

  if (!data) {
    throw new Error(traduzirErroConsultaUsuarios());
  }

  return data.map((usuario) => ({
    id: usuario.id,
    nome: usuario.nome || usuario.email || "Funcionário",
    email: usuario.email || "",
  }));
}

export async function cadastrarFuncionario({ nome, email, senha }) {
  return chamarServicoUsuarios(
    {
      acao: "cadastrar",
      nome,
      email,
      senha,
    },
    "ERRO_CADASTRAR",
  );
}
