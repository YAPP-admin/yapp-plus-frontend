import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const fontsDirectory = resolve(import.meta.dirname, '../fonts');
const css = readFileSync(resolve(fontsDirectory, 'pretendardvariable-dynamic-subset.css'), 'utf8');

describe('배포하는 Pretendard 서브셋', () => {
  it('모든 CSS 참조가 실제 로컬 WOFF2 파일을 가리킨다', () => {
    const sources = [...css.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1] ?? '');
    expect(sources).toHaveLength(92);
    expect(new Set(sources).size).toBe(sources.length);
    for (const source of sources) {
      expect(source).toMatch(/^\.\/woff2-dynamic-subset\/[^/]+\.woff2$/);
      const data = readFileSync(resolve(fontsDirectory, source));
      expect(data.toString('ascii', 0, 4)).toBe('wOF2');
      expect(data.readUInt32BE(8)).toBe(data.length);
    }
  });

  it('한글 전체 음절과 기본 영문·숫자를 CSS 문자 구간에서 제외하지 않는다', () => {
    const ranges = [...css.matchAll(/U\+([\da-f]+)(?:-([\da-f]+))?/gi)].map(
      (match): [number, number] => [
        Number.parseInt(match[1] ?? '', 16),
        Number.parseInt(match[2] ?? match[1] ?? '', 16),
      ],
    );
    for (const [start, end] of [
      [0x20, 0x7e],
      [0xac00, 0xd7a3],
    ] as const) {
      for (let point = start; point <= end; point++) {
        expect(ranges.some(([from, to]) => point >= from && point <= to)).toBe(true);
      }
    }
  });
});
