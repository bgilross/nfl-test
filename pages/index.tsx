import dynamic from "next/dynamic"
import Head from "next/head"

const LegacyApp = dynamic(() => import("../src/App"), { ssr: false })

export default function Home() {
	return (
		<>
			<Head>
				<title>NFL Rankings</title>
				<meta
					name="viewport"
					content="initial-scale=1, width=device-width"
				/>
			</Head>
			<LegacyApp />
		</>
	)
}
