#!/bin/bash
set -e

TOKEN="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"
REPO="BOOK"

# Get username
USERNAME=$(curl -s -H "Authorization: token $TOKEN" \
  https://api.github.com/user | python3 -c "import sys,json; print(json.load(sys.stdin)['login'])")

echo "GitHub user: $USERNAME"

# Create repo
echo "Creating repository..."
curl -s -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO\",\"description\":\"Personal knowledge base\",\"auto_init\":false,\"private\":false}" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('Created:', d.get('html_url', d.get('message','')))"

# Init git and push
cd "$(dirname "$0")"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin "https://$TOKEN@github.com/$USERNAME/$REPO.git"
git push -u origin main

echo ""
echo "Done! Repository: https://github.com/$USERNAME/$REPO"
echo "Pages will be available at: https://$USERNAME.github.io/$REPO"
echo ""
echo "Enable GitHub Pages:"
echo "  Settings → Pages → Source: GitHub Actions"
