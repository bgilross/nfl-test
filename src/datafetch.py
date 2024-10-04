# import os
# import json
# import requests

# # URL template for the API (replace the team number in the loop)
# BASE_URL = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2024/types/2/teams/{}/statistics"
# # Number of NFL teams (adjust if necessary)
# NUM_TEAMS = 34

# # Folder where you want to save the combined JSON data
# DATA_FOLDER = os.path.join(os.path.dirname(__file__), "data")

# # Ensure the data folder exists
# os.makedirs(DATA_FOLDER, exist_ok=True)

# # Path to save the combined data file
# OUTPUT_FILE = os.path.join(DATA_FOLDER, "combined_teams_stats_data.json")

# # List to hold all the team data
# all_teams_data = []

# # Loop through all the team pages and fetch data
# for team_id in range(1, NUM_TEAMS + 1):
#     try:
#         # Construct the URL for the team
#         url = BASE_URL.format(team_id)
#         print(f"Fetching data for team {team_id}...")

#         # Send GET request to fetch the team's data
#         response = requests.get(url)

#         # Check if the response was successful
#         if response.status_code == 200:
#             # Parse the JSON response
#             team_data = response.json()

#             # Add the team's data to the list
#             all_teams_data.append(team_data)
#         else:
#             print(
#                 f"Failed to fetch data for team {team_id}, status code: {response.status_code}"
#             )

#     except Exception as e:
#         print(f"Error fetching data for team {team_id}: {str(e)}")

# # Save the combined data to a file
# try:
#     with open(OUTPUT_FILE, "w") as f:
#         json.dump(all_teams_data, f, indent=4)
#     print(f"Combined data for all teams saved to {OUTPUT_FILE}")
# except Exception as e:
#     print(f"Error saving combined data: {str(e)}")


# import os
# import json

# # Path to the combined data file
# DATA_FOLDER = os.path.join(os.path.dirname(__file__), "data")
# COMBINED_FILE = os.path.join(DATA_FOLDER, "combined_teams_general_data.json")

# # Load the combined data file
# try:
#     with open(COMBINED_FILE, "r") as f:
#         combined_data = json.load(f)
# except FileNotFoundError:
#     print(f"Error: {COMBINED_FILE} not found.")
#     exit()

# # Create a dictionary for the team legend (ID -> Team Name)
# team_legend = {}

# # Loop through each team's data
# for team in combined_data:
#     try:
#         # Extract the team ID and name
#         team_id = team["id"]  # Assuming 'id' is the key for team ID
#         team_name = team["name"]  # Assuming 'name' is the key for team name

#         # Add the ID and name to the legend dictionary
#         team_legend[team_id] = team_name
#     except KeyError:
#         print(f"Warning: Missing team ID or name for {team}. Skipping.")
#         continue

# # Print out the legend (ID -> Team Name)
# print("Team Legend (ID -> Team Name):")
# for team_id, team_name in team_legend.items():
#     print(f"{team_id}: {team_name}")

# # Optional: Save the legend to a new file
# LEGEND_FILE = os.path.join(DATA_FOLDER, "team_legend.json")
# try:
#     with open(LEGEND_FILE, "w") as f:
#         json.dump(team_legend, f, indent=4)
#     print(f"Team legend saved to {LEGEND_FILE}")
# except Exception as e:
#     print(f"Error saving team legend: {str(e)}")


import os
import json
import re

# Path to the combined data file that only has IDs
COMBINED_FILE_WITH_IDS = os.path.join("data", "combined_teams_stats_data.json")

# Path to the legend file that maps team IDs to team names
TEAM_LEGEND_FILE = os.path.join("data", "team_legend.json")

# Load the team legend file
try:
    with open(TEAM_LEGEND_FILE, "r") as f:
        team_legend = json.load(f)
except FileNotFoundError:
    print(f"Error: {TEAM_LEGEND_FILE} not found.")
    exit()

# Load the file that contains team data but without names
try:
    with open(COMBINED_FILE_WITH_IDS, "r") as f:
        data_with_ids = json.load(f)
except FileNotFoundError:
    print(f"Error: {COMBINED_FILE_WITH_IDS} not found.")
    exit()

# Regular expression pattern to extract team ID from the team URL
team_id_pattern = re.compile(r"/teams/(\d+)\?")

# Go through each object in the data and add the team name based on the team ID
for obj in data_with_ids:
    # Extract the team URL from the "team" field
    team_url = obj.get("team", {}).get("$ref", "")

    # Use regex to extract the team ID from the URL
    match = team_id_pattern.search(team_url)
    if match:
        team_id = match.group(1)  # Extract the team ID (e.g., '1' from 'teams/1')

        # Find the corresponding team name from the legend
        team_name = team_legend.get(team_id)

        if team_name:
            # Add the team name to the object
            obj["team_name"] = team_name
        else:
            print(f"Warning: No team name found for team ID {team_id}")
    else:
        print(f"Warning: Could not extract team ID from {team_url}")

# Save the modified data to a new file
OUTPUT_FILE = os.path.join("data", "modified_data_with_team_names.json")
try:
    with open(OUTPUT_FILE, "w") as f:
        json.dump(data_with_ids, f, indent=4)
    print(f"Modified data with team names saved to {OUTPUT_FILE}")
except Exception as e:
    print(f"Error saving modified data: {str(e)}")
