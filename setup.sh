#!/bin/bash
set -e
TOKEN="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"
REPO="BOOK"
USERNAME=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user | grep -o '"login":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "User: $USERNAME"
curl -s -X POST -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user/repos -d "{\"name\":\"$REPO\",\"private\":false}"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin "https://$TOKEN@github.com/$USERNAME/$REPO.git"
git push -u origin main
echo "Done: https://github.com/$USERNAME/$REPO"
