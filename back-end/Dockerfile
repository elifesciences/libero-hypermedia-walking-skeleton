FROM node:10.16.3-alpine

WORKDIR /app

COPY ./ ./
RUN npm install && \
    mkdir -p db/actions db/articles db/users
CMD ["npm", "run", "start"]
