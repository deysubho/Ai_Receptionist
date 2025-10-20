import os
from livekit.api.access_token import AccessToken, VideoGrants
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file in the same directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Get LiveKit credentials from environment variables
api_key = os.getenv("LIVEKIT_API_KEY")
api_secret = os.getenv("LIVEKIT_API_SECRET")

# Define the room and participant details
room_name = "playground-room"
participant_identity = "playground-user"

# Define the grant for the token
grant = VideoGrants(
    room_join=True,
    room=room_name,
    can_publish=True,
    can_subscribe=True,
)

# Create a new access token
token = AccessToken(api_key, api_secret).with_identity(participant_identity).with_grants(grant)

# Generate the JWT token
jwt_token = token.to_jwt()

print(f"Generated LiveKit Token for room '{room_name}' and participant '{participant_identity}':")
print(jwt_token)