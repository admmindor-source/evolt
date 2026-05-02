import { describe, it, expect } from 'vitest';
import manifest from '@/app/manifest';

describe('PWA manifest (MOB-03)', () => {
  const m = manifest();

  it('has display=standalone', () => {
    expect(m.display).toBe('standalone');
  });

  it('declares portrait orientation', () => {
    expect(m.orientation).toBe('portrait');
  });

  it('has at least 192px and 512px icons', () => {
    const sizes = (m.icons ?? []).map((i) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  it('declares dark theme color', () => {
    expect(m.theme_color).toBe('#0a0a0a');
  });
});
