
ARG NODE_VERSION=24.5.0

FROM node:${NODE_VERSION}-alpine

# Create app directory
WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev


# Install dependencies (use cache)
COPY package*.json ./
#RUN npm ci 

# Copy source
COPY . .

EXPOSE 4000

ENV NODE_ENV=development
# Use dev script for fast iteration; change to "npm start" for production builds
CMD ["npm", "run", "dev"]