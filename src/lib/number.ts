const phpFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
})
const intFormatter = new Intl.NumberFormat('en-US')

export function formatPHP(amount: number): string {
  return phpFormatter.format(amount).replace(/ /g, '') // strip nbsp if any
}

export function formatPlayerCount(n: number): string {
  return intFormatter.format(n)
}
