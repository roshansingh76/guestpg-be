# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and prisma schema before npm install
# so postinstall (prisma generate) can find the schema
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm install

COPY . .
RUN npm run build

# --- Production stage ---
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8585

CMD ["npm", "start"]
