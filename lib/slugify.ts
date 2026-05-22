export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const slug = slugify(base);
  let suffix = 0;
  while (await exists(suffix === 0 ? slug : `${slug}-${suffix}`)) {
    suffix++;
  }
  return suffix === 0 ? slug : `${slug}-${suffix}`;
}
