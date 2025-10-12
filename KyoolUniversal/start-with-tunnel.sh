#!/bin/bash
# Start Expo with tunnel for OAuth development

echo "🚀 Starting Expo with development tunnel for OAuth..."
echo ""
echo "This will create a public HTTPS URL that Google OAuth accepts."
echo "Copy the tunnel URL and add '/oauth' to your Google Console redirect URIs."
echo ""
echo "Example: https://abc123-yourname-8081.exp.direct/oauth"
echo ""
echo "Press Ctrl+C to stop when done."
echo ""

npx expo start --tunnel