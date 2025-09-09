import { useState } from "react"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import CircularProgress from "@mui/material/CircularProgress"
import TextField from "@mui/material/TextField"

const apiBase = process.env.REACT_APP_API_BASE || "" // assume same origin proxy /api

const DebugPanel = ({ teamName, selectedYear }) => {
	const [open, setOpen] = useState(false)
	const [busy, setBusy] = useState(false)
	const [output, setOutput] = useState(null)
	const [limitWeeks, setLimitWeeks] = useState("")

	const fetchJSON = async (path, opts) => {
		setBusy(true)
		setOutput(null)
		try {
			const res = await fetch(`${apiBase}${path}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: opts ? JSON.stringify(opts) : undefined,
			})
			const data = await res.json()
			setOutput(data)
		} catch (e) {
			setOutput({ error: e.message })
		} finally {
			setBusy(false)
		}
	}

	return (
		<div style={{ margin: "12px" }}>
			<Button
				size="small"
				variant="outlined"
				onClick={() => setOpen(!open)}
			>
				{open ? "Hide Debug" : "Show Debug"}
			</Button>
			{open && (
				<Paper
					elevation={4}
					style={{ padding: "12px", marginTop: "10px", maxWidth: 900 }}
				>
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							gap: "8px",
							marginBottom: "10px",
						}}
					>
						<Button
							disabled={busy}
							onClick={() => fetchJSON("/api/debug/validate-scrape")}
						>
							Validate Scrape
						</Button>
						<Button
							disabled={busy || !teamName}
							onClick={() =>
								fetchJSON("/api/debug/verify-espn", {
									team: teamName || "Detroit",
									season: selectedYear,
									limit_weeks: limitWeeks ? Number(limitWeeks) : null,
								})
							}
						>
							Verify ESPN
						</Button>
						<Button
							disabled={busy}
							onClick={() => fetchJSON("/api/scrape")}
						>
							Trigger Scrape
						</Button>
						<TextField
							label="Limit Weeks"
							size="small"
							value={limitWeeks}
							onChange={(e) =>
								setLimitWeeks(e.target.value.replace(/[^0-9]/g, ""))
							}
							style={{ width: 110 }}
						/>
						{busy && <CircularProgress size={20} />}
					</div>
					<pre
						style={{
							maxHeight: 300,
							overflow: "auto",
							background: "#111",
							color: "#9fdf9f",
							padding: "8px",
							fontSize: "0.7rem",
						}}
					>
						{output ? JSON.stringify(output, null, 2) : "// results here"}
					</pre>
				</Paper>
			)}
		</div>
	)
}

export default DebugPanel
