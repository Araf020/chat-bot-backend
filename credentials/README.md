# Google Calendar Credentials

This directory will store the OAuth credentials for Google Calendar integration.

## Required files:

1. `credentials.json` - Client ID and secret from Google Cloud Console
2. `token.json` - Generated after user authorization (will be created automatically)

## How to get credentials.json:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Enable the Google Calendar API
5. Go to "APIs & Services" > "Credentials"
6. Click "Create credentials" > "OAuth client ID"
7. Select "Desktop application" as the application type
8. Name your OAuth client
9. Download the JSON file and save it as `credentials.json` in this directory

Note: Never commit these files to version control. They should be added to .gitignore.