/**
 * Mask an email address for display purposes.
 * Keeps first 4 characters of local part, masks the rest before @, keeps domain intact.
 *
 * Examples:
 *   "phamvanchien@gmail.com" → "pham***@gmail.com"
 *   "ab@gmail.com"           → "ab**@gmail.com"
 *   "a@gmail.com"            → "a**@gmail.com"
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes("@")) return email;

  const [local, domain] = email.split("@");

  if (local.length <= 4) {
    return `${local}**@${domain}`;
  }

  return `${local.slice(0, 4)}***@${domain}`;
};
