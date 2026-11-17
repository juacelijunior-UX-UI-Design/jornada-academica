// Cálculo de presença e elegibilidade (funções puras, usadas no servidor).
const EPS = 1e-9;

export const arredondar2 = (n) => Math.round(n * 100) / 100;

export const percentualDe = (horas, cargaTotal) => (cargaTotal > 0 ? (horas / cargaTotal) * 100 : 0);

// config = { modo_aprovacao: 'presenca' | 'horas' | 'percentual', valor_minimo: número }
// "presenca": basta 1 registro de frequência, em qualquer um dos dois dias do evento.
export function estaElegivel({ horas = 0, presencas = 0 }, cargaTotal, config) {
  if (config.modo_aprovacao === "presenca") return presencas > 0;
  if (!(horas > 0)) return false;
  if (config.modo_aprovacao === "horas") return horas + EPS >= Number(config.valor_minimo);
  if (!(cargaTotal > 0)) return false;
  return horas * 100 + EPS >= Number(config.valor_minimo) * cargaTotal;
}