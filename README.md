# Estoque da Padaria

Aplicativo mobile de **controle de estoque** para uma padaria pequena, feito em React Native com Expo.
Trabalho da disciplina de **Dispositivos Móveis**.

O app mostra o que está em falta, registra entradas e saídas de itens (com leitura de código de barras pela câmera) e ajuda o dono a repor o estoque, chamando o fornecedor pelo WhatsApp.

## Funcionalidades

- Login com dois perfis: **dono** e **funcionário**
- Cadastro, edição e listagem de itens, com busca por nome ou código
- Registro de **entradas e saídas**, bloqueando saída maior que o estoque
- **Leitura de código de barras** pela câmera (EAN-13, EAN-8, UPC-A, Code 128 e QR Code) ou digitação manual
- **Alerta de estoque baixo** no Painel (quantidade igual ou abaixo do mínimo)
- **Contato com o fornecedor pelo WhatsApp** a partir dos itens abaixo do mínimo
- Cadastro de funcionários pelo dono

### O que cada perfil vê

|                                       | Dono  | Funcionário  |
| ------------------------------------- | ----- | ------------ |
| Painel, Estoque e Movimentação        | sim   | sim          |
| Abrir um item                         | edita | só visualiza |
| Novo item, Salvar e Inativar          | sim   | não          |
| Pedir no WhatsApp                     | sim   | não          |
| Tela de Usuários (criar funcionários) | sim   | não          |

## Tecnologias

- React Native (JavaScript) com **Expo SDK 58**
- React Navigation (pilha e abas)
- `expo-camera` (leitura de código de barras)
- Firebase Realtime Database, acessado com `fetch` (previsto)
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
Login ──(entrar)──> Abas: Painel | Estoque | Movimentação
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
- [ ] Login com criptografia da senha
- [ ] Banco de dados (Firebase)
- [ ] 2 testes unitários simples com `fetch`

## Status

**Pronto**

- [x] As 7 telas: Login, Painel, Estoque, Item, Movimentação, Scanner e Usuários
- [x] Navegação (login, abas e telas empilhadas) e visibilidade por perfil
- [x] Leitura de código de barras e digitação manual do código
- [x] Formatação de telefone, data e quantidade nos campos

**Pendente (lógica)**

- [ ] Login real e criptografia (hash e salt) das senhas
- [ ] Cadastro de funcionários de verdade
- [ ] Integração com o banco: listar, buscar, salvar e inativar itens
- [ ] Registrar entradas e saídas e gravar o histórico
- [ ] Achar o item a partir do código lido pelo Scanner
- [ ] Botão "Pedir no WhatsApp" (link com a mensagem pronta)
- [ ] Validação ao salvar (data, telefone e quantidades)
- [ ] Testes unitários
- [ ] Trocar os dados de exemplo das telas por dados do banco

## Equipe

- Talison Rodrigues
- Gabriel Luciano
- Igor Henrique
- Leandro Brene
