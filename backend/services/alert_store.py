from typing import Dict, Set, List, Optional
import threading

# Global registries (in-memory)
# token -> set of symbols
_watches_by_token: Dict[str, Set[str]] = {}
# Thread-safe lock for watches
_watch_lock = threading.Lock()

# Track last-known state: symbol -> {"signal": str, "rsi": float, "volume": str}
_last_known_state: Dict[str, dict] = {}
_state_lock = threading.Lock()

# Track recent alerts for UI: push_token -> List[AlertEvent]
_recent_alerts_by_token: Dict[str, list] = {}
_alerts_lock = threading.Lock()

def register_watch(push_token: str, symbols: List[str]) -> None:
    """Replaces the full symbol list for that token."""
    with _watch_lock:
        if symbols:
            _watches_by_token[push_token] = set(sym.upper() for sym in symbols)
        else:
            _watches_by_token.pop(push_token, None)

def get_all_watched_symbols() -> Set[str]:
    """Dedupes across all registered tokens."""
    with _watch_lock:
        all_symbols = set()
        for symbols in _watches_by_token.values():
            all_symbols.update(symbols)
        return all_symbols

def get_tokens_watching(symbol: str) -> List[str]:
    """Finds which tokens care about this symbol."""
    sym = symbol.upper()
    tokens = []
    with _watch_lock:
        for token, symbols in _watches_by_token.items():
            if sym in symbols:
                tokens.append(token)
    return tokens

def get_last_known_state(symbol: str) -> Optional[dict]:
    with _state_lock:
        return _last_known_state.get(symbol.upper())

def update_last_known_state(symbol: str, state: dict) -> None:
    with _state_lock:
        _last_known_state[symbol.upper()] = state

def add_alert_event(push_token: str, event) -> None:
    with _alerts_lock:
        if push_token not in _recent_alerts_by_token:
            _recent_alerts_by_token[push_token] = []
        _recent_alerts_by_token[push_token].append(event)
        # keep last 50 alerts max
        if len(_recent_alerts_by_token[push_token]) > 50:
            _recent_alerts_by_token[push_token].pop(0)

def get_recent_alerts(push_token: str) -> list:
    with _alerts_lock:
        return list(_recent_alerts_by_token.get(push_token, []))
