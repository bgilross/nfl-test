import requests
from bs4 import BeautifulSoup
import json
import time  # Import the time module


def scrape_site(url):
    response = requests.get(url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, "html.parser")
        table = soup.find("table")

        table_data = []

        if not table:
            print(f"No table found on {url}.")
            return None

        for row in table.find_all("tr"):
            columns = row.find_all("td")
            if columns:
                # Extract data from each column
                rank = int(
                    columns[0].get_text(strip=True)
                )  # Assuming Rank is the first column
                team = columns[1].get_text(
                    strip=True
                )  # Assuming Team is the second column

                # Clean the data by removing '%' and converting to float
                stats = {
                    "Rank": rank,
                    "Team": team,
                    "2024": float(
                        columns[2].get_text(strip=True).replace("%", "").strip()
                    ),
                    "Last 3": float(
                        columns[3].get_text(strip=True).replace("%", "").strip()
                    ),
                    "Last 1": float(
                        columns[4].get_text(strip=True).replace("%", "").strip()
                    ),
                    "Home": float(
                        columns[5].get_text(strip=True).replace("%", "").strip()
                    ),
                    "Away": float(
                        columns[6].get_text(strip=True).replace("%", "").strip()
                    ),
                    "2023": float(
                        columns[7].get_text(strip=True).replace("%", "").strip()
                    ),
                }
                table_data.append(stats)

        return table_data  # Return the list of stats
    else:
        print(f"Failed to retrieve data from {url}. Status: {response.status_code}")
        return None


# Base URL
base_url = "https://www.teamrankings.com/nfl/stat/"

# URLs to scrape (these are paths to be added to the base URL)
urls = [
    "opponent-completion-pct",
    "opponent-rushing-yards-per-game",
    "opponent-passing-yards-per-game",
]

# Dictionary to hold all the results
all_data = {}

# Loop through each URL and scrape the data
for url_path in urls:
    full_url = base_url + url_path  # Combine base URL with specific stat URL path
    print(f"Fetching data from: {full_url}")

    data = scrape_site(full_url)

    if data:
        # Add the data to the dictionary with a unique key for each stat type
        stat_key = url_path.replace("-", "_")  # Clean up the key name
        all_data[stat_key] = data

    # Add a 10-second delay before making the next request
    print(f"Waiting 10 seconds before the next request...\n")
    time.sleep(10)

# Save all data to a JSON file
with open("table_data.json", "w") as f:
    json.dump(all_data, f, indent=2)

print(json.dumps(all_data, indent=2))  # Pretty print all aggregated data
