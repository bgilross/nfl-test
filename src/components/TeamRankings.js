import { getBackendTeamAggregate } from "../logic/logic"
import { useEffect, useState } from "react"

const TeamRankings = ({ data }) => {
	const [backendStats, setBackendStats] = useState(null)

	useEffect(() => {
		let cancelled = false
		;(async () => {
			const loc = data?.location || data?.teamData?.location
			const disp = data?.teamData?.displayName
			if (!loc && !disp) return setBackendStats(null)
			const agg = await getBackendTeamAggregate(loc, disp)
			if (!cancelled) setBackendStats(agg)
		})()
		return () => {
			cancelled = true
		}
	}, [data?.location, data?.teamData?.location, data?.teamData?.displayName])

	return (
		<div style={{ fontSize: ".75rem" }}>
			<ul
				style={{
					display: "flex",
					padding: "3px",
					listStyleType: "none",
					gap: "12px",
				}}
			>
				{Object.entries(backendStats?.categories || {}).map(
					([category, row]) => (
						<li
							key={category}
							style={{ margin: "1px" }}
						>
							<h5>{category}</h5>
							<ul>
								{row.current_year != null && (
									<li style={{ textWrap: "nowrap" }}>
										{row.current_year}: {row.value_current}
									</li>
								)}
								<li style={{ textWrap: "nowrap" }}>Last 3: {row.last_3}</li>
								<li style={{ textWrap: "nowrap" }}>Last 1: {row.last_1}</li>
								<li style={{ textWrap: "nowrap" }}>Home: {row.home}</li>
								<li style={{ textWrap: "nowrap" }}>Away: {row.away}</li>
								{row.prev_year != null && (
									<li style={{ textWrap: "nowrap" }}>
										{row.prev_year}: {row.value_prev}
									</li>
								)}
							</ul>
						</li>
					)
				)}
				{/* Fallback to static if backend not available */}
				{!backendStats && (
					<li style={{ listStyle: "none", color: "#999" }}>
						Loading team rankings...
					</li>
				)}
			</ul>
		</div>
	)
}
export default TeamRankings
