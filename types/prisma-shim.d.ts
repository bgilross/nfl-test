// Temporary shim to satisfy TypeScript if Prisma types aren't picked up
// This will be replaced once language server indexes generated client.

declare module "@prisma/client" {
	// minimal placeholder shape; real client has many methods
	class PrismaClient {
		$connect(): Promise<void>
		$disconnect(): Promise<void>
	}
	export { PrismaClient }
}
