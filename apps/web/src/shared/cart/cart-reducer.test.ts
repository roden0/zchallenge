import { cartReducer, initialCartState } from './cart-reducer';
import type { CartLine, CartState } from './types';

function line(lineId: string, name = 'iPhone 15 Pro'): CartLine {
  return {
    lineId,
    productId: 'p1',
    brand: 'Apple',
    name,
    imageUrl: 'img.webp',
    storage: { capacity: '256 GB', price: 959.42 },
    color: { name: 'Black', hexCode: '#000000' },
  };
}

describe('cartReducer', () => {
  it('add appends a complete line', () => {
    const state = cartReducer(initialCartState, {
      type: 'add',
      line: line('a'),
    });
    expect(state.lines).toEqual([line('a')]);
  });

  it('adding an identical configuration twice gives two lines', () => {
    let state = cartReducer(initialCartState, { type: 'add', line: line('a') });
    state = cartReducer(state, { type: 'add', line: line('b') });
    expect(state.lines).toHaveLength(2);
  });

  it('keeps insertion order, oldest first', () => {
    let state = cartReducer(initialCartState, { type: 'add', line: line('a') });
    state = cartReducer(state, { type: 'add', line: line('b') });
    state = cartReducer(state, { type: 'add', line: line('c') });
    expect(state.lines.map((l) => l.lineId)).toEqual(['a', 'b', 'c']);
  });

  it('remove deletes exactly that line and keeps the order', () => {
    const start: CartState = { lines: [line('a'), line('b'), line('c')] };
    const state = cartReducer(start, { type: 'remove', lineId: 'b' });
    expect(state.lines.map((l) => l.lineId)).toEqual(['a', 'c']);
  });

  it('remove with an unknown lineId returns the same state reference', () => {
    const start: CartState = { lines: [line('a')] };
    expect(cartReducer(start, { type: 'remove', lineId: 'nope' })).toBe(start);
  });

  it('replace adopts the given list', () => {
    const lines = [line('x'), line('y')];
    const state = cartReducer(initialCartState, { type: 'replace', lines });
    expect(state.lines).toBe(lines);
  });

  it('never mutates the previous state', () => {
    const start: CartState = { lines: [line('a')] };
    const snapshot = JSON.parse(JSON.stringify(start));
    cartReducer(start, { type: 'add', line: line('b') });
    cartReducer(start, { type: 'remove', lineId: 'a' });
    cartReducer(start, { type: 'replace', lines: [] });
    expect(start).toEqual(snapshot);
  });
});
