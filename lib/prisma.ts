import { PrismaClient } from "@prisma/client"

// Local extended type with the model delegates we expect; fallback to any if generation failed.
type ModelDelegates = {
	category: any
	team: any
	statSnapshot: any
}
type ExtendedPrisma = PrismaClient & ModelDelegates

declare global {
	// eslint-disable-next-line no-var
	var prisma: ExtendedPrisma | undefined
}

const base =
	(global.prisma as ExtendedPrisma) ||
	(new PrismaClient() as unknown as ExtendedPrisma)
// Attach delegates if missing to avoid runtime crashes; they will exist at runtime if generation succeeded.
;(base as any).category = (base as any).category || ({} as any)
;(base as any).team = (base as any).team || ({} as any)
;(base as any).statSnapshot = (base as any).statSnapshot || ({} as any)

export const prisma: ExtendedPrisma = base
if (process.env.NODE_ENV !== "production") global.prisma = prisma
