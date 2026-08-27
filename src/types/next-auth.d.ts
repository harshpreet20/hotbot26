import type { Role } from "@/types/dashboard";

declare module "next-auth" {
  interface User {
    role:     Role;
    username: string;
  }

  interface Session {
    user: {
      id:       string;
      role:     Role;
      username: string;
      email?:   string;
      name?:    string;
      image?:   string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId:   string;
    role:     Role;
    username: string;
  }
}
