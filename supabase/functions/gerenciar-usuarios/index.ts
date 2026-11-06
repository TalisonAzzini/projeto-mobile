import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cabecalhosCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function responder(status: number, corpo: Record<string, unknown>) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: {
      ...cabecalhosCors,
      "Content-Type": "application/json",
    },
  });
}

function ehObjeto(corpo: unknown): corpo is Record<string, unknown> {
  return typeof corpo === "object" && corpo !== null && !Array.isArray(corpo);
}

function emailDominioGenerico(email: string): boolean {
  const dominio = email.toLowerCase().split("@")[1] || "";
  const dominiosGenericos = [
    "test.com",
    "teste.com",
    "example.com",
    "example.net",
    "example.org",
  ];

  return (
    dominiosGenericos.some(
      (dominioGenerico) =>
        dominio === dominioGenerico || dominio.endsWith(`.${dominioGenerico}`),
    ) || /\.(test|teste|example|invalid|localhost|local)$/.test(dominio)
  );
}

Deno.serve(async (requisicao) => {
  if (requisicao.method === "OPTIONS") {
    return new Response("ok", { headers: cabecalhosCors });
  }

  if (requisicao.method !== "POST") {
    return responder(405, { code: "ACAO_INVALIDA" });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const chaveAnonima = Deno.env.get("SUPABASE_ANON_KEY");
  const chaveServico = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !chaveAnonima || !chaveServico) {
    return responder(500, { code: "CONFIGURACAO_AUSENTE" });
  }

  const cabecalhoAutorizacao = requisicao.headers.get("Authorization");
  if (!cabecalhoAutorizacao?.startsWith("Bearer ")) {
    return responder(401, { code: "NAO_AUTENTICADO" });
  }

  const clienteAutenticado = createClient(url, chaveAnonima, {
    global: { headers: { Authorization: cabecalhoAutorizacao } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: erroAutenticacao,
  } = await clienteAutenticado.auth.getUser();

  if (erroAutenticacao || !user) {
    return responder(401, { code: "NAO_AUTENTICADO" });
  }

  if (user.app_metadata?.perfil !== "dono") {
    return responder(403, { code: "SEM_PERMISSAO" });
  }

  let corpoRecebido: unknown;
  try {
    corpoRecebido = await requisicao.json();
  } catch {
    return responder(400, { code: "ACAO_INVALIDA" });
  }

  if (!ehObjeto(corpoRecebido)) {
    return responder(400, { code: "ACAO_INVALIDA" });
  }

  const clienteAdmin = createClient(url, chaveServico, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (corpoRecebido.acao !== "cadastrar") {
    return responder(400, { code: "ACAO_INVALIDA" });
  }

  const nome =
    typeof corpoRecebido.nome === "string" ? corpoRecebido.nome.trim() : "";
  const email =
    typeof corpoRecebido.email === "string" ? corpoRecebido.email.trim() : "";
  const senha =
    typeof corpoRecebido.senha === "string" ? corpoRecebido.senha : "";

  if (!nome) {
    return responder(400, { code: "NOME_OBRIGATORIO" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return responder(400, { code: "EMAIL_INVALIDO" });
  }

  if (emailDominioGenerico(email)) {
    return responder(400, { code: "EMAIL_DOMINIO_GENERICO" });
  }

  if (senha.length < 6) {
    return responder(400, { code: "SENHA_CURTA" });
  }

  const { data, error } = await clienteAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: false,
    user_metadata: { nome },
    app_metadata: { perfil: "funcionario" },
  });

  if (error) {
    if (
      error.code === "user_already_exists" ||
      error.code === "email_exists"
    ) {
      return responder(409, { code: "EMAIL_JA_CADASTRADO" });
    }

    return responder(500, { code: "ERRO_CADASTRAR" });
  }

  const { error: erroSalvarPerfil } = await clienteAdmin
    .from("usuarios")
    .insert({
      id: data.user.id,
      nome,
      cargo: "funcionario",
      ativo: true,
      email,
      perfil: "funcionario",
    });

  if (erroSalvarPerfil) {
    const { error: erroReverterCadastro } =
      await clienteAdmin.auth.admin.deleteUser(data.user.id);

    return responder(500, {
      code: erroReverterCadastro
        ? "ERRO_REVERTER_CADASTRO"
        : "ERRO_SINCRONIZAR_USUARIO",
    });
  }

  const { error: erroEnvioConfirmacao } =
    await clienteAutenticado.auth.resend({
      type: "signup",
      email,
    });

  return responder(201, {
    funcionario: {
      id: data.user.id,
      nome: data.user.user_metadata?.nome || email,
      email,
    },
    emailConfirmacaoEnviado: !erroEnvioConfirmacao,
  });
});
