#!/bin/sh

# Simple version bump script for current package
# Usage: sh scripts/bump.sh [version]
# 
# Version: patch, minor, major, or exact version (e.g., 1.0.0)
#
# Examples:
# sh scripts/bump.sh minor
# sh scripts/bump.sh patch
# sh scripts/bump.sh 2.0.1

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    printf "${BLUE}[INFO]${NC} %s\n" "$1"
}

print_success() {
    printf "${GREEN}[SUCCESS]${NC} %s\n" "$1"
}

print_error() {
    printf "${RED}[ERROR]${NC} %s\n" "$1"
}

# Function to validate version format
is_valid_version() {
    echo "$1" | grep -q '^[0-9]\+\.[0-9]\+\.[0-9]\+$'
}

# Function to increment version
increment_version() {
    current_version="$1"
    increment_type="$2"
    
    major=$(echo "$current_version" | cut -d'.' -f1)
    minor=$(echo "$current_version" | cut -d'.' -f2)
    patch=$(echo "$current_version" | cut -d'.' -f3)
    
    case $increment_type in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch")
            patch=$((patch + 1))
            ;;
        *)
            print_error "Invalid increment type: $increment_type"
            return 1
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

# Function to get current version from package.json
get_current_version() {
    package_path="$1"
    if [ ! -f "$package_path" ]; then
        print_error "Package.json not found: $package_path"
        return 1
    fi
    
    grep -o '"version": *"[^"]*"' "$package_path" | sed 's/"version": *"\([^"]*\)"/\1/'
}

# Function to update version in package.json
update_package_version() {
    package_path="$1"
    new_version="$2"
    
    if [ ! -f "$package_path" ]; then
        print_error "Package.json not found: $package_path"
        return 1
    fi
    
    # Create backup
    cp "$package_path" "$package_path.backup"
    
    # Update version using sed
    sed -i "s/\"version\": *\"[^\"]*\"/\"version\": \"$new_version\"/" "$package_path"
    
    # Verify the change
    updated_version=$(get_current_version "$package_path")
    if [ "$updated_version" = "$new_version" ]; then
        print_success "Updated $package_path to version $new_version"
        rm "$package_path.backup"
        return 0
    else
        print_error "Failed to update $package_path"
        mv "$package_path.backup" "$package_path"
        return 1
    fi
}

# Function to display usage
show_usage() {
    echo "Usage: $0 [version]"
    echo ""
    echo "Version:"
    echo "  patch    - Increment patch version (0.0.X)"
    echo "  minor    - Increment minor version (0.X.0)"
    echo "  major    - Increment major version (X.0.0)"
    echo "  X.Y.Z    - Set exact version"
    echo ""
    echo "Examples:"
    echo "  $0 minor"
    echo "  $0 patch" 
    echo "  $0 2.0.1"
}

# Main function
main() {
    if [ $# -ne 1 ]; then
        show_usage
        exit 1
    fi
    
    version="$1"
    package_path="./package.json"
    
    # Check if package.json exists in current directory
    if [ ! -f "$package_path" ]; then
        print_error "No package.json found in current directory"
        exit 1
    fi
    
    print_info "Version specification: $version"
    
    # Determine new version
    if [ "$version" = "patch" ] || [ "$version" = "minor" ] || [ "$version" = "major" ]; then
        current_version=$(get_current_version "$package_path")
        
        if [ $? -ne 0 ]; then
            print_error "Failed to get current version from package.json"
            exit 1
        fi
        
        print_info "Current version: $current_version"
        
        new_version=$(increment_version "$current_version" "$version")
        if [ $? -ne 0 ]; then
            exit 1
        fi
    elif is_valid_version "$version"; then
        new_version="$version"
    else
        print_error "Invalid version format: $version"
        print_error "Version must be 'patch', 'minor', 'major', or a valid version number (e.g., 1.0.0)"
        exit 1
    fi
    
    print_info "New version will be: $new_version"
    
    # Update package.json
    update_package_version "$package_path" "$new_version"
    
    if [ $? -eq 0 ]; then
        print_success "Successfully updated package.json to version $new_version!"
    else
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
