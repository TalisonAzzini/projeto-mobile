# Estoque da Padaria

Aplicativo mobile de **controle de estoque** para uma padaria pequena, feito em React Native com Expo.
Trabalho da disciplina de **Dispositivos Móveis**.

O app mostra o que está em falta, registra entradas e saídas de itens (com leitura de código de barras pela câmera) e ajuda o dono a preparar pedidos de reposição pelo WhatsApp.

## Funcionalidades

- Login com dois perfis: **dono** e **funcionário**
- Cadastro, edição e listagem de itens, com busca por nome ou código
- Registro de **entradas e saídas**, bloqueando saída maior que o estoque
- **Leitura de código de barras** pela câmera (EAN-13, EAN-8, UPC-A, Code 128 e QR Code) ou digitação manual
- **Alerta de estoque baixo** no Painel (quantidade igual ou abaixo do mínimo)
- **Mensagem de reposição pelo WhatsApp** a partir dos itens abaixo do mínimo
- Cadastro de funcionários pelo dono

### O que cada perfil vê

|                                       | Dono  | Funcionário  |
| ------------------------------------- | ----- | ------------ |
| Painel, Estoque e Movimentação        | sim   | sim          |
| Histórico de movimentações            | sim   | não          |
| Abrir um item                         | edita | só visualiza |
| Novo item, Salvar e Inativar          | sim   | não          |
| Pedir no WhatsApp                     | sim   | não          |
| Tela de Usuários (criar funcionários) | sim   | não          |

## Tecnologias

- React Native (JavaScript) com **Expo SDK 58**
- React Navigation (pilha e abas)
- `expo-camera` (leitura de código de barras)
- Supabase Auth para autenticação por e-mail e senha
- Jest, para os testes unitários (a configurar)

## Como rodar

**Pré-requisitos**

- Node.js (versão LTS) e Git
- Aplicativo **Expo Go** no celular, na versão mais recente da loja (ele precisa ser da mesma SDK do projeto)
- Computador e celular na mesma rede Wi-Fi

**Passos**

```
git clone https://github.com/TalisonAzzini/projeto-mobile.git
cd projeto-mobile
npm install
npx expo start
```

### Configuração do login

O cliente Supabase está configurado em `src/services/supabase.js` e o SDK
`@supabase/supabase-js` já faz parte das dependências do aplicativo. Crie a conta
do dono no Supabase Auth e defina `app_metadata.perfil` como `dono`. O cadastro
de funcionários é realizado pela Edge Function `gerenciar-usuarios`, que cria
a conta no Auth e o perfil correspondente em `public.usuarios`. A tela lista
funcionários diretamente dessa tabela usando a sessão autenticada e RLS.

Para disponibilizar o gerenciamento de funcionários, implante a função no
projeto Supabase:

```
supabase login
supabase link --project-ref juxqoryqcvblsyryvzhr
supabase functions deploy gerenciar-usuarios
```

A função exige uma sessão autenticada de dono e usa a chave administrativa
somente no servidor Supabase; nunca configure a `service_role` no aplicativo.
O acesso de leitura à tabela deve ser restrito ao dono autenticado; as policies
de leitura do próprio perfil e do dono já existentes cobrem esse acesso.
Habilite **Confirm email** nas configurações de autenticação do Supabase para
que o cadastro envie a confirmação ao funcionário. Se o login informar que o
e-mail ainda não foi confirmado, a tela permite reenviar a mensagem.
O cadastro bloqueia domínios reservados para teste ou exemplo, como `test.com`,
`teste.com` e `example.com`, mas aceita provedores comuns como Gmail.

### Configuração do estoque

A tela Estoque lê os produtos ativos da tabela `public.produtos`, usando a
sessão autenticada. Ela mapeia `codigo_barras`, `quantidade_atual`,
`estoque_minimo` e `telefone_fornecedor` para os nomes usados pela interface.
O botão **Ver produtos inativos** alterna a lista para produtos com `ativo =
false`; toque no produto e use **Reativar item** na tela de detalhes para
defini-lo novamente como ativo. Na lista de inativos, o dono também pode
selecionar vários produtos e reativá-los em lote pelo botão ao lado do filtro.
**Ver produtos ativos** retorna ao estoque atual.
Configure uma policy de leitura para usuários autenticados que possam consultar
o estoque; a tela mostra em português quando a tabela, as colunas ou a
permissão de leitura estiverem ausentes.

A tabela `public.produtos` e suas policies devem ser criadas e configuradas
diretamente no Supabase. A tela de produto permite cadastrar e editar, mas as
policies de `INSERT` e `UPDATE` precisam autorizar o perfil dono. O botão
Inativar altera `ativo` para `false` (não exclui o produto), portanto a policy
de `UPDATE` também deve permitir ao dono fazer essa alteração.

No Painel, os produtos abaixo do mínimo são carregados do banco. O botão
**Pedir no WhatsApp**, disponível para o dono, abre o WhatsApp instalado no
telefone sem direcionar para nenhum contato. O usuário escolhe a conversa no
próprio aplicativo; o telefone do fornecedor cadastrado não é utilizado.

### Configuração de movimentações

A tela Movimentação lista os produtos ativos, permite selecionar um produto ou
localizá-lo pelo código de barras e registra entradas e saídas. O dono também
tem a aba **Histórico**, que consulta os eventos da tabela
`public.movimentacoes`. O registro e a atualização do saldo são feitos pela função atômica
`public.registrar_movimentacao`, para que o histórico e o estoque não fiquem
divergentes. O cliente Supabase já é uma dependência do aplicativo; não é
necessário instalar outro pacote.

## Estrutura de pastas

```
projeto-mobile/
├── App.js                  Ponto de entrada ao app
├── index.js
├── app.json
├── package.json
├── assets/
└── src/
    ├── components/         Peças reutilizáveis
    ├── contexts/           UsuarioContext
    ├── navigation/         Navegacao
    ├── screens/            Uma tela por arquivo
    ├── services/           Acesso ao banco e login
    └── utils/              Formatadores e validações
```

### Telas e navegação

```
Login ──(entrar)──> Abas: Painel | Estoque | Movimentação | Histórico (dono)
                    Abrem por cima das abas:
                      Item      (a partir do Estoque; "Novo item" só para o dono)
                      Scanner   (a partir da Movimentação)
                      Usuários  (a partir do Painel; só para o dono)
```

## Regras de negócio

- O código de barras é único por item. Itens sem código recebem um código interno.
- A quantidade nunca fica negativa. Saída maior que o estoque é bloqueada.
- Há alerta quando a quantidade é **igual ou menor** que o estoque mínimo.
- Itens são **inativados**, não excluídos, para manter o histórico.
- Quantidades podem ter decimais para kg e litro, e são inteiras para unidade.
- Toda movimentação gera um registro (item, tipo, quantidade, usuário, data e hora) que não pode ser editado nem apagado. Um erro se corrige com uma movimentação contrária.
- Só o dono cria contas de funcionário. Senha com no mínimo 6 caracteres.

## Requisitos da disciplina

- [x] Pelo menos 3 telas (são 7)
- [x] Uso de `FlatList` (Painel, Estoque e Usuários)
- [x] Recurso do celular: **câmera** (Scanner)
- [x] Repositório no GitHub
- [x] Login com criptografia da senha
- [x] Banco de dados (Supabase)
- [x] 2 testes unitários simples com `fetch`

## Status

**Pronto**

- [x] As telas: Login, Painel, Estoque, Item, Movimentação, Histórico, Scanner e Usuários
- [x] Navegação (login, abas e telas empilhadas) e visibilidade por perfil
- [x] Leitura de código de barras e digitação manual do código
- [x] Formatação de telefone, data e quantidade nos campos

**Pendente (lógica)**

- [x] Login real com Supabase Auth (hash e salt das senhas são gerenciados pelo Supabase)
- [x] Cadastro e listagem de funcionários pelo Supabase (Edge Function; requer implantação)
- [x] Integração com o banco: listar, buscar, salvar e inativar itens
- [x] Registrar entradas e saídas e gravar o histórico (requer configurar a função no Supabase)
- [x] Achar o item a partir do código lido pelo Scanner na tela Movimentação
- [x] Botão "Pedir no WhatsApp" (abre o WhatsApp sem direcionar para um contato específico)
- [x] Validação ao salvar (data, telefone e quantidades)
- [x] Testes unitários
- [x] Trocar os dados de exemplo das telas por dados do banco

## Equipe

- Talison Rodrigues
- Gabriel Luciano
- Igor Henrique
- Leandro Brene
