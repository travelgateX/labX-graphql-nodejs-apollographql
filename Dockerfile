FROM node:9.9
LABEL Mantainer="Pere Balaguer <pbalaguer@xmltravelgate.com>" Lang="nodejs"

ENV PORT=8080

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
COPY package*.json /labx/
WORKDIR /labx

RUN yarn install --production \
    && chmod +x /usr/local/bin/dumb-init

COPY . /labx/

RUN chown -R node:node /labx

# Without this node fails miserably
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
EXPOSE ${PORT}
USER node
CMD ["node", "main.js"]
