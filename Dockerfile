# Build Stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run generate-data
RUN npm run build

# Production Stage
FROM nginx:stable-alpine
# Copy build assets to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html
# Copy public transactions.json if it exists (it should be in dist after build)
# Note: In Vite, files in /public are copied to the root of /dist
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
