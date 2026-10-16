export const CATEGORIAS = [
  'Material escolar', 'Eletrônicos', 'Documentos', 'Chaves',
  'Roupas e acessórios', 'Bolsas e mochilas', 'Garrafas e recipientes', 'Outros',
];
export const FILTROS_MURAL = CATEGORIAS;

export function normalizarCategoria(value) {
  const original = String(value || '').trim();
  if (CATEGORIAS.includes(original)) return original;
  const antigas = { Caderno: 'Material escolar', Celular: 'Eletrônicos', Garrafa: 'Garrafas e recipientes', 'Utensílio pessoal': 'Outros' };
  return antigas[original] || 'Outros';
}
