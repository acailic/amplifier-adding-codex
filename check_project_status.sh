#!/bin/bash

echo "=== Project Status Summary ==="

projects=(
    "api-gateway"
    "dms-service"
    "dms-document-poller"
    "notification-service"
    "reporting-service"
    "db-transfer-syncer"
    "camunda-bpmn"
    "swarm-auth-service"
)

for proj in "${projects[@]}"; do
    echo ""
    echo "Project: $proj"
    cd "/Users/aleksandarilic/Documents/github/claninfo/$proj" 2>/dev/null || continue
    echo "  Current branch: $(git branch --show-current)"

    if git branch -a | grep -q 'dev-new'; then
        echo "  Has dev-new: Yes"
    else
        echo "  Has dev-new: No"
    fi

    uncommitted=$(git status --short | wc -l | tr -d ' ')
    echo "  Uncommitted changes: $uncommitted file(s)"

    if [ "$uncommitted" -gt 0 ]; then
        echo "  Files with changes:"
        git status --short | head -3
    fi
done
