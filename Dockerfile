FROM node:20-alpine

WORKDIR /usr/src/app

# Install bash and other essentials
RUN apk add --no-cache bash

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5173

# Start with bash so the container stays alive
CMD ["/bin/bash"]
