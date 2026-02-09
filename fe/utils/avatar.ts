/** Default avatar URL for users without a custom avatar. */
export function getAvatarUrl(avatarUrl: string | null | undefined, username: string): string {
  if (avatarUrl) return avatarUrl;
  const name = encodeURIComponent(username || 'User');
  return `https://ui-avatars.com/api/?name=${name}&background=92c9a4&color=193322&size=256`;
}
