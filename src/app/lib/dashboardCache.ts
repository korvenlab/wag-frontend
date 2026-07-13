/** Cache em memória entre páginas do dashboard (evita refetch completo a cada navegação). */

export type DashboardProfileCache = {
  store_name: string;
  business_niche: string | null;
  business_niche_custom: string | null;
  is_ai_enabled: boolean;
  whatsapp_connected: boolean;
  google_connected: boolean;
  messages_answered: number;
  appointments_made: number;
  service_duration: number;
  working_hours: Record<string, unknown> | null;
};

export type TeamMemberCache = {
  id: string;
  nome: string;
  google_calendar_email: string;
  ativo: boolean;
};

const PROFILE_TTL_MS = 2 * 60 * 1000;
const TEAM_TTL_MS = 60 * 1000;

type Entry<T> = { userId: string; data: T; at: number };

let profileEntry: Entry<DashboardProfileCache> | null = null;
let teamEntry: Entry<TeamMemberCache[]> | null = null;

function fresh<T>(entry: Entry<T> | null, userId: string, ttl: number): T | null {
  if (!entry || entry.userId !== userId) return null;
  if (Date.now() - entry.at > ttl) return null;
  return entry.data;
}

export function getCachedDashboardProfile(userId: string): DashboardProfileCache | null {
  return fresh(profileEntry, userId, PROFILE_TTL_MS);
}

export function setCachedDashboardProfile(userId: string, data: DashboardProfileCache): void {
  profileEntry = { userId, data, at: Date.now() };
}

export function getCachedTeam(userId: string): TeamMemberCache[] | null {
  return fresh(teamEntry, userId, TEAM_TTL_MS);
}

export function setCachedTeam(userId: string, data: TeamMemberCache[]): void {
  teamEntry = { userId, data, at: Date.now() };
}

export function invalidateTeamCache(userId?: string): void {
  if (!userId || teamEntry?.userId === userId) teamEntry = null;
}

export function warmBackend(apiBase: string): void {
  const base = apiBase.replace(/\/+$/, "");
  void fetch(`${base}/health`).catch(() => undefined);
}
