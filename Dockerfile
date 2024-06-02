# Uporabimo Node.js sliko kot osnovo
FROM node:20.11.0

# Nastavimo delovno mapo
WORKDIR /app

# Kopiramo package.json in package-lock.json v delovno mapo
COPY package*.json ./

# Namestimo odvisnosti
RUN npm install

# Kopiramo ostale datoteke aplikacije
COPY . .

# Namestimo Prettier za statično analizo
RUN npm install prettier -g

# Nastavimo privzeti ukaz
CMD ["prettier", "--check", "."]
