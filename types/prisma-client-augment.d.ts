// Augment PrismaClient typing because generated .prisma types directory missing.
// Temporary until prisma generate creates proper delegate properties.

declare module "@prisma/client" {
	interface CategoryDelegate {
		findMany(args?: any): Promise<any[]>
		upsert(args: any): Promise<any>
	}
	interface TeamDelegate {
		findMany(args?: any): Promise<any[]>
		findUnique(args: any): Promise<any | null>
		upsert(args: any): Promise<any>
	}
	interface StatSnapshotDelegate {
		findMany(args?: any): Promise<any[]>
		create(args: any): Promise<any>
	}
	interface PrismaClient {
		category: CategoryDelegate
		team: TeamDelegate
		statSnapshot: StatSnapshotDelegate
	}
}
