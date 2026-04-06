export interface SessionInfo {
  userId:    number;   // which user this session belongs to
  username:  string;   // their email address
  role:      string;   // "customer" or "admin"
  ip:        string;   // what IP address they logged in from
  userAgent: string;   // what browser/device they used
  createdAt: Date;     // when this session was created
}

class SessionStore {

  // Map<jti_string, SessionInfo>
  private sessions: Map<string, SessionInfo> = new Map();

  // Map<userId_number, Set<jti_string>>
  private userIndex: Map<number, Set<string>> = new Map();

  // ── CREATE ────────────────────────────────────────────────
  // Called once when a user successfully logs in.

  create(jti: string, data: SessionInfo): void {
    // Step 1: Store in the main map
    this.sessions.set(jti, data);
    // Step 2: Add to the user's index set
    if (!this.userIndex.has(data.userId)) {
      this.userIndex.set(data.userId, new Set());
    }
    this.userIndex.get(data.userId)!.add(jti);
  }

  // ── READ ONE ──────────────────────────────────────────────
  get(jti: string): SessionInfo | undefined {
    return this.sessions.get(jti);
  }

  // ── READ ALL FOR USER ─────────────────────────────────────
  getForUser(userId: number): Array<{ jti: string } & SessionInfo> {
    // Get the Set of jtis for this user
    const jtis = this.userIndex.get(userId);

    // If no sessions found, return empty array
    if (!jtis) return [];

    const result: Array<{ jti: string } & SessionInfo> = [];

    for (const jti of jtis) {
      const session = this.sessions.get(jti);
      if (session) {
        result.push({ jti, ...session });
      }
    }

    return result;
  }

  // ── DELETE ONE ────────────────────────────────────────────
  // Called on normal logout (single device).

  delete(jti: string): void {
    // Find which user this session belongs to
    const session = this.sessions.get(jti);
    if (!session) return; // already gone, nothing to do

    // Remove from main map
    this.sessions.delete(jti);

    // Remove from user's index set
    const userSessions = this.userIndex.get(session.userId);
    if (userSessions) {
      userSessions.delete(jti);

      // If this was their last session, clean up the
      // user's entry in the index entirely
      if (userSessions.size === 0) {
        this.userIndex.delete(session.userId);
      }
    }
  }


  // Inside the SessionStore class:
  get size(): number {
    return this.sessions.size;
  }

  
  // ── DELETE ALL FOR USER ───────────────────────────────────

  deleteAllForUser(userId: number): void {
    const jtis = this.userIndex.get(userId);
    if (!jtis) return;

    // Delete every jti from the main map
    for (const jti of jtis) {
      this.sessions.delete(jti);
    }

    // Remove the user's entire entry from the index
    this.userIndex.delete(userId);
  }

  // ── UTILITY ───────────────────────────────────────────────

  has(jti: string): boolean {
    return this.sessions.has(jti);
  }
}

export const sessionStore = new SessionStore();