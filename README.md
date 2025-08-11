Alright — here’s a polished `README.md` that you can drop straight into your repo.

It’s clean, professional, and GitHub-ready with proper headings, code blocks, and clear steps.

---

```markdown
# 🚀 Dockerized Node.js Service Deployment via GitHub Actions

## 📌 Overview
This project demonstrates:
- Building a simple **Node.js** service with protected routes.
- Dockerizing the service for portability.
- Deploying to a **remote Linux server** (AWS/DigitalOcean/etc.).
- Automating build & deploy with **GitHub Actions**.
- Managing secrets securely via **GitHub Secrets**.

---

## 🛠 1. Create the Node.js Service

### **1.1 Project Structure**
```

Dockerized-Service/
├── app.js
├── package.json
├── .env           # Not committed to git
├── .gitignore
└── Dockerfile

````

---

### **1.2 app.js**
```javascript
require('dotenv').config();
const express = require('express');
const app = express();

const port = 3000;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const secretMessage = process.env.SECRET_MESSAGE;

// Basic Auth Middleware
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.set('WWW-Authenticate', 'Basic');
    return res.status(401).send('Authentication required.');
  }

  const [scheme, encoded] = authHeader.split(' ');
  if (scheme !== 'Basic') return res.status(400).send('Bad request.');

  const decoded = Buffer.from(encoded, 'base64').toString();
  const [user, pass] = decoded.split(':');

  if (user === username && pass === password) {
    return next();
  }
  res.status(403).send('Invalid credentials.');
}

app.get('/', (req, res) => res.send('Hello, world!'));
app.get('/secret', auth, (req, res) => res.send(secretMessage));

app.listen(port, () => console.log(`Listening on port ${port}`));
````

---

### **1.3 package.json**

```json
{
  "name": "node-secret-service",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "dotenv": "^17.0.0",
    "express": "^4.18.2"
  }
}
```

---

### **1.4 .env**

```env
SECRET_MESSAGE=This is the secret!
USERNAME=admin
PASSWORD=changeme
```

---

### **1.5 .gitignore**

```
node_modules/
.env
```

---

### **1.6 Test Locally**

```bash
npm install
npm start
```

Visit:

* `http://localhost:3000` → `Hello, world!`
* `http://localhost:3000/secret` → prompts for Basic Auth.

---

## 🛠 2. Dockerize the Node.js Service

### **2.1 Dockerfile**

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

### **2.2 Build & Run Locally**

```bash
docker build -t node-secret-service .
docker run --env-file .env -p 3000:3000 node-secret-service
```

---

## 🖥 3. Setup Remote Linux Server

Example with **AWS EC2 (Ubuntu)**:

```bash
ssh -i "key.pem" ubuntu@<EC2_PUBLIC_IP>

sudo apt update && sudo apt upgrade -y
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker
```

---

## ⚙️ 4. Deploy via GitHub Actions

We’ll:

1. Build the Docker image in GitHub Actions.
2. Push to **Docker Hub** (or GHCR).
3. SSH into the server & run the container.

---

### **4.1 Store GitHub Secrets**

Go to **Repo → Settings → Secrets → Actions** and add:

* `DOCKERHUB_USERNAME`
* `DOCKERHUB_TOKEN`
* `SERVER_IP`
* `SERVER_USER`
* `SERVER_SSH_KEY`
* `USERNAME`
* `PASSWORD`
* `SECRET_MESSAGE`

---

### **4.2 .github/workflows/deploy.yml**

```yaml
name: Deploy Dockerized Node.js Service

on:
  push:
    branches: [ "main" ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push Docker image
        run: |
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/node-secret-service:latest .
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/node-secret-service:latest

      - name: Deploy to remote server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            docker pull ${{ secrets.DOCKERHUB_USERNAME }}/node-secret-service:latest
            docker stop node-secret-service || true
            docker rm node-secret-service || true
            echo "USERNAME=${{ secrets.USERNAME }}" > .env
            echo "PASSWORD=${{ secrets.PASSWORD }}" >> .env
            echo "SECRET_MESSAGE=${{ secrets.SECRET_MESSAGE }}" >> .env
            docker run -d --env-file .env -p 3000:3000 --name node-secret-service ${{ secrets.DOCKERHUB_USERNAME }}/node-secret-service:latest
```

---

## ✅ Verification

After pushing to `main`, GitHub Actions will:

1. Build & push the Docker image to Docker Hub.
2. SSH into your server.
3. Pull the latest image & run it with `.env` secrets.

Visit:

```
http://<SERVER_IP>:3000
http://<SERVER_IP>:3000/secret  (with Basic Auth)
```

---

## 📜 Summary

We have:

* Built a **secure Node.js API** with Basic Auth.
* Dockerized it without leaking `.env`.
* Set up a **remote server**.
* Automated deployment with **GitHub Actions**.
* Managed secrets securely via **GitHub Secrets**.

---

```

---

https://roadmap.sh/projects/dockerized-service-deployment

```
