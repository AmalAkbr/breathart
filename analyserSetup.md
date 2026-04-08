
psql :
user : brt
pass:BreathArt321

on  root 

```git clone https://github.com/umami-software/umami.git
cd umami
```

install pnpm -g then 
```
pnpm  install
```

psql

```
udo apt install postgresql postgresql-contrib

sudo -u postgres psql

CREATE DATABASE umami;

-- Create the user
CREATE USER brt WITH ENCRYPTED PASSWORD 'BreathArt321'; 

-- Grant privileges to the correct user
GRANT ALL PRIVILEGES ON DATABASE umami TO brt;

\q

```


⚙️ 4. Create .env file

Inside /umami folder:

nano .env

Paste:

DATABASE_URL=postgresql://brt:BreathArt321@localhost:5432/umami
HASH_SALT=replace_with_random_string

Generate salt:

openssl rand -base64 32
🧪 5. Build & initialize DB
npm run build
npm run db:migrate
▶️ 6. Run Umami with PM2

Using PM2:

PORT=3001 pm2 start npm --name "umami" -- start
pm2 save

Check:

pm2 list
🌐 7. Connect with Nginx (your existing setup)

Now configure Nginx for your subdomain.

Create file:

sudo nano /etc/nginx/sites-available/analytics

Paste:

server {
    listen 80;
    server_name analytics.breathartinstitute.in;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}

Enable:

sudo ln -s /etc/nginx/sites-available/analytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
🔐 8. Enable HTTPS
sudo certbot --nginx -d analytics.breathartinstitute.in
🔑 9. Access dashboard

Open:

https://analytics.breathartinstitute.in

Login:

username: admin
password: umami

👉 Change password immediately.

🔌 10. Add tracking to your Node app

After login → add your website → copy script:

```<script async defer data-website-id="YOUR_ID" src="https://analytics.breathartinstitute.in/script.js"></script>

Paste into your frontend <head>.
```