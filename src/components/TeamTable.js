import React, { useState, useMemo } from "react"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
// (useState, useMemo imported above)
import TeamRankingsPopOver from "./TeamRankingsPopOver"

import PlayerPopOver from "./PlayerPopOver"
const TeamTable = ({ data, teamNum }) => {
	const [currentCategory, setCurrentCategory] = useState("offensive")
	const [currentStat, setCurrentStat] = useState("Yards")
	const [currentType, setCurrentType] = useState("rushing")
	const [defStat, setDefStat] = useState("Tackles")

	// Pull raw refs (may be undefined initially)
	const gamesData = data?.[teamNum]?.gamesData
	const categories = data?.[teamNum]?.categories
	const teamData = data?.[teamNum]?.teamData
	const numWeeks = gamesData?.length

	// Always call hooks before any returns (rules-of-hooks compliance)
	const weeklyScores = useMemo(() => {
		if (!gamesData || !teamData) return []
		return gamesData.map((game, index) => (
			<TableCell
				sx={{
					backgroundColor: `#${teamData.color}`,
					color: `#${teamData.alternateColor}`,
				}}
				align="right"
				key={index}
			>
				<TeamRankingsPopOver
					game={game}
					teamNum={teamNum}
					currentData={data}
				>
					<div>W{index + 1}</div>
					<div>{game.awayTeam.abbreviation}</div>
					<div>@</div>
					<div>{game.homeTeam.abbreviation}</div>
					<div>{game.awayTeam.score}</div>
					<div>{game.homeTeam.score}</div>
				</TeamRankingsPopOver>
			</TableCell>
		))
	}, [gamesData, teamData, data, teamNum])

	if (!gamesData || !categories) {
		return (
			<div>
				<h4>No Table Data</h4>
				<button onClick={() => console.log(data)}>Check</button>
			</div>
		)
	}

	return (
		<div>
			<select
				value={currentCategory}
				onChange={({ target: { value } }) => setCurrentCategory(value)}
			>
				<option value="">Select a Category</option>
				<option value="offensive">Offensive</option>
				<option value="defensive">Defensive</option>
			</select>

			{currentCategory && currentCategory !== "defensive" && (
				<select
					value={currentType}
					onChange={(e) => setCurrentType(e.target.value)}
				>
					<option value="">Select a stat</option>
					{Object.keys(categories).map((category) => {
						if (category !== "defensive") {
							return (
								<option
									key={category}
									value={category}
								>
									{category}
								</option>
							)
						}
						return null
					})}
				</select>
			)}

			{currentCategory === "offensive" && (
				<select
					value={currentStat}
					onChange={(e) => setCurrentStat(e.target.value)}
				>
					<option value="">Select a stat</option>
					{Object.keys(categories[currentType]).length > 0 &&
						Object.keys(Object.values(categories[currentType])[0]).map(
							(stat) => (
								<option
									key={stat}
									value={stat}
								>
									{stat}
								</option>
							)
						)}
				</select>
			)}

			{currentCategory === "defensive" && (
				<select
					value={defStat}
					onChange={(e) => setDefStat(e.target.value)}
				>
					<option value="">Select a stat</option>
					{Object.keys(categories[currentCategory]).length > 0 &&
						Object.keys(Object.values(categories[currentCategory])[0]).map(
							(stat) => (
								<option
									key={stat}
									value={stat}
								>
									{stat}
								</option>
							)
						)}
				</select>
			)}

			<TableContainer
				component={Paper}
				elevation={7}
			>
				<Table
					padding="none"
					size="small"
					aria-label="simple table"
				>
					<TableHead>
						<TableRow>
							<TableCell
								sx={{
									backgroundColor: `#${teamData?.alternateColor}`,
									height: "100px", // Set a fixed height for vertical centering to work
									textAlign: "center", // Center the content horizontally
									verticalAlign: "middle", // Center the content vertically
									padding: 0, // Optional: Remove padding if needed
								}}
								component="th"
								scope="row"
								colSpan={2}
							>
								<img
									src={teamData?.logos[0].href}
									alt={teamData?.displayName || "team logo"}
									style={{ height: "100px" }}
								/>
							</TableCell>

							{weeklyScores}
						</TableRow>
					</TableHead>
					<TableBody>
						{Object.entries(categories).map(([categoryName, players]) => {
							if (
								currentCategory === "defensive" &&
								categoryName !== "defensive"
							) {
								return null
							} else if (
								currentCategory !== "defensive" &&
								categoryName === "defensive"
							) {
								return null
							} else {
								return (
									<React.Fragment key={categoryName}>
										<TableRow>
											<TableCell
												component="th"
												scope="row"
												colSpan={numWeeks + 2}
												style={{ fontWeight: "bold" }}
											>
												<div
													style={{
														display: "flex",
														justifyContent: "space-between",
													}}
												>
													<div>
														<div>{categoryName.toUpperCase()}</div>
														{/* Removed debug Check button */}
													</div>
													<div>
														{categoryName === "defensive"
															? defStat
															: currentStat}{" "}
													</div>
												</div>
											</TableCell>
										</TableRow>

										{Object.entries(players).map(
											([playerName, playerStats]) => (
												<TableRow key={playerName}>
													<PlayerPopOver
														gamesData={gamesData}
														playerName={playerName}
														teamNum={teamNum}
													>
														<TableCell>{playerName} </TableCell>
													</PlayerPopOver>
													<TableCell> = </TableCell>
													{currentCategory === "defensive" &&
														playerStats[defStat]?.map((stat, index) => (
															<TableCell
																align="right"
																key={index}
															>
																{stat}
															</TableCell>
														))}
													{currentCategory !== "defensive" &&
														playerStats[currentStat]?.map((stat, index) => (
															<TableCell
																align="right"
																key={index}
															>
																{stat}
															</TableCell>
														))}
												</TableRow>
											)
										)}
									</React.Fragment>
								)
							}
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	)
}
export default TeamTable
