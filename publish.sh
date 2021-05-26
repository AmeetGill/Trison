#!/usr/bin/env bash
echo "Compiling Project"
npm compile
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
npm publish
