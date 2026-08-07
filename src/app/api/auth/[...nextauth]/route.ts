import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyMessage } from "viem";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CircleWalletService } from "@/services/circle-wallet-service";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        try {
          const message = credentials?.message || "";
          const signature = (credentials?.signature || "") as `0x${string}`;
          
          // Expecting message format: "Sign into Sedge: 0xABC..."
          const match = message.match(/Sign into Sedge: (0x[a-fA-F0-9]{40})/);
          if (!match) return null;
          
          const address = match[1] as `0x${string}`;
          
          const isValid = await verifyMessage({
            address,
            message,
            signature,
          });

          if (isValid) {
            // Ensure user exists in our database
            const existingUser = await db.select().from(users).where(eq(users.walletAddress, address)).limit(1);
            
            if (existingUser.length === 0) {
              try {
                // Provision their dedicated Circle SCA Wallet
                const sca = await CircleWalletService.createScaWallet();
                await db.insert(users).values({
                  walletAddress: address,
                  circleWalletId: sca.id,
                });
              } catch(e) {
                console.error("Failed to provision SCA on login:", e);
                // Fallback to inserting without SCA if circle fails
                await db.insert(users).values({
                  walletAddress: address,
                });
              }
            } else if (!existingUser[0].circleWalletId) {
               try {
                 const sca = await CircleWalletService.createScaWallet();
                 await db.update(users).set({ circleWalletId: sca.id }).where(eq(users.walletAddress, address));
               } catch (e) {}
            }
            
            return { id: address, name: address };
          }
          return null;
        } catch (e) {
          console.error("Signature verification failed", e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      session.address = token.sub;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "sedge-super-secret-key-for-hackathon-only",
});

export { handler as GET, handler as POST };
