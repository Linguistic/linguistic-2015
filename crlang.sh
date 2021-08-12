#!/bin/bash

args=("$@")

if [ $# -eq 0 ] 
    then
        echo "No argument supplied"
elif hash msginit 2>/dev/null;
    then
        LANG_PATH="./locale/${args[0]}/LC_MESSAGES"
        mkdir -p $LANG_PATH
        msginit --input=./locale/templates/LC_MESSAGES/messages.pot --output-file="$LANG_PATH/messages.po" -l $1
else
    echo "GNU gettext tools are required to run this script. Please consult the README for links to where these tools may be downloaded."
fi

