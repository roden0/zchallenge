import type { CartAction, CartState } from './types';

export const initialCartState: CartState = { lines: [] };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add':
      return { lines: [...state.lines, action.line] };
    case 'remove': {
      const lines = state.lines.filter((line) => line.lineId !== action.lineId);
      if (lines.length === state.lines.length) {
        return state;
      }
      return { lines };
    }
    case 'replace':
      return { lines: action.lines };
  }
}
