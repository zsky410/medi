export interface AuthBootstrapGuard {
  capture(): number;
  invalidate(): number;
  isCurrent(snapshot: number): boolean;
}

export function createAuthBootstrapGuard(): AuthBootstrapGuard {
  let version = 0;

  return {
    capture() {
      return version;
    },
    invalidate() {
      version += 1;
      return version;
    },
    isCurrent(snapshot) {
      return snapshot === version;
    },
  };
}
