#!/usr/bin/env bash

npm run start-cgi &
npm run start-client &

# concurrently \"npm run start-cgi\" \"npm run start-client\"
