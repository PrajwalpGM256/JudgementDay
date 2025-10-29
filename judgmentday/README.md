# JudgmentDay - Sports Prediction Platform

## Quick Setup Guide

Follow these steps to set up the project on your local machine.

## Prerequisites
- Git
- WSL2 (if using Windows)

## Setup Instructions

### Clone the Repository
```bash
git clone https://github.com/[USERNAME]/project-fall25-PrajwalpGM256.git
cd project-fall25-PrajwalpGM256/judgmentday
```

### Get Environment Files
**Contact the team lead for:**
- `.env` file
- `.env.local` file

Place both files in the root of the `judgmentday` folder.

### Install Miniconda & Create Environment
```bash
# Install Miniconda
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh -b
~/miniconda3/bin/conda init bash
source ~/.bashrc

# Create environment
conda create -n judgmentday nodejs=18 -y

# Activate environment
conda activate judgmentday
```

**IMPORTANT**: Always activate the environment when working on this project:
```bash
conda activate judgmentday
```

### Install Dependencies
```bash
# Make sure you're in the judgmentday directory
npm install
```

### Set Up Database
```bash
# Generate Prisma Client
npx prisma generate

# Sync with database
npx prisma db push
```

### 6. Run the Application
```bash
npm run dev
```

Application will be running at: **http://localhost:3000**

## 📍 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://localhost:3000 | Main app |
| **Prisma Studio** | http://localhost:5555 | Database GUI (`npm run db:studio`) |

## 🔄 Daily Workflow
```bash
# Every time you work on the project:
conda activate judgmentday
cd judgmentday
git pull
npm install  # In case of new dependencies
npm run dev
```

## 🆘 Troubleshooting

**Modules not found?**
```bash
rm -rf node_modules .next
npm install
```
## Link to wireframe

https://www.figma.com/design/qwO4AwCitaWPWiEMeJCT2G/JudgementDay?node-id=0-1&t=ubbroK396GKiGLhV-1

