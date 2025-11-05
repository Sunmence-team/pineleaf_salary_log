export const formatterUtility = (amount: number) => {
    if (amount === null || amount === undefined) {
        return '';
    }
    return amount.toLocaleString("en-NG");
};

export const formatCompactAmount = (amount: number) => {
    if (amount === null || amount === undefined) {
        return '';
    }

    const absAmount = Math.abs(amount);

    if (absAmount < 1_000_000) {
        return formatterUtility(amount);
    }

    const SI_SUFFIXES = [
        { value: 1E6, symbol: "M" }, // 1,000,000
        { value: 1E9, symbol: "B" }, // 1,000,000,000
        { value: 1E12, symbol: "T" }, // 1,000,000,000,000
    ];

    let tier = SI_SUFFIXES.filter(t => absAmount >= t.value).pop();

    if (!tier) {
        return formatterUtility(amount);
    }

    const scaledValue = absAmount / tier.value;

    const formatted = parseFloat(scaledValue.toFixed(2)).toString();

    const sign = amount < 0 ? '-' : '';

    return `${sign}${formatted}${tier.symbol}`;
};

export const formatISODateToCustom = (isoString: string) => {
    if (!isoString) {
        return '';
    }

    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    let hours: string | number = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}${ampm}`;
};

export function formatUnderScores(input: string, capitalize = false) {
  let formatted = input.replace(/_/g, ' ');

  if (capitalize) {
    formatted = formatted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return formatted;
}