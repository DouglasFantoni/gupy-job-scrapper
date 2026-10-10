export function formatDescription(description: string | null | undefined, keywords?: string[]): string {
  if (!description) return '';
  let formatted = description.replace(/\n/g, '<br />');
  if (keywords && keywords.length > 0) {
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      formatted = formatted.replace(regex, '<mark>$1</mark>');
    });
  }
  return formatted;
}
