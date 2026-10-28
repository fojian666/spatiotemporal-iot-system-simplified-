import { describe, expect, it } from 'vitest';
import { extractKeywords, splitTextIntoChunks } from './chunking';

describe('splitTextIntoChunks', () => {
  it('keeps short documents as one non-empty chunk', () => {
    expect(splitTextIntoChunks('  土地利用总体规划实行分级审批。  ')).toEqual(['土地利用总体规划实行分级审批。']);
  });

  it('preserves all text when a long paragraph must be split', () => {
    const result = splitTextIntoChunks('甲乙丙丁戊己庚辛壬癸', 4);

    expect(result).toEqual(['甲乙丙丁', '戊己庚辛', '壬癸']);
    expect(result.join('')).toBe('甲乙丙丁戊己庚辛壬癸');
  });

  it('ignores blank content', () => {
    expect(splitTextIntoChunks(' \n\n ')).toEqual([]);
  });
});

describe('extractKeywords', () => {
  it('retains domain terms that actually occur in the source', () => {
    expect(extractKeywords('土地利用总体规划应当落实耕地保护制度。')).toEqual(['土地利用', '总体规划', '耕地保护']);
  });
});
