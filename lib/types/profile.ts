export type ProfileDTO = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ProfileRow = {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
};

export function toProfileDTO(row: ProfileRow): ProfileDTO {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  };
}
