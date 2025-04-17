# syntax=docker/dockerfile:1
# check=error=true

ARG RUBY_VERSION=3.3.6
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

# Rails app lives here
WORKDIR /rails

# Install base packages
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 wget libvips postgresql-client imagemagick && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

# Throw-away build stage to reduce size of final image
FROM base AS build


# Wget GeoLite2-City.mmdb to perform geolocation
# https://www.maxmind.com/en/accounts/1156416/geoip/downloads
# on scaleway https://city.s3.fr-par.scw.cloud/
ARG GEOLITE_CITY_NAME=GeoLite2-City_20250415
ENV GEOLITE_CITY_NAME=${GEOLITE_CITY_NAME}

RUN wget https://city.s3.fr-par.scw.cloud/${GEOLITE_CITY_NAME}.tar.gz && \
    tar -xzf ${GEOLITE_CITY_NAME}.tar.gz && \
    rm ${GEOLITE_CITY_NAME}.tar.gz && \
    mkdir -p /tmp && \
    mv ${GEOLITE_CITY_NAME}/GeoLite2-City.mmdb /tmp/GeoLite2-City.mmdb && \
    rm -rf ${GEOLITE_CITY_NAME}


# Install packages needed to build gems and node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libpq-dev node-gyp pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install JavaScript dependencies
ARG NODE_VERSION=18.18.0
ARG YARN_VERSION=1.22.22
ENV PATH=/usr/local/node/bin:$PATH
RUN curl -sL https://github.com/nodenv/node-build/archive/master.tar.gz | tar xz -C /tmp/ && \
    /tmp/node-build-master/bin/node-build "${NODE_VERSION}" /usr/local/node && \
    npm install -g yarn@$YARN_VERSION && \
    rm -rf /tmp/node-build-master

# Install application gems
COPY Gemfile Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

# Install node modules
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Make sure the directory exists before moving the file
RUN mkdir -p db && \
    mv /tmp/GeoLite2-City.mmdb db/GeoLite2-City.mmdb

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# Precompiling assets for production without requiring secret RAILS_MASTER_KEY
RUN SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile

RUN rm -rf node_modules

# Final stage for app image
FROM base

# Copy built artifacts: gems, application
COPY --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --from=build /rails /rails

RUN mkdir -p /rails/log /rails/tmp

# Create rails user and set up directory permissions
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    mkdir -p /rails/tmp/pids /rails/tmp/cache /rails/tmp/sockets /rails/log && \
    chown -R rails:rails /rails/tmp /rails/log /rails/db

USER 1000:1000

# Entrypoint prepares the database.
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start server via Thruster by default, this can be overwritten at runtime
EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
