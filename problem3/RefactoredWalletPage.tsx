import React, { useMemo, useState, useEffect } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";
}
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}
interface BoxProps {
  className?: string;
  children?: React.ReactNode;
}
interface Props extends BoxProps {}

// Define blockchain priority as a constant outside the component
const BLOCKCHAIN_PRIORITIES: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};
const classes = { row: "w-full" };

// Memoize the priority function to avoid recreating it on every render
const getPriority = (blockchain: WalletBalance["blockchain"]): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? -99;
};

const useWalletBalances = (): WalletBalance[] => {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  useEffect(() => {
    // Sample data based on blockchain priorities from RefactoredWalletPage.tsx
    const sampleBalances: WalletBalance[] = [
      { currency: "OSMO", amount: 0.5, blockchain: "Osmosis" },
      { currency: "ETH", amount: 2.3, blockchain: "Ethereum" },
      { currency: "USDT", amount: 1000, blockchain: "Ethereum" },
      { currency: "USDC", amount: 500, blockchain: "Arbitrum" },
      { currency: "ZIL", amount: 2500, blockchain: "Zilliqa" },
      { currency: "NEO", amount: 2500, blockchain: "Neo" },
    ];
    // Simulate API call
    setTimeout(() => {
      setBalances(sampleBalances);
    }, 100);
  }, []);

  return balances;
};

const usePrices = (): Record<string, number> => {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    // Sample prices for different currencies
    const samplePrices: Record<string, number> = {
      OSMO: 0.1,
      ETH: 3500,
      USDT: 1,
      USDC: 1,
      ZIL: 0.01,
      NEO: 4.5,
    };
    // Simulate API call
    setTimeout(() => {
      setPrices(samplePrices);
    }, 100);
  }, []);
  return prices;
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Memoize sorted and filtered balances
  const sortedBalances = useMemo(() => {
    // First filter out balances with priority <= -99 or amount <= 0
    const filteredBalances = balances.filter((balance: WalletBalance) => {
      const priority = getPriority(balance.blockchain);
      return priority > -99 && balance.amount > 0;
    });
    // Then sort by priority (descending)
    return filteredBalances.sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      return rightPriority - leftPriority;
    });
  }, [balances]); // Removed prices from dependency array as it's not used in this memo

  // Memoize formatted balances to avoid recalculating on every render
  const formattedBalances = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance) => ({
      ...balance,
      formatted: balance.amount.toFixed(),
    }));
  }, [sortedBalances]);

  // Memoize rows to avoid unnecessary re-renders
  const rows = useMemo(() => {
    return formattedBalances.map((balance: FormattedWalletBalance) => {
      const usdValue = prices[balance.currency] * balance.amount;

      return (
        <WalletRow
          className={classes.row}
          key={`${balance.currency}-${balance.blockchain}`} // More stable key
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [formattedBalances, prices]); // Added prices to dependency array

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
