#!/bin/bash
exec supervisor --harmony -e 'html|js|css|jade' node app/index.js
