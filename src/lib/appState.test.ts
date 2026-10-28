import { describe, expect, it } from 'vitest';
import { initialState } from '../data/fixtures';
import { parseAppState } from './appState';

describe('parseAppState', () => {
  it('accepts a complete persisted application state', () => {
    expect(parseAppState(initialState, initialState)).toBe(initialState);
  });

  it.each([null, {}, [], 'broken'])('rejects structurally invalid root value %j', (value) => {
    expect(parseAppState(value, initialState)).toBe(initialState);
  });

  it('rejects malformed nested records instead of crashing page rendering', () => {
    const malformed = { ...initialState, datasets: [{ id: 'incomplete' }] };

    expect(parseAppState(malformed, initialState)).toBe(initialState);
  });

  it.each(['datasets', 'knowledgeBases', 'documents', 'chunks', 'conversations'] as const)('rejects unsupported tree rows in persisted %s', (collection) => {
    const malformed = {
      ...initialState,
      [collection]: [{ ...initialState[collection][0], children: {} }],
    };
    expect(parseAppState(malformed, initialState)).toBe(initialState);
  });

  it('rejects malformed conversation messages and citations', () => {
    const malformed = {
      ...initialState,
      conversations: [{ id: 'bad', agentId: 'agent-natural', title: 'Bad', updatedAt: 'now', messages: [{ role: 'user' }] }],
    };

    expect(parseAppState(malformed, initialState)).toBe(initialState);
  });
});
