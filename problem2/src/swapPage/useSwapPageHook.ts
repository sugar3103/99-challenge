import { useEffect, useState } from "react";
import type { IToken } from "./swapPage.type";

export default function useSwapPageHook() {
  const [tokensList, setTokensList] = useState<IToken[]>([]);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [error, setError] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate exchange rate
  const calculateExchange = (
    amount: number,
    from: string,
    to: string
  ): number => {
    if (!amount || !from || !to) return 0;

    const fromTokenData = tokensList.find((t) => t.currency === from);
    const toTokenData = tokensList.find((t) => t.currency === to);

    if (!fromTokenData || !toTokenData) return 0;

    const rate = fromTokenData.price / toTokenData.price;
    return amount * rate;
  };

  // Handle from amount change
  const handleFromAmountChange = (value: number) => {
    setFromAmount(value);
    setError("");

    if (value && value > 0) {
      const calculated = calculateExchange(value, fromToken, toToken);
      setToAmount(calculated);
    } else {
      setToAmount(0);
    }
  };

  // Swap tokens
  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      const tempToken = fromToken;
      const tempAmount = fromAmount;

      setFromToken(toToken);
      setToToken(tempToken);
      setFromAmount(toAmount);
      setToAmount(tempAmount);
      setIsSwapping(false);
    }, 300);
  };

  // Get token icon URL
  const getTokenIcon = (currency: string): string => {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency}.svg`;
  };

  // Handle swap execution
  const handleExecuteSwap = () => {
    if (!fromAmount || fromAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (fromToken === toToken) {
      setError("Cannot swap the same currency");
      return;
    }

    setError("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSetFromToken = (token: string) => {
    setFromToken(token);
    if (fromAmount) {
      const calculated = calculateExchange(fromAmount, token, toToken);
      setToAmount(calculated);
    }
  };

  const handleSetToToken = (token: string) => {
    setToToken(token);
    if (fromAmount) {
      const calculated = calculateExchange(fromAmount, fromToken, token);
      setToAmount(calculated);
    }
  };

  // Fetch and process token prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          "https://interview.switcheo.com/prices.json"
        );
        const data = await response.json();

        // Get unique tokens with their latest prices
        const tokenMap = new Map<string, IToken>();
        data.forEach(
          (item: { currency: string; price: number; date: string }) => {
            if (item.price && item.price > 0) {
              const existing = tokenMap.get(item.currency);
              if (!existing || new Date(item.date) > new Date(existing.date)) {
                tokenMap.set(item.currency, {
                  currency: item.currency,
                  price: item.price,
                  date: item.date,
                });
              }
            }
          }
        );

        const sortedTokensList = Array.from(tokenMap.values()).sort((a, b) =>
          a.currency.localeCompare(b.currency)
        );
        setTokensList(sortedTokensList);

        // Set default tokens
        if (sortedTokensList.length > 0) {
          setFromToken(
            sortedTokensList.find((t) => t.currency === "ETH")?.currency ||
              sortedTokensList[0].currency
          );
          setToToken(
            sortedTokensList.find((t) => t.currency === "USDC")?.currency ||
              sortedTokensList[1]?.currency ||
              sortedTokensList[0].currency
          );
        }

        setTokenLoading(false);
      } catch {
        setError("Failed to load token prices");
        setTokenLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return {
    tokensList,
    tokenLoading,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    isSwapping,
    showSuccess,
    error,
    handleSetFromToken,
    handleSetToToken,
    handleFromAmountChange,
    handleSwap,
    getTokenIcon,
    handleExecuteSwap,
  };
}
