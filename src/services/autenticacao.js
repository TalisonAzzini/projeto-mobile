import { supabase } from "./supabase";

export function traduzirErroAutenticacao(error) {
  const codigo = String(error?.code || "").toLowerCase();
  const mensagemOriginal =
    typeof error === "string"
      ? error
      : error?.message || error?.error_description || "";
  const mensagem = String(mensagemOriginal).toLowerCase();

  if (
    codigo === "email_not_confirmed" ||
    mensagem.includes("email not confirmed")
  ) {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (
    codigo === "invalid_credentials" ||
    /invalid\s+(login\s+)?credentials?/.test(mensagem) ||
    mensagem.includes("invalid login")
  ) {
    return "E-mail ou senha inválidos. Confira seus dados e tente novamente.";
  }

  if (
    codigo === "over_email_send_rate_limit" ||
    mensagem.includes("rate limit")
  ) {
    return "Muitas tentativas. Aguarde um pouco antes de tentar novamente.";
  }

  if (
    codigo === "email_address_invalid" ||
    mensagem.includes("invalid email")
  ) {
    return "O endereço de e-mail informado é inválido.";
  }

  if (mensagem.includes("network request failed") || codigo === "fetch_error") {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}

export function mapearUsuario(usuario) {
  if (!usuario) {
    return null;
  }

  return {
    nome: usuario.user_metadata?.nome || usuario.email,
    perfil: usuario.app_metadata?.perfil === "dono" ? "dono" : "funcionario",
  };
}

export async function autenticarUsuario(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Não foi possível identificar o usuário autenticado.");
  }

  return mapearUsuario(data.user);
}

export async function reenviarConfirmacaoEmail(email) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
  });

  if (error) {
    throw error;
  }
}
