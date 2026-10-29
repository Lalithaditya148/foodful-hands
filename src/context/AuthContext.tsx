import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "@/lib/api";
import { disconnectSocket } from "@/lib/socket";

export type UserRole = "donor" | "organization" | "admin";
export type OrgStatus = "pending" | "approved" | "rejected";
export type OrgType = "orphanage" | "old_age_home" | "other";
export type AppUser = {
  id: string;
  name: string;
  managerName?: string;
  orgType?: OrgType;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  address: string;
  orgStatus?: OrgStatus;
  createdAt: string;
};
export type RegisterInput = Omit<AppUser, "id" | "createdAt" | "orgStatus"> & { password: string };
type AuthResult = { ok: true; user?: AppUser } | { ok: false; message: string };
type AuthContextValue = {
  user: AppUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<AuthResult>;
  resetPassword: (
    email: string,
    currentPassword: string,
    newPassword: string,
  ) => Promise<AuthResult>;
  updateProfile: (
    patch: Partial<Pick<AppUser, "name" | "phone" | "city" | "address">>,
  ) => Promise<AuthResult>;
  setOrgStatus: (userId: string, status: OrgStatus) => Promise<AuthResult>;
};
type UserResponse = { success: boolean; user: AppUser };
const AuthContext = createContext<AuthContextValue | null>(null);
const toResult = (user: AppUser): AuthResult => ({ ok: true, user });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    apiRequest<UserResponse>("/auth/me")
      .then(({ user: restored }) => setUser(restored))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await apiRequest<UserResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(response.user);
      return toResult(response.user);
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Unable to sign in" };
    }
  }, []);
  const register = useCallback(async (input: RegisterInput): Promise<AuthResult> => {
    try {
      const response = await apiRequest<UserResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      if (input.role === "donor" && response.user) setUser(response.user);
      return toResult(response.user);
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Unable to register" };
    }
  }, []);
  const logout = useCallback(async () => {
    await apiRequest("/auth/logout", { method: "POST" }).catch(() => undefined);
    disconnectSocket();
    setUser(null);
  }, []);
  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    try {
      await apiRequest("/users/account", { method: "DELETE" });
      setUser(null);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to delete account",
      };
    }
  }, []);
  const resetPassword = useCallback(
    async (email: string, currentPassword: string, newPassword: string): Promise<AuthResult> => {
      try {
        await apiRequest("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ email, currentPassword, newPassword }),
        });
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : "Unable to reset password",
        };
      }
    },
    [],
  );
  const updateProfile = useCallback(
    async (
      patch: Partial<Pick<AppUser, "name" | "phone" | "city" | "address">>,
    ): Promise<AuthResult> => {
      try {
        const response = await apiRequest<UserResponse>("/users/profile", {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
        setUser(response.user);
        return toResult(response.user);
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : "Unable to update profile",
        };
      }
    },
    [],
  );
  const setOrgStatus = useCallback(
    async (userId: string, status: OrgStatus): Promise<AuthResult> => {
      try {
        await apiRequest<UserResponse>(`/users/${userId}/org-status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : "Unable to update organization status",
        };
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      deleteAccount,
      resetPassword,
      updateProfile,
      setOrgStatus,
    }),
    [
      user,
      ready,
      login,
      register,
      logout,
      deleteAccount,
      resetPassword,
      updateProfile,
      setOrgStatus,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
