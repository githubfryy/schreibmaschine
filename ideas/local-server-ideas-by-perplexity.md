i run my servers with debian trixie, newest docker and traefik as proxy. i have a domain schreibmaschine.schreibwerkstatt-berlin.de that shall be reach the app via https - but if i have the server at the workshop without internet and all are in the same wifi "schreibwerkstatt25" then i want an adress that is also easy to reach in the browser so that everyone can use the app without internet but with our local wifi


Perfect! I'll design a Docker deployment strategy that handles both your online production environment (with Traefik + HTTPS) and offline workshop scenarios. Here's a comprehensive solution for your Debian Trixie server setup:

## **Dual-Environment Docker Strategy**

### **Production Docker Configuration**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  schreibmaschine:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: schreibmaschine-prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_PATH=/app/data/schreibmaschine.db
      - LOG_LEVEL=info
    volumes:
      - ./data:/app/data
      - schreibmaschine-data:/app/data
    networks:
      - traefik-network
      - schreibmaschine-internal
    labels:
      # Traefik configuration for production
      - "traefik.enable=true"
      - "traefik.http.routers.schreibmaschine.rule=Host(`schreibmaschine.schreibwerkstatt-berlin.de`)"
      - "traefik.http.routers.schreibmaschine.entrypoints=websecure"
      - "traefik.http.routers.schreibmaschine.tls.certresolver=letsencrypt"
      - "traefik.http.services.schreibmaschine.loadbalancer.server.port=3000"
      - "traefik.docker.network=traefik-network"
    healthcheck:
      test: ["CMD", "bun", "run", "--silent", "-e", "fetch('http://localhost:3000/health').then(r => r.ok || process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  schreibmaschine-data:

networks:
  traefik-network:
    external: true
  schreibmaschine-internal:
    driver: bridge
```

### **Workshop (Offline) Docker Configuration**

```yaml
# docker-compose.workshop.yml
version: '3.8'

services:
  schreibmaschine-workshop:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: schreibmaschine-workshop
    restart: unless-stopped
    ports:
      - "80:3000"    # Direct port mapping for offline access
      - "3000:3000"  # Alternative port access
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_PATH=/app/data/schreibmaschine.db
      - LOG_LEVEL=info
      - WORKSHOP_MODE=true
      - LOCAL_DOMAIN=schreibwerkstatt.local
    volumes:
      - ./workshop-data:/app/data
    networks:
      - workshop-network
    extra_hosts:
      # Local domain resolution
      - "schreibwerkstatt.local:127.0.0.1"
      - "app.schreibwerkstatt.local:127.0.0.1"
    dns:
      - 8.8.8.8  # Fallback DNS
      - 1.1.1.1

  # Optional: Local DNS server for workshop
  dnsmasq:
    image: jpillora/dnsmasq
    container_name: workshop-dns
    restart: unless-stopped
    ports:
      - "53:53/udp"
    environment:
      - HTTP_USER=admin
      - HTTP_PASS=workshop2025
    volumes:
      - ./dnsmasq.conf:/etc/dnsmasq.conf
    networks:
      - workshop-network

networks:
  workshop-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### **Workshop DNS Configuration**

```bash
# dnsmasq.conf - Local domain resolution
address=/schreibwerkstatt.local/172.20.0.2
address=/app.schreibwerkstatt.local/172.20.0.2

# Provide DHCP for workshop WiFi devices
dhcp-range=172.20.100.100,172.20.100.200,12h
dhcp-option=6,172.20.0.3  # DNS server (dnsmasq itself)
```

## **Enhanced Dockerfile for Both Environments**

```dockerfile
# Dockerfile
FROM oven/bun:1.2.19 AS build
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb tsconfig.json biome.json ./
RUN --mount=type=cache,target=/root/.bun \
    bun install --frozen-lockfile

# Copy source and build
COPY src/ ./src/
COPY public/ ./public/
COPY test-templates.js ./

# Full validation
RUN bun run test:static

# Build optimized production bundle
ENV NODE_ENV=production
RUN bun build src/index.ts \
    --outdir dist \
    --target bun \
    --format esm \
    --minify && \
    bun run optimize:assets

# Production stage
FROM oven/bun:1.2.19-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S bunuser && \
    adduser -S bunuser -u 1001

WORKDIR /app

# Copy production artifacts
COPY --from=build --chown=bunuser:bunuser /app/dist ./dist
COPY --from=build --chown=bunuser:bunuser /app/public/dist ./public/dist
COPY --from=build --chown=bunuser:bunuser /app/src/views ./src/views
COPY --from=build --chown=bunuser:bunuser /app/package.json ./

# Create data directory
RUN mkdir -p data && chown bunuser:bunuser data

# Install only production dependencies
RUN --mount=type=cache,target=/root/.bun \
    bun install --production --frozen-lockfile

# Add workshop script
COPY --chown=bunuser:bunuser workshop-setup.sh ./
RUN chmod +x workshop-setup.sh

USER bunuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD bun run --silent -e "fetch('http://localhost:3000/health').then(r => r.ok || process.exit(1))" || exit 1

EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["bun", "run", "dist/index.js"]
```

## **Workshop Setup Scripts**

### **Workshop Deployment Script**

```bash
#!/bin/bash
# deploy-workshop.sh

echo "🎭 Deploying Schreibmaschine for Workshop..."

# Create workshop data directory
mkdir -p workshop-data

# Copy fresh database or use existing
if [ ! -f "workshop-data/schreibmaschine.db" ]; then
    echo "📋 Creating fresh workshop database..."
    cp data/schreibmaschine.db workshop-data/ 2>/dev/null || echo "No existing database found"
fi

# Build and start workshop container
echo "🚀 Building workshop container..."
docker-compose -f docker-compose.workshop.yml build

echo "🌐 Starting workshop services..."
docker-compose -f docker-compose.workshop.yml up -d

# Display access information
echo "✅ Workshop deployment complete!"
echo ""
echo "📱 Participants can access the app at:"
echo "   • http://schreibwerkstatt.local"
echo "   • http://app.schreibwerkstatt.local" 
echo "   • http://192.168.1.XXX (your server IP)"
echo "   • http://192.168.1.XXX:3000"
echo ""
echo "🔧 Admin access:"
echo "   • SSH: ssh user@192.168.1.XXX"
echo "   • Logs: docker-compose -f docker-compose.workshop.yml logs -f"
echo ""
echo "💾 Workshop data stored in: ./workshop-data/"
```

### **Router WiFi Configuration Helper**

```bash
#!/bin/bash
# wifi-setup.sh - Instructions for workshop router setup

cat 



    
    
    Schreibwerkstatt 2025
    


    
        🎭 Willkommen zur Schreibwerkstatt!
        
        {{#if isWorkshopMode}}
        
            📡 Verbunden mit: schreibwerkstatt25
            🏠 Lokaler Zugang: {{localDomain}}
        
        {{/if}}
        
        
            Aktuelle Workshops:
            {{#each workshops}}
            
                {{name}}
                
                    {{#each groups}}
                    
                        {{name}} 
                        ({{onlineCount}} online)
                    
                    {{/each}}
                
            
            {{/each}}
        
    


```

## **Deployment Commands**

### **Production Deployment**

```bash
# Start production with Traefik
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f schreibmaschine

# Update production
git pull && docker-compose -f docker-compose.prod.yml up -d --build
```

### **Workshop Deployment**

```bash
# Prepare workshop package
./deploy-workshop.sh

# Start workshop mode
docker-compose -f docker-compose.workshop.yml up -d

# Monitor workshop
docker-compose -f docker-compose.workshop.yml logs -f

# Backup workshop data
tar -czf workshop-backup-$(date +%Y%m%d).tar.gz workshop-data/
```

## **Access Patterns Summary**

### **Production Environment**
- **HTTPS**: `https://schreibmaschine.schreibwerkstatt-berlin.de`
- **Traefik Proxy**: Automatic Let's Encrypt certificates
- **Database**: Persistent volume with backups

### **Workshop Environment**
- **HTTP**: `http://192.168.1.10` (server IP)
- **Local Domain**: `http://schreibwerkstatt.local` (if DNS configured)
- **Alternative**: `http://app.schreibwerkstatt.local`
- **Port Access**: `http://192.168.1.10:3000`

### **Participant Instructions**
1. **Connect to WiFi**: "schreibwerkstatt25"
2. **Open Browser**: Any modern browser
3. **Go to**: `schreibwerkstatt.local` or `192.168.1.10`
4. **Select Workshop**: Choose your workshop group
5. **Join**: Click your name in the lobby

This setup gives you **maximum flexibility** - full production deployment with HTTPS when online, and simple, reliable local access for offline workshops. The containerized approach means identical behavior in both environments, and participants get easy-to-remember URLs regardless of internet connectivity!

