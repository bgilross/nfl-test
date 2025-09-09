import { getTeamRankings } from "../logic/logic"
import { useMemo } from "react"

const TeamRankings = ({ data }) => {
	const stats = useMemo(() => getTeamRankings(data), [data])

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
				{Object.entries(stats).map(([category, data]) => (
					<li
						key={category}
						style={{ margin: "1px" }}
					>
						<h5>{category}</h5>
						<ul>
							{Object.entries(data).map(([key, value]) => {
								if (key === "Team" || key === "Rank") return null
								return (
									<li
										key={key}
										style={{ textWrap: "nowrap" }}
									>
										{key}: {value}
									</li>
								)
							})}
						</ul>
					</li>
				))}
			</ul>
		</div>
	)
}
export default TeamRankings
