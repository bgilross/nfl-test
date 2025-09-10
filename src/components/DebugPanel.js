import { useState } from "react"
import CircularProgress from "@mui/material/CircularProgress"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"

const DebugPanel = () => {
	const [open, setOpen] = useState(false)
	const [busy, setBusy] = useState(false)
	const [output, setOutput] = useState(null)

	const fetchJSON = async (path, body) => {
		setBusy(true)
		setOutput(null)
		try {
			const hasBody = body != null
			const controller = new AbortController()
			const timeout = setTimeout(() => controller.abort(), 15000)
			const res = await fetch(path, {
				method: hasBody ? "POST" : "GET",
				headers: hasBody ? { "Content-Type": "application/json" } : undefined,
				body: hasBody ? JSON.stringify(body) : undefined,
				signal: controller.signal,
			})
			clearTimeout(timeout)
			const ct = res.headers.get("content-type") || ""
			if (!res.ok) {
				const text = await res.text()
				setOutput({ error: `HTTP ${res.status}`, body: text.slice(0, 300) })
				return
			}
			if (ct.includes("application/json")) {
				setOutput(await res.json())
			} else {
				const text = await res.text()
				setOutput({ warning: "Non-JSON", body: text.slice(0, 300) })
			}
		} catch (e) {
			setOutput({ error: e?.message || String(e) })
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
					style={{ padding: 12, marginTop: 10, maxWidth: 900 }}
				>
					<div
						style={{
							display: "flex",
							gap: 8,
							flexWrap: "wrap",
							marginBottom: 12,
						}}
					>
						<Button
							disabled={busy}
							onClick={() => fetchJSON("/api/health")}
						>
							Health
						</Button>
						<Button
							disabled={busy}
							onClick={() => fetchJSON("/api/categories")}
						>
							Categories
						</Button>
						<Button
							disabled={busy}
							onClick={() => fetchJSON("/api/scrape", {})}
						>
							Trigger Scrape
						</Button>
						{busy && <CircularProgress size={18} />}
					</div>
					<pre
						style={{
							fontSize: 11,
							maxHeight: 300,
							overflow: "auto",
							background: "#111",
							color: "#0f0",
							padding: 8,
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
