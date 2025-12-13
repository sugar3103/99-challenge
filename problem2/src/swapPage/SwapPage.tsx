import { FiArrowDown, FiTrendingUp, FiAlertCircle } from "react-icons/fi";
import useSwapPageHook from "./useSwapPageHook";

const CurrencySwapPage = () => {
  const {
    tokensList,
    tokenLoading,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    isSwapping,
    showSuccess,
    error,
    handleFromAmountChange,
    handleSwap,
    getTokenIcon,
    handleExecuteSwap,
    handleSetFromToken,
    handleSetToToken,
  } = useSwapPageHook();

  // Get exchange rate display
  const getExchangeRate = () => {
    const fromTokenData = tokensList.find((t) => t.currency === fromToken);
    const toTokenData = tokensList.find((t) => t.currency === toToken);

    if (!fromTokenData || !toTokenData) return null;

    const rate = fromTokenData.price / toTokenData.price;
    return `1 ${fromToken} = ${rate.toFixed(4)} ${toToken}`;
  };

  if (tokenLoading) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-500 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <span className="text-lg font-medium">Loading tokens...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-lg max-w-svw relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-purple-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <FiTrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Currency Swap
          </h1>
          <p className="text-gray-300 text-lg">
            Exchange tokens at the best rates
          </p>
        </div>

        {/* Swap Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 space-y-6 border border-white/20">
          {/* From Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">
              From
            </label>
            <div className="bg-linear-to-br from-white/20 to-white/10 rounded-2xl p-6 space-y-5 border-2 border-white/30">
              <div className="flex gap-3">
                <select
                  value={fromToken}
                  onChange={(e) => handleSetFromToken(e.target.value)}
                  className="flex-1 bg-white/80 rounded-xl px-4 py-3 font-medium text-gray-800 border border-white/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                  aria-label="Select source token"
                >
                  {tokensList.map((token) => (
                    <option key={token.currency} value={token.currency}>
                      {token.currency}
                    </option>
                  ))}
                </select>
                <div className="w-14 h-14 bg-white/80 rounded-xl flex items-center justify-center border border-white/30 overflow-hidden shadow-md">
                  <img
                    src={getTokenIcon(fromToken)}
                    alt={fromToken}
                    className="w-10 h-10"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%238b5cf6"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={16}
                  value={fromAmount}
                  onChange={(e) =>
                    handleFromAmountChange(parseFloat(e.target.value || "0"))
                  }
                  placeholder="Amount"
                  className="w-full bg-white/90 text-xl font-bold text-gray-800 border-2 border-purple-400 rounded-xl px-4 py-2 focus:outline-none focus:ring-4 focus:ring-purple-400/50 focus:border-purple-600 transition-all placeholder-gray-500"
                  aria-label="Amount to swap from"
                />
              </div>
              <div className="text-sm text-gray-300 -mt-2">
                You have: {fromAmount.toLocaleString()} {fromToken}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleSwap}
              className={`bg-linear-to-r from-purple-600 to-indigo-600 rounded-full p-4 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group border-4 border-white/10 ${
                isSwapping ? "rotate-180" : ""
              }`}
              aria-label="Swap tokens"
            >
              <FiArrowDown className="w-6 h-6 text-white group-hover:text-white" />
            </button>
          </div>

          {/* To Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">
              To
            </label>
            <div className="bg-linear-to-br from-indigo-20/20 to-purple-20/10 rounded-2xl p-6 space-y-5 border-2 border-white/30">
              <div className="flex gap-3">
                <select
                  value={toToken}
                  onChange={(e) => handleSetToToken(e.target.value)}
                  className="flex-1 bg-white/80 rounded-xl px-4 py-3 font-medium text-gray-800 border border-white/30 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                  aria-label="Select destination token"
                >
                  {tokensList.map((token) => (
                    <option key={token.currency} value={token.currency}>
                      {token.currency}
                    </option>
                  ))}
                </select>
                <div className="w-14 h-14 bg-white/80 rounded-xl flex items-center justify-center border border-white/30 overflow-hidden shadow-md">
                  <img
                    src={getTokenIcon(toToken)}
                    alt={toToken}
                    className="w-10 h-10"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>
              <div className="relative bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-400/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-white text-center">
                  {toAmount.toLocaleString() || "0.0000"} {toToken}
                </div>
                <div className="text-xs text-indigo-200 text-center mt-1">
                  You will receive
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="bg-linear-to-r from-purple-20/20 to-indigo-20/20 rounded-xl p-4 flex items-center gap-3 border border-white/10">
            <FiTrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">
              {getExchangeRate()}
            </span>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
              <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-green-900"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm text-green-300">
                Swap executed: {fromAmount} {fromToken} → {toAmount} {toToken}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleExecuteSwap}
            className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          >
            Swap Tokens
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>Powered by Switcheo Network</p>
        </div>
      </div>
    </div>
  );
};

export default CurrencySwapPage;
