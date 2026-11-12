
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";

export interface ItemCarrinho {
  produtoId: number;
  lojaId: number;
  nome: string;
  preco: number;
  imagem: string | null;
  quantidade: number;
  estoqueDisponivel: number | null;
}

interface CarrinhoContextData {
  itens: ItemCarrinho[];
  lojaId: number | null;
  totalItens: number;
  subtotal: number;
  carregado: boolean;
  adicionar: (item: ItemCarrinho) => void;
  alterarQuantidade: (produtoId: number, quantidade: number) => void;
  remover: (produtoId: number) => void;
  limpar: () => void;
}

const CarrinhoContext = createContext<CarrinhoContextData>(
  {} as CarrinhoContextData
);

const CHAVE_CARRINHO = "allystore_carrinho";

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await SecureStore.getItemAsync(CHAVE_CARRINHO);

        if (dados) {
          setItens(JSON.parse(dados));
        }
      } catch {
        setItens([]);
      } finally {
        setCarregado(true);
      }
    }

    carregar();
  }, []);

  useEffect(() => {
    if (!carregado) return;

    SecureStore.setItemAsync(
      CHAVE_CARRINHO,
      JSON.stringify(itens)
    ).catch(console.error);
  }, [itens, carregado]);

  const adicionar = useCallback((item: ItemCarrinho) => {
    setItens((atuais) => {
      // Não misturar produtos de lojas diferentes no mesmo pedido.
      if (atuais.length > 0 && atuais[0].lojaId !== item.lojaId) {
        return atuais;
      }

      const existente = atuais.find(
        (i) => i.produtoId === item.produtoId
      );

      if (existente) {
        return atuais.map((i) => {
          if (i.produtoId !== item.produtoId) return i;

          const novaQuantidade = i.quantidade + item.quantidade;

          return {
            ...i,
            quantidade:
              i.estoqueDisponivel !== null
                ? Math.min(novaQuantidade, i.estoqueDisponivel)
                : novaQuantidade,
          };
        });
      }

      return [...atuais, item];
    });
  }, []);

  const alterarQuantidade = useCallback(
    (produtoId: number, quantidade: number) => {
      setItens((atuais) =>
        atuais
          .map((item) => {
            if (item.produtoId !== produtoId) return item;

            const limite =
              item.estoqueDisponivel !== null
                ? item.estoqueDisponivel
                : Infinity;

            return {
              ...item,
              quantidade: Math.min(quantidade, limite),
            };
          })
          .filter((item) => item.quantidade > 0)
      );
    },
    []
  );

  const remover = useCallback((produtoId: number) => {
    setItens((atuais) =>
      atuais.filter((item) => item.produtoId !== produtoId)
    );
  }, []);

  const limpar = useCallback(() => {
    setItens([]);
  }, []);

  const lojaId = itens.length > 0 ? itens[0].lojaId : null;

  const valor = useMemo(
    () => ({
      itens,
      lojaId,
      totalItens: itens.reduce((total, item) => total + item.quantidade, 0),
      subtotal: itens.reduce(
        (total, item) => total + item.preco * item.quantidade,
        0
      ),
      carregado,
      adicionar,
      alterarQuantidade,
      remover,
      limpar,
    }),
    [
      itens,
      lojaId,
      carregado,
      adicionar,
      alterarQuantidade,
      remover,
      limpar,
    ]
  );

  return (
    <CarrinhoContext.Provider value={valor}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
