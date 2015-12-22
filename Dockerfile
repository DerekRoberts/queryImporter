# Dockerfile for the PDC's query_importer service
#
#
# Imports queries from GitHub repo into HubDB.  Links to HubDB.
#
# Example:
# sudo docker pull pdcbc/query_importer
# sudo docker run --rm --name=query_importer -h query_importer \
#   --link hubdb:hubdb \
#   local/query_importer:latest
#
# Linked containers
# - HubDB:          --link hubdb:hubdb
#
# Modify default settings
# - Skip initiative
#     queries?:     -e SKIP_INITS=<yes/no>
#
#
FROM phusion/passenger-nodejs
MAINTAINER derek.roberts@gmail.com


# Packages, including update to Node.js 0.12
#
RUN apt-get update; \
    apt-get install -y \
      libkrb5-dev \
      python2.7; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# Prepare /app/ folder
#
WORKDIR /app/
COPY . .
RUN npm config set python /usr/bin/python2.7; \
    npm update -g npm; \
    npm install


# Run Command
#
CMD SKIP_INITS=${SKIP_INITS:-false} node index.js import --mongo-host=hubdb \
      --mongo-db=query_composer_development --mongo-port=27017
