// hooks/useGitHubAuth.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import type { GitHubUser } from "@/lib/github/session";
import type { ProfileRepoInfo } from "@/lib/github/publisher";
import { useStore } from "@/lib/store";

export interface GitHubAuthState {
  user: GitHubUser | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  profileRepo: ProfileRepoInfo | null;
  isLoadingRepo: boolean;
  refreshStatus: () => Promise<void>;
  refreshProfileRepo: () => Promise<void>;
  createProfileRepo: (isPrivate?: boolean) => Promise<boolean>;
  disconnect: () => Promise<void>;
}

export function useGitHubAuth(): GitHubAuthState {
  const { setUsername, username: storeUsername } = useStore();

  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [profileRepo, setProfileRepo] = useState<ProfileRepoInfo | null>(null);
  const [isLoadingRepo, setIsLoadingRepo] = useState<boolean>(false);

  // Check current session from API
  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/github/status");
      if (res.ok) {
        const data = await res.json();
        setIsConnected(Boolean(data.connected));
        setUser(data.user || null);

        if (data.user?.login && !storeUsername) {
          setUsername(data.user.login);
        }
      } else {
        setIsConnected(false);
        setUser(null);
      }
    } catch {
      setIsConnected(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [setUsername, storeUsername]);

  // Check profile repository existence and status
  const refreshProfileRepo = useCallback(async () => {
    if (!isConnected && !user) return;
    setIsLoadingRepo(true);
    try {
      const res = await fetch("/api/github/profile-repo");
      if (res.ok) {
        const data = await res.json();
        setProfileRepo(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setProfileRepo({
          exists: false,
          error: err.error || "Failed to inspect profile repository",
        });
      }
    } catch {
      setProfileRepo({
        exists: false,
        error: "Network error checking profile repository",
      });
    } finally {
      setIsLoadingRepo(false);
    }
  }, [isConnected, user]);

  // Create repository if it doesn't exist
  const createProfileRepo = useCallback(async (isPrivate = false): Promise<boolean> => {
    setIsLoadingRepo(true);
    try {
      const res = await fetch("/api/github/profile-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfileRepo(data);
        return true;
      }
      const err = await res.json().catch(() => ({}));
      setError(err.error || "Failed to create repository");
      return false;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error creating repository");
      return false;
    } finally {
      setIsLoadingRepo(false);
    }
  }, []);

  // Logout / Disconnect
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/github/logout", { method: "POST" });
      setIsConnected(false);
      setUser(null);
      setProfileRepo(null);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    async function loadInitialStatus() {
      try {
        const res = await fetch("/api/auth/github/status");
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          setIsConnected(Boolean(data.connected));
          setUser(data.user || null);

          if (data.user?.login && !storeUsername) {
            setUsername(data.user.login);
          }
        } else {
          setIsConnected(false);
          setUser(null);
        }
      } catch {
        if (isMounted) {
          setIsConnected(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialStatus();

    return () => {
      isMounted = false;
    };
  }, [setUsername, storeUsername]);

  // Load repo info after connection
  useEffect(() => {
    if (!isConnected || !user) return;

    let isMounted = true;

    async function loadRepoInfo() {
      setIsLoadingRepo(true);
      try {
        const res = await fetch("/api/github/profile-repo");
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          setProfileRepo(data);
        } else {
          const err = await res.json().catch(() => ({}));
          setProfileRepo({
            exists: false,
            error: err.error || "Failed to inspect profile repository",
          });
        }
      } catch {
        if (isMounted) {
          setProfileRepo({
            exists: false,
            error: "Network error checking profile repository",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingRepo(false);
        }
      }
    }

    loadRepoInfo();

    return () => {
      isMounted = false;
    };
  }, [isConnected, user]);

  return {
    user,
    isConnected,
    isLoading,
    error,
    profileRepo,
    isLoadingRepo,
    refreshStatus,
    refreshProfileRepo,
    createProfileRepo,
    disconnect,
  };
}
