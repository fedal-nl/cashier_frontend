FROM node:20

LABEL org.opencontainers.image.source=https://github.com/fedal-nl/cashier_frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]