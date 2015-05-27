#!/bin/bash

# Clean the current Javascript arrays
rm -f ./locale/**/*.js
rm -f ./locale/**/*.json

# Loop through each language and generate the JSON files
for dir in ./locale/* ; do
    message_path="$dir/LC_MESSAGES";
    file_path="$message_path/messages.po";
    if [ -f $file_path ]; then
        ./node_modules/i18n-abide/bin/compile-json $message_path ./locale
    fi
done