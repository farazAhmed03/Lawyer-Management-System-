# Node.js official image
FROM node:18

# App ke liye working directory
WORKDIR /app

# Package.json copy karke dependencies install karo
COPY package*.json ./
RUN npm install --production

# Code copy karo
COPY . .

# Port expose karo
EXPOSE 5000

# App start command
CMD ["npm", "start"]
