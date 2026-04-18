import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      hasAccessibleSpot: boolean;
      isAdmin: boolean;
      unitNumber: string;
      spotIdentifier: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    hasAccessibleSpot: boolean;
    isAdmin: boolean;
    unitNumber: string;
    spotIdentifier: string | null;
  }
}
