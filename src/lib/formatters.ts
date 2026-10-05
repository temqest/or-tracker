/**
 * Utility functions for currency, dates, and legal receipt formatting.
 */

export function formatCurrency(amount: number, currency = 'PHP'): string {
  if (isNaN(amount)) return '₱0.00';
  const prefix = currency === 'PHP' ? '₱' : currency === 'USD' ? '$' : `${currency} `;
  return `${prefix}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(isoStr: string): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoStr;
  }
}

/**
 * Converts a numeric amount to formal legal words (Philippine Peso or standard currency convention)
 */
export function numberToWords(amount: number, currencyName = 'PESOS'): string {
  if (isNaN(amount) || amount === 0) return `ZERO ${currencyName} ONLY`;

  const ones = [
    '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
    'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
    'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
  ];

  const tens = [
    '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'
  ];

  function convertGroup(n: number): string {
    let result = '';
    const hundred = Math.floor(n / 100);
    const rest = n % 100;

    if (hundred > 0) {
      result += `${ones[hundred]} HUNDRED `;
    }

    if (rest > 0) {
      if (rest < 20) {
        result += ones[rest] + ' ';
      } else {
        const ten = Math.floor(rest / 10);
        const unit = rest % 10;
        result += tens[ten] + (unit > 0 ? `-${ones[unit]} ` : ' ');
      }
    }

    return result.trim();
  }

  const integerPart = Math.floor(amount);
  const cents = Math.round((amount - integerPart) * 100);

  const billions = Math.floor(integerPart / 1_000_000_000);
  const millions = Math.floor((integerPart % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1_000);
  const remainder = integerPart % 1_000;

  const parts: string[] = [];

  if (billions > 0) parts.push(`${convertGroup(billions)} BILLION`);
  if (millions > 0) parts.push(`${convertGroup(millions)} MILLION`);
  if (thousands > 0) parts.push(`${convertGroup(thousands)} THOUSAND`);
  if (remainder > 0 || parts.length === 0) parts.push(convertGroup(remainder));

  const wordsStr = parts.join(' ').trim();
  const centStr = cents > 0 ? `AND ${cents.toString().padStart(2, '0')}/100` : 'AND 00/100';

  return `${wordsStr} ${currencyName} ${centStr} ONLY`.replace(/\s+/g, ' ').trim();
}
