export function generateImageSlug(imageName: string): string {
  return imageName
    .trim() // removes whitespace from both the beginning and end of a string
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, "") // Remove special characters
    .replace(/\-+/g, "-") // Remove duplicate hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
}
