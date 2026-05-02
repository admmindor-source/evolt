'use client';

import { useState } from 'react';
import type { Product } from './page';

type Category = 'todos' | 'proteinas' | 'performance' | 'saude';

const CATEGORY_LABELS: Record<Category, string> = {
  todos: 'Todos',
  proteinas: 'Proteínas',
  performance: 'Performance',
  saude: 'Saúde',
};

export function LojaClient({ catalog, activatedSku }: { catalog: Product[]; activatedSku: string | null }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('todos');

  const filtered = catalog.filter((p) => {
    const matchesSearch =
      search.trim() === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'todos' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ color: 'var(--color-evolt-muted)' }}
        >
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produtos"
          className="w-full pl-9 pr-4 py-3 rounded-2xl text-sm text-white placeholder:text-[color:var(--color-evolt-muted)] outline-none"
          style={{ background: 'var(--color-evolt-surface)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={
              activeCategory === cat
                ? { background: 'var(--color-evolt-orange)', color: 'black' }
                : { background: 'var(--color-evolt-surface)', color: 'var(--color-evolt-muted)' }
            }
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((product) => (
          <div
            key={product.sku}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'var(--color-evolt-surface)' }}
          >
            {/* Product color block */}
            <div
              className="w-full aspect-square flex items-center justify-center relative"
              style={{ background: 'rgba(255,120,20,0.08)' }}
            >
              <span className="text-4xl font-black" style={{ color: 'rgba(255,120,20,0.25)' }}>
                {product.sku.slice(0, 4)}
              </span>
              {activatedSku === product.sku && (
                <span
                  className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-evolt-orange)', color: 'black' }}
                >
                  Seu produto
                </span>
              )}
            </div>

            <div className="p-3 flex flex-col flex-1">
              <p className="text-sm font-semibold text-white leading-tight">{product.name}</p>
              <p className="text-xs mt-0.5 mb-2 flex-1" style={{ color: 'var(--color-evolt-muted)' }}>
                {product.description}
              </p>
              <p className="text-sm font-bold text-white mb-2">{product.price}</p>
              <a
                href={product.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2 rounded-xl text-xs font-bold"
                style={{ background: 'var(--color-evolt-orange)', color: 'black' }}
              >
                Comprar no site →
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm py-8" style={{ color: 'var(--color-evolt-muted)' }}>
          Nenhum produto encontrado.
        </p>
      )}
    </div>
  );
}
