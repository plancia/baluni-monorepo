#!/bin/bash

# Ensure both source and destination directories are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <source_directory> <destination_directory>"
    exit 1
fi

SOURCE_DIR="$1"
DEST_DIR="$2"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Source directory does not exist: $SOURCE_DIR"
    exit 1
fi

# Create the destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Generate a list of all files to be copied, excluding .git and git-ignored files
cd "$SOURCE_DIR"
git ls-files --cached --others --exclude-standard -z > /tmp/files_to_copy.txt

# Create a tar archive with the selected files
tar --null -czf /tmp/archive.tar.gz --files-from=/tmp/files_to_copy.txt

# Extract the tar archive to the destination directory
tar -xzf /tmp/archive.tar.gz -C "$DEST_DIR"

# Remove the temporary files
rm /tmp/archive.tar.gz /tmp/files_to_copy.txt

echo "Copy completed from $SOURCE_DIR to $DEST_DIR, ignoring git-ignored files and the .git directory."
