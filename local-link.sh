#!/usr/bin/env bash
echo "Compiling Project"
npm compile
echo "Running Tests"
echo "Copying package.json"
cp package.json trison/
echo "Changing Directory"
# shellcheck disable=SC2164
cd trison
echo "Linking"
npm link
