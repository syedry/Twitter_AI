# Digital Ocean Deployment Guide

Server Details:
- IP Address: 159.203.86.216
- OS: Ubuntu 24.10 x64
- Default Password: 1234

## 1. Initial Server Setup

```bash
# SSH into your server
ssh root@159.203.86.216

# Update system packages
apt update && apt upgrade -y

# Create a new user
adduser deploy
# Enter password: 1234

# Add user to sudo group
usermod -aG sudo deploy

# Enable password authentication temporarily (if needed)
nano /etc/ssh/sshd_config
# Set PasswordAuthentication yes
systemctl restart sshd

# Switch to deploy user
su - deploy
```

## 2. Install Node.js and Dependencies

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install build essentials
sudo apt install -y build-essential

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Git
sudo apt install -y git

# Install PM2 globally
sudo npm install -g pm2
```

## 3. Configure PostgreSQL

```bash
# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE tweetforge;"
sudo -u postgres psql -c "CREATE USER tweetforge WITH PASSWORD '1234';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tweetforge TO tweetforge;"

# Configure PostgreSQL to accept connections
sudo nano /etc/postgresql/14/main/postgresql.conf
# Update listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add line: host all all 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## 4. Setup Application

```bash
# Create application directory
mkdir -p ~/apps
cd ~/apps

# Clone repository
git clone https://github.com/nazran7/twitter-ai-agent.git
cd twitter-ai-agent

# Install dependencies
npm install

# Create environment files
cp .env.example .env
```

Update the .env file with your configuration:
```env
DATABASE_URL="postgresql://tweetforge:1234@localhost:5432/tweetforge"
OPENAI_API_KEY="your-openai-key"
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
TWITTER_CALLBACK_URL="http://159.203.86.216:3001/api/auth/twitter/callback"
FRONTEND_URL="http://159.203.86.216:5173"
APIFY_API_TOKEN="your-apify-token"
```

## 5. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy
```

## 6. Build and Deploy

```bash
# Build frontend
npm run build

# Start backend server with PM2
cd server
pm2 start src/index.ts --name tweetforge-api

# Serve frontend with PM2
cd ..
pm2 serve dist 5173 --name tweetforge-frontend --spa

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs
```

## 7. Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/tweetforge

# Add the following configuration:
server {
    listen 80;
    server_name 159.203.86.216;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/tweetforge /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 8. Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 9. SSL Setup (Optional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 10. Monitoring and Maintenance

```bash
# View application logs
pm2 logs

# Monitor application status
pm2 status

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

## Troubleshooting

1. Database Connection Issues:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

2. Application Issues:
```bash
# Check PM2 logs
pm2 logs tweetforge-api
pm2 logs tweetforge-frontend

# Restart applications
pm2 restart all
```

3. Nginx Issues:
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

4. Firewall Issues:
```bash
# Check firewall status
sudo ufw status

# List all active rules
sudo ufw status verbose
``` 