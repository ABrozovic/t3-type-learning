import { z } from "zod";

const roles = z.union([
  z.literal("admin"),
  z.literal("manager"),
  z.literal("cashier"),
]);

const rolesUppercase = z.union([
  z.literal("ADMIN"),
  z.literal("MANAGER"),
  z.literal("CASHIER"),
]);

type Role = z.infer<typeof roles>;

type RoleRedirects = Record<Role, Record<Uppercase<Role>, string>>;

const roleRedirects: RoleRedirects = {
  cashier: {
    ADMIN: "/admin",
    MANAGER: "/manager",
    CASHIER: "/",
  },
  manager: {
    ADMIN: "/admin",
    CASHIER: "/cashier",
    MANAGER: "/",
  },
  admin: {
    MANAGER: "/manager",
    CASHIER: "/cashier",
    ADMIN: "/",
  },
};

const roleFromRoleGuard = "admin";
const deafultRole = "CASHIER";

const sessionUserRole: string | undefined = "ADMIN"; //to simulate session.user?.role

const validation = rolesUppercase.safeParse(sessionUserRole);

const redirectDestination = validation.success
  ? roleRedirects[roleFromRoleGuard][validation.data]
  : roleRedirects[roleFromRoleGuard][deafultRole];
