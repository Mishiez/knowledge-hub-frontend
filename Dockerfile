# Stage 1: build the app
FROM node:20-alpine AS build

WORKDIR /app

# Copy only dependency manifests first, so Docker caches this layer
# and skips reinstalling node_modules unless these files actually change
COPY package.json package-lock.json ./
RUN npm ci

# Now copy the rest of the source and build the production bundle
COPY . .
RUN npm run build

# Stage 2: serve the built output with a lightweight web server
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]