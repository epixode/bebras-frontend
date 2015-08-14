
Install nvm:

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.26.0/install.sh | bash

Install node:

    nvm install v0.12

Install bower, supervisor, and grunt-cli globally:

    npm install -g bower supervisor grunt-cli

Install node modules into node_modules:

    npm install

Install bower components into assets/bower_components:

    bower install

Start the application:

    supervisor --harmony app/index.js
