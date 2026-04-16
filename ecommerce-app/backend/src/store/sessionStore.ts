export interface SessionInfo {
  userId:    number;   
  username:  string;  
  role:      string;   
  ip:        string;  
  userAgent: string;   
  createdAt: Date;     
}

class SessionStore {

  private sessions: Map<string, SessionInfo> = new Map();

  private userIndex: Map<number, Set<string>> = new Map();

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

  get(jti: string): SessionInfo | undefined {
    return this.sessions.get(jti);
  }

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

  has(jti: string): boolean {
    return this.sessions.has(jti);
  }
}

export const sessionStore = new SessionStore();