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
# Releases
# - https://github.com/PDCbc/query_importer/releases
#
#
FROM phusion/passenger-nodejs
MAINTAINER derek.roberts@gmail.com
ENV RELEASE 0.2.1


# Packages, including update to Node.js 0.12
#
RUN curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
RUN apt-get update; \
    apt-get install -y \
      nodejs \
      python2.7\
      git; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# Prepare /app/ folder
#
WORKDIR /app/
RUN git clone https://github.com/pdcbc/queryImporter.git -b ${RELEASE} .; \
    npm config set python /usr/bin/python2.7; \
    npm install


# Create startup script and make it executable
#
RUN mkdir -p /etc/service/app/; \
    ( \
      echo "#!/bin/bash"; \
      echo "#"; \
      echo "set -e -o nounset"; \
      echo ""; \
      echo ""; \
      echo "# Set variables"; \
      echo "#"; \
      echo "SKIP_INITS=\${SKIP_INITS:-false}"; \
      echo ""; \
      echo ""; \
      echo "# Start service"; \
      echo "#"; \
      echo "cd /app/"; \
      echo "/sbin/setuser app SKIP_INITS=\${SKIP_INITS} node index.js \\"; \
      echo "  --mongo-host=hubdb --mongo-db=query_composer_development --mongo-port=27017"; \
    )  \
      >> /etc/service/app/run; \
    chmod +x /etc/service/app/run


# Run Command
#
CMD ["/sbin/my_init"]
