// constants/quizBank.ts

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizVariant {
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface QuizEntry {
  beginner: QuizVariant;
  advanced: QuizVariant;
}

export const QUIZ_BANK: Record<string, QuizEntry> = {
  rsi_overbought: {
    beginner: {
      question: "The momentum speed index is above 70. What does this usually suggest?",
      options: [
        { id: "buy", label: "The stock is cheap and a great deal right now." },
        { id: "sell", label: "Buyers pushed the price up very fast, it might take a breather soon." },
        { id: "neutral", label: "Trading has been halted on this stock." }
      ],
      correctOptionId: "sell",
      explanation: "A high speed index (RSI > 70) means buying momentum is strong, but the asset may be 'overbought' and due for a consolidation or minor pullback."
    },
    advanced: {
      question: "RSI is currently above 70. What does this technical condition typically indicate?",
      options: [
        { id: "overbought", label: "Overbought conditions, potential momentum exhaustion/pullback." },
        { id: "oversold", label: "Oversold conditions, signal of an imminent upward reversal." },
        { id: "continuation", label: "Guaranteed continuation of the current vertical uptrend." }
      ],
      correctOptionId: "overbought",
      explanation: "An RSI above 70 is the traditional threshold for overbought status, indicating that the upward price movement has been rapid and the risk of a mean-reverting pullback has increased."
    }
  },
  rsi_oversold: {
    beginner: {
      question: "The momentum speed index is below 30. What does this usually mean?",
      options: [
        { id: "oversold", label: "Sellers pushed the price down very fast, and it might find support or bounce." },
        { id: "overbought", label: "The stock is at an all-time high and extremely expensive." },
        { id: "none", label: "The trading indicators are broken." }
      ],
      correctOptionId: "oversold",
      explanation: "A low speed index (RSI < 30) suggests selling has been intense ('oversold'), so the downward trend might decelerate or experience a relief bounce soon."
    },
    advanced: {
      question: "RSI is currently below 30. How is this technical reading interpreted?",
      options: [
        { id: "overbought", label: "Overbought levels, indicating high risk of a deep correction." },
        { id: "oversold", label: "Oversold levels, suggesting a potential support test or relief bounce." },
        { id: "neutral", label: "A signal that volume has completely dried up." }
      ],
      correctOptionId: "oversold",
      explanation: "An RSI below 30 indicates oversold conditions, meaning the velocity of recent downward price changes has been exceptionally high, which often precedes a technical bounce or stabilization."
    }
  },
  macd_bullish: {
    beginner: {
      question: "The trend speed tracker just crossed upwards (positive crossover). What does this mean?",
      options: [
        { id: "bullish", label: "Upward momentum is building, suggesting a possible positive shift." },
        { id: "bearish", label: "Downward momentum is taking over, warning of a drop." },
        { id: "flat", label: "The trend is completely flat and has no speed." }
      ],
      correctOptionId: "bullish",
      explanation: "An upward crossover indicates that the short-term price trend is speeding up faster than the long-term trend, pointing to building upward momentum."
    },
    advanced: {
      question: "A bullish MACD crossover has occurred. What is the technical implication?",
      options: [
        { id: "bullish", label: "Short-term momentum has crossed above long-term momentum, signaling potential upside." },
        { id: "bearish", label: "A warning of trend deceleration and immediate short setup." },
        { id: "range", label: "Price is locked in a tight horizontal consolidation range." }
      ],
      correctOptionId: "bullish",
      explanation: "A bullish MACD crossover happens when the MACD line crosses above the Signal line, indicating that the shorter-term exponential moving average is turning up relative to the longer-term average."
    }
  },
  macd_bearish: {
    beginner: {
      question: "The trend speed tracker just crossed downwards (negative crossover). What does this mean?",
      options: [
        { id: "bearish", label: "Downward momentum is building, suggesting a possible negative shift." },
        { id: "bullish", label: "Buyers are stepping in with massive force." },
        { id: "breakout", label: "The stock is guaranteed to double in price." }
      ],
      correctOptionId: "bearish",
      explanation: "A downward crossover indicates that the short-term trend is losing strength relative to the long-term average, pointing to building downward pressure."
    },
    advanced: {
      question: "A bearish MACD crossover has occurred. What is the technical implication?",
      options: [
        { id: "bearish", label: "Short-term momentum has crossed below long-term momentum, signaling potential downside." },
        { id: "bullish", label: "An indication of major support level breakout." },
        { id: "sideways", label: "Price is highly likely to enter a low-volatility phase." }
      ],
      correctOptionId: "bearish",
      explanation: "A bearish MACD crossover occurs when the MACD line crosses below the Signal line, indicating that downward momentum is strengthening and that a downward price swing may follow."
    }
  },
  ma50_above: {
    beginner: {
      question: "The stock price is trading above its average price over the last 50 days. What does this mean?",
      options: [
        { id: "above", label: "The stock is in a general upward trend relative to its medium-term average." },
        { id: "below", label: "The stock is in a severe downward trend." },
        { id: "zero", label: "The 50-day average has dropped to zero." }
      ],
      correctOptionId: "above",
      explanation: "When price trades above its 50-day average, it suggests that the medium-term market bias is positive and the buyers are currently in control."
    },
    advanced: {
      question: "The current spot price is above the 50-day Simple Moving Average (SMA). What does this represent?",
      options: [
        { id: "support", label: "The asset is trading in a medium-term uptrend, with the 50-day SMA acting as potential support." },
        { id: "resistance", label: "The asset is facing resistance at the 50-day SMA, indicating a bearish block." },
        { id: "range", label: "A neutral signal of low participation and range-bound trading." }
      ],
      correctOptionId: "support",
      explanation: "Trading above the 50-day SMA signifies a medium-term uptrend. The moving average line itself often acts as a psychological dynamic support level during subsequent pullbacks."
    }
  },
  ma50_below: {
    beginner: {
      question: "The stock price is trading below its average price over the last 50 days. What does this mean?",
      options: [
        { id: "below", label: "The stock is in a general downward trend relative to its medium-term average." },
        { id: "above", label: "The stock is experiencing an explosive upward breakout." },
        { id: "stable", label: "The price is completely fixed and won't move." }
      ],
      correctOptionId: "below",
      explanation: "When price trades below its 50-day average, it indicates that the medium-term market bias is negative, and sellers are dominating price action."
    },
    advanced: {
      question: "The current spot price is below the 50-day Simple Moving Average (SMA). What does this signify?",
      options: [
        { id: "downtrend", label: "The asset is in a medium-term downtrend, and the SMA may serve as dynamic overhead resistance." },
        { id: "uptrend", label: "A bullish confirmation of dynamic support holding." },
        { id: "high_vol", label: "High institutional accumulation and volume contraction." }
      ],
      correctOptionId: "downtrend",
      explanation: "A spot price below the 50-day SMA indicates that the medium-term trend is bearish. In pullbacks, the 50-day SMA line is frequently watched as dynamic overhead resistance."
    }
  },
  volume_spike: {
    beginner: {
      question: "The trading volume is much higher than its 20-day average. What does this indicate?",
      options: [
        { id: "high_activity", label: "A spike in trading activity, indicating high interest and strong trend validation." },
        { id: "low_activity", label: "Very few people are buying or selling the stock today." },
        { id: "no_impact", label: "Trading activity has absolutely no impact on price direction." }
      ],
      correctOptionId: "high_activity",
      explanation: "A sudden rise in volume means more shares are changing hands. This indicates that major market participants are active, validating the momentum of the price movement."
    },
    advanced: {
      question: "Volume is significantly above the 20-day moving average. How is this interpreted?",
      options: [
        { id: "interest", label: "Increased institutional participation, validating the strength of the current breakout or breakdown." },
        { id: "low_interest", label: "Low institutional liquidity and divergence in retail participation." },
        { id: "reversal", label: "Immediate exhaust-gap signal indicating a mandatory trend reversal." }
      ],
      correctOptionId: "interest",
      explanation: "A volume spike above the 20-day average represents strong trend confirmation. High volume indicates conviction behind the price move, making breakouts or breakdowns more reliable."
    }
  }
};
