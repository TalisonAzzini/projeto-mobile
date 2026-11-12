jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import {
  buscarProdutoPorCodigo,
  CODIGO_ERRO_PRODUTO_NAO_CADASTRADO,
} from "./movimentacoes";

function respostaFalsa(corpo) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: { get: () => null },
    text: async () => JSON.stringify(corpo),
  };
}

describe("buscarProdutoPorCodigo", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("identifica um código que não existe entre produtos ativos ou inativos", async () => {
    global.fetch
      .mockResolvedValueOnce(respostaFalsa([]))
      .mockResolvedValueOnce(respostaFalsa([]));

    await expect(buscarProdutoPorCodigo("789")).rejects.toMatchObject({
      code: CODIGO_ERRO_PRODUTO_NAO_CADASTRADO,
    });
  });

  it("não classifica um produto inativo como não cadastrado", async () => {
    global.fetch
      .mockResolvedValueOnce(respostaFalsa([]))
      .mockResolvedValueOnce(
        respostaFalsa([
          {
            id: 1,
            nome: "Farinha de trigo",
            codigo_barras: "789",
            quantidade_atual: "2",
            unidade: "kg",
            estoque_minimo: "1",
            validade: null,
            fornecedor: null,
            telefone_fornecedor: null,
            preco_venda: null,
            ativo: false,
          },
        ]),
      );

    await expect(buscarProdutoPorCodigo("789")).rejects.toThrow(
      "O produto está inativo",
    );
  });
});
