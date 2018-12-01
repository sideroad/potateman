FROM node:10-alpine

WORKDIR /root/
COPY src /root/src
COPY *.json /root/
COPY *.js /root/
COPY *.sh /root/
COPY .babelrc /root/
COPY .eslintrc /root/

ENV GLOBAL_HOST potateman.now.sh
ENV GLOBAL_PORT 443
ENV NODE_PATH ./src
ENV NPM_CONFIG_PRODUCTION false
ENV POTATE_HOST potateman.now.sh

RUN npm i --unsafe-perm
EXPOSE 3000
CMD ["npm", "start"]
