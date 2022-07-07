FROM alpine

# Install dependencies
RUN apk add --quiet --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      npm

# Confgiure pupeteer for preisntalled chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Prepare code
WORKDIR /root
COPY . .
RUN npm ci
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]
