#!/bin/bash

# Mavit Setup Script
# This script helps initialize the Mavit project for development

set -e

echo "🚀 Mavit Setup Script"
echo "==================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Create environment files if they don't exist
echo -e "${BLUE}📄 Setting up environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating backend/.env from template...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Backend .env file created${NC}"
else
    echo -e "${GREEN}✅ Backend .env file already exists${NC}"
fi

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Creating root .env from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Root .env file created${NC}"
else
    echo -e "${GREEN}✅ Root .env file already exists${NC}"
fi

echo ""

# Create logs directory
echo -e "${BLUE}📁 Creating logs directory...${NC}"
mkdir -p backend/logs
echo -e "${GREEN}✅ Logs directory created${NC}"
echo ""

# Ask user what they want to do
echo -e "${BLUE}🔧 What would you like to do?${NC}"
echo "1. Full setup (recommended for first time)"
echo "2. Start development environment"
echo "3. Build and start production environment"
echo "4. Just create environment files (already done above)"
echo "5. Reset everything (dangerous - removes all data)"
echo ""

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo -e "${BLUE}🏗️  Starting full setup...${NC}"
        echo ""
        
        echo -e "${BLUE}📦 Building Docker images...${NC}"
        docker-compose build
        echo -e "${GREEN}✅ Docker images built successfully${NC}"
        echo ""
        
        echo -e "${BLUE}🚀 Starting services...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✅ Services started${NC}"
        echo ""
        
        echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
        sleep 15
        
        echo -e "${BLUE}🗄️  Running database migrations...${NC}"
        docker-compose exec mavit_backend npm run db:generate
        docker-compose exec mavit_backend npm run db:migrate
        echo -e "${GREEN}✅ Database migrations completed${NC}"
        echo ""
        
        echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
        echo ""
        echo -e "${BLUE}📍 Access your application at:${NC}"
        echo "   🌐 Frontend: http://localhost:3000"
        echo "   🔧 Backend API: http://localhost:3001"
        echo "   📚 API Documentation: http://localhost:3001/api-docs"
        echo "   ❤️  Health Check: http://localhost:3001/health"
        ;;
    2)
        echo -e "${BLUE}🚀 Starting development environment...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✅ Development environment started${NC}"
        echo ""
        echo -e "${BLUE}📍 Access your application at:${NC}"
        echo "   🌐 Frontend: http://localhost:3000"
        echo "   🔧 Backend API: http://localhost:3001"
        echo "   📚 API Documentation: http://localhost:3001/api-docs"
        ;;
    3)
        echo -e "${BLUE}🏭 Building and starting production environment...${NC}"
        docker-compose -f docker-compose.prod.yml build
        docker-compose -f docker-compose.prod.yml up -d
        echo -e "${GREEN}✅ Production environment started${NC}"
        ;;
    4)
        echo -e "${GREEN}✅ Environment files are ready${NC}"
        echo -e "${YELLOW}⚠️  Don't forget to update the values in the .env files before running the application${NC}"
        ;;
    5)
        echo -e "${RED}⚠️  This will remove ALL Docker containers, volumes, and data. Are you sure? (y/N)${NC}"
        read -p "" confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            echo -e "${RED}🗑️  Removing all Mavit containers and data...${NC}"
            docker-compose down -v --remove-orphans
            docker-compose -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
            docker system prune -f
            echo -e "${GREEN}✅ Everything has been reset${NC}"
        else
            echo -e "${BLUE}❌ Reset cancelled${NC}"
        fi
        ;;
    *)
        echo -e "${RED}❌ Invalid option selected${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📝 Useful commands:${NC}"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Rebuild: docker-compose build --no-cache"
echo "   Enter backend container: docker-compose exec mavit_backend bash"
echo "   Enter frontend container: docker-compose exec mavit_frontend sh"
echo ""

echo -e "${GREEN}🎊 Happy coding with Mavit!${NC}"
echo -e "${BLUE}   Developed with ❤️  by Maver Tech${NC}"