#!/usr/bin/env bash

set -e
if [ -d "trison" ]
then
  echo "Removing previous directory"
  rm -r trison
fi
echo "Compiling Project"
npm run compile
echo "Running Tests"
npm test
echo "Copying package.json"
cp package.json trison/
echo "Copying Readme.md"
cp README.md trison/
echo "Changing Directory"
# shellcheck disable=SC2164
cd trison
echo "Publish"
npm/
