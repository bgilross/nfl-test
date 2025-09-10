module.exports = {
	testEnvironment: "node",
	transform: {
		"^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	testMatch: ["**/__tests__/**/*.test.(ts|tsx|js)"],
	roots: ["<rootDir>"],
}
