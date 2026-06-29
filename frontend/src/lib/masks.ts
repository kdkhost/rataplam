export function maskCpf(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 11);
  if (v.length <= 3) return v;
  if (v.length <= 6) return `${v.substring(0, 3)}.${v.substring(3)}`;
  if (v.length <= 9) return `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6)}`;
  return `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6, 9)}-${v.substring(9)}`;
}

export function maskCnpj(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 14);
  if (v.length <= 2) return v;
  if (v.length <= 5) return `${v.substring(0, 2)}.${v.substring(2)}`;
  if (v.length <= 8) return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5)}`;
  if (v.length <= 12) return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8)}`;
  return `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8, 12)}-${v.substring(12)}`;
}

export function maskTelefone(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 11);
  if (v.length <= 2) return v.length ? `(${v}` : '';
  if (v.length <= 6) return `(${v.substring(0, 2)}) ${v.substring(2)}`;
  if (v.length <= 10) return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
  return `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
}

export function maskCep(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 8);
  if (v.length <= 5) return v;
  return `${v.substring(0, 5)}-${v.substring(5)}`;
}

export function maskMoeda(value: string): string {
  let v = value.replace(/\D/g, '');
  if (!v) return '';
  v = (parseInt(v) / 100).toFixed(2);
  const parts = v.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${parts.join(',')}`;
}

export function maskData(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 8);
  if (v.length <= 2) return v;
  if (v.length <= 4) return `${v.substring(0, 2)}/${v.substring(2)}`;
  return `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
}

export function maskHora(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 4);
  if (v.length <= 2) return v;
  return `${v.substring(0, 2)}:${v.substring(2)}`;
}

export function maskCartao(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 16);
  return v.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function maskValidade(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 4);
  if (v.length <= 2) return v;
  return `${v.substring(0, 2)}/${v.substring(2)}`;
}

export function maskCvv(value: string): string {
  return value.replace(/\D/g, '').substring(0, 4);
}
