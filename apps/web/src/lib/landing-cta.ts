import type { UserDto } from "@medi/types";

export function landingPrimaryCtaPath({
  user,
  hasStoredSession,
}: {
  user: UserDto | null;
  hasStoredSession: boolean;
}) {
  return user || hasStoredSession ? "/trips" : "/register";
}
