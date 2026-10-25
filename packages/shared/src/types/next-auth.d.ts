import type { Role } from "@bunnycraft/db";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

// next-auth/jwt re-exports from @auth/core/jwt, but the callback signatures
// inside @auth/core itself import JWT directly from "./jwt.js" — augmenting
// only "next-auth/jwt" doesn't merge into that identity, so augment both.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
