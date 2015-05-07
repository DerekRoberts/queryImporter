#!/bin/bash -i
#
set -e -o nounset

# Port for MongoDB
#

MONGO_PORT=27017

# Script directory, useful for running scripts from scripts
#
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )


# Npm deoendencies for importer, import to Mongo
#
cd $DIR

# Install node version manager, and get the correct version:
#
echo "---------------------------------------"
echo "Installing NVM to manage node versions"
echo "---------------------------------------"
curl https://raw.githubusercontent.com/creationix/nvm/v0.16.1/install.sh | sh > /dev/null

#alias brc='source ~/.bashrc'

export NVM_DIR="/home/vagrant/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "---------------------------------------"
echo "Installing node version 0.12.2, this may take some time."
echo "---------------------------------------"
nvm install 0.12.2 

# Install the application dependencies
#
echo "---------------------------------------"
echo "Install QueryImporter dependencies"
echo "---------------------------------------"
npm install  > /dev/null

# Run the importer
#
echo "---------------------------------------"
echo "Starting Import ...."
echo "---------------------------------------"
node index.js import --mongo-host=127.0.0.1 --mongo-db=query_composer_development --mongo-port=$MONGO_PORT
