#!/bin/bash

# Script to update Docker base images for Java projects
# Target image: registry.exoscale-ch-gva-2-0.appuio.cloud/java-runtime-base:17-11

set -e

NEW_BASE_IMAGE="registry.exoscale-ch-gva-2-0.appuio.cloud/java-runtime-base:17-11"
BRANCH_NAME="update-docker-base-image"
BASE_BRANCH="dev-new"

# Array of projects to update (format: "name:path")
PROJECTS=(
    "api-gateway:/Users/aleksandarilic/Documents/github/claninfo/api-gateway"
    "dms-service:/Users/aleksandarilic/Documents/github/claninfo/dms-service"
    "dms-document-poller:/Users/aleksandarilic/Documents/github/claninfo/dms-document-poller"
    "notification-service:/Users/aleksandarilic/Documents/github/claninfo/notification-service"
    "reporting-service:/Users/aleksandarilic/Documents/github/claninfo/reporting-service"
    "db-transfer-syncer:/Users/aleksandarilic/Documents/github/claninfo/db-transfer-syncer"
    "camunda-bpmn:/Users/aleksandarilic/Documents/github/claninfo/camunda-bpmn"
)

# Function to update a single project
update_project() {
    local project_name=$1
    local project_path=$2

    echo "========================================="
    echo "Processing: $project_name"
    echo "========================================="

    cd "$project_path"

    # Check git status
    echo "Current git status:"
    git_status=$(git status --short)
    echo "$git_status"

    # Check if there are uncommitted changes
    if [ -n "$git_status" ]; then
        echo "⚠️  WARNING: Uncommitted changes detected!"
        echo "Options:"
        echo "  1. Stash changes and continue"
        echo "  2. Skip this project"
        read -p "Choose (1/2, or 's' to skip all prompts and stash): " choice

        if [ "$choice" == "2" ]; then
            echo "Skipping $project_name"
            return 0
        elif [ "$choice" == "1" ] || [ "$choice" == "s" ]; then
            echo "Stashing changes..."
            git stash push -m "Auto-stash before Docker base image update"
        fi
    fi

    # Check current branch
    current_branch=$(git branch --show-current)
    echo "Current branch: $current_branch"

    # Check if dev-new branch exists
    if git show-ref --verify --quiet "refs/heads/$BASE_BRANCH"; then
        echo "Branch $BASE_BRANCH exists locally"
        base_to_use="$BASE_BRANCH"
    elif git show-ref --verify --quiet "refs/remotes/origin/$BASE_BRANCH"; then
        echo "Branch $BASE_BRANCH exists on remote, fetching..."
        git fetch origin "$BASE_BRANCH:$BASE_BRANCH"
        base_to_use="$BASE_BRANCH"
    else
        echo "Branch $BASE_BRANCH not found, will use develop instead"
        base_to_use="develop"
    fi

    # Check if update branch already exists
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
        echo "Branch $BRANCH_NAME already exists, checking it out..."
        git checkout "$BRANCH_NAME"
    else
        echo "Creating new branch $BRANCH_NAME from $base_to_use"
        git checkout -b "$BRANCH_NAME" "$base_to_use"
    fi

    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        echo "ERROR: Dockerfile not found in $project_path"
        return 1
    fi

    echo "Updating Dockerfile..."

    # Show current FROM line
    echo "Current FROM line:"
    grep "^FROM" Dockerfile

    # Update the Dockerfile based on project
    if [ "$project_name" == "camunda-bpmn" ]; then
        # For Camunda, just update the tag
        sed -i.bak 's|registry.exoscale-ch-gva-2-0.appuio.cloud/java-runtime-base:17|registry.exoscale-ch-gva-2-0.appuio.cloud/java-runtime-base:17-11|g' Dockerfile
    else
        # For other projects, replace the entire base image
        sed -i.bak "s|FROM eclipse-temurin:[0-9]*-jre-jammy|FROM $NEW_BASE_IMAGE|g" Dockerfile
        sed -i.bak "s|FROM eclipse-temurin:[0-9]*-jdk-jammy|FROM $NEW_BASE_IMAGE|g" Dockerfile
    fi

    # Remove backup file
    rm -f Dockerfile.bak

    # Show new FROM line
    echo "New FROM line:"
    grep "^FROM" Dockerfile

    # Show diff
    echo "Git diff:"
    git diff Dockerfile

    echo ""
    echo "Project $project_name updated successfully!"
    echo ""
}

# Main execution
main() {
    echo "Starting Docker base image update for Java projects..."
    echo "Target base image: $NEW_BASE_IMAGE"
    echo ""

    for project in "${PROJECTS[@]}"; do
        project_name="${project%%:*}"
        project_path="${project#*:}"
        update_project "$project_name" "$project_path"
    done

    echo "========================================="
    echo "All projects processed!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "1. Review the changes in each project"
    echo "2. Test the builds"
    echo "3. Commit and push the changes"
    echo ""
    echo "To commit all changes, run:"
    for project in "${PROJECTS[@]}"; do
        project_path="${project#*:}"
        echo "  cd $project_path && git add Dockerfile && git commit -m 'Update Docker base image to java-runtime-base:17-11' && cd -"
    done
}

# Run main function
main
