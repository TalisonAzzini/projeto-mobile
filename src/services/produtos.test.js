jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import { listarProdutos } from "./produtos";

function respostaFalsa(status, corpo) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: { get: () => null },
    text: async () => JSON.stringify(corpo),
  };
}

describe("listarProdutos (com fetch simulado)", () => {
  it("busca os produtos pelo fetch e converte os campos", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      respostaFalsa(200, [
        {
          id: 1,
          nome: "Farinha de trigo",
          codigo_barras: "789",
          quantidade_atual: "2",
          unidade: "kg",
          estoque_minimo: "10",
          validade: null,
          fornecedor: null,
          telefone_fornecedor: null,
          preco_venda: null,
          ativo: true,
        },
      ]),
    );

    const produtos = await listarProdutos();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(String(global.fetch.mock.calls[0][0])).toContain("/rest/v1/produtos");
    expect(produtos[0]).toMatchObject({
      nome: "Farinha de trigo",
      quantidade: 2,
      minimo: 10,
      unidade: "kg",
    });
  });

  it("traduz o erro de permissão devolvido pelo servidor", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(respostaFalsa(403, { code: "42501", message: "negado" }));

    await expect(listarProdutos()).rejects.toThrow(
      "O Supabase negou o acesso ao estoque",
    );
  });
});