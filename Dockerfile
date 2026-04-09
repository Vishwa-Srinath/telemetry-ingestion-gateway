# 1. Start with a tiny, official Node.js Linux computer (Alpine is a super lightweight version)
FROM node:20-alpine

# 2. Create a folder inside this tiny computer to hold our code
WORKDIR /app

# 3. Copy ONLY the package.json files first (This makes future builds much faster)
COPY package*.json ./

# 4. Install all dependencies inside the container
RUN npm install

# 5. Now copy the rest of your source code (src folder, tsconfig, etc.)
COPY . .

# 6. Compile the TypeScript into JavaScript (creates the /dist folder inside the container)
RUN npm run build

# 7. Tell the container that it needs to leave port 3000 open
EXPOSE 3000

# 8. The final command the container will run when it boots up
CMD ["npm", "start"]