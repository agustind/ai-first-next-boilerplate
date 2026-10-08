const formatter = new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' })

export function formatDate(iso: string) {
  return formatter.format(new Date(iso))
}
