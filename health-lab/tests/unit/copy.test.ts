import { describe, expect, it } from 'vitest';
import { allCopy, FORBIDDEN } from './helpers';

describe('文言', () => {
  it('すべての文言に監修状態が設定されている', () => {
    for (const [key, copy] of Object.entries(allCopy)) {
      expect(['draft', 'reviewed'], key).toContain(copy.review);
      expect(copy.text.trim().length, key).toBeGreaterThan(0);
    }
  });

  it('医学的な断定・病名の推測・独自スコア・否定的な表現を含まない', () => {
    for (const [key, copy] of Object.entries(allCopy)) {
      for (const pattern of FORBIDDEN) {
        expect(pattern.test(copy.text), `${key}: ${copy.text} に ${pattern} が含まれています`).toBe(false);
      }
    }
  });
});
