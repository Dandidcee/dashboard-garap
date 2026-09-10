export const AUTH_COOKIE = "airdrop_auth";

/** 1 tahun, dan digeser ulang tiap kunjungan di middleware — selama masih dipakai gak bakal expired. */
export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };
}
