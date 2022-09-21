export const formatCurrency = (value: number, locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(value)
}

export const formatPercentage = (percent: number) => `${(percent * 100).toFixed(2)}%`
