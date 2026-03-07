# 🚀 Deployment Guide: Physical AI Book

Follow these steps to deploy your backend to Hugging Face Spaces and your frontend to GitHub Pages.

---

## 🏗️ Backend: Hugging Face Spaces (Docker)

Hugging Face Spaces provides a free and easy way to host Docker containers.

### 1. Create a New Space
1. Go to [Hugging Face Spaces](https://huggingface.co/spaces).
2. Click **"Create new Space"**.
3. **Space Name**: `physical-ai-book-api` (or your preferred name).
4. **License**: `mit` (or preferred).
5. **SDK**: Select **"Docker"**.
6. **Docker Template**: Select **"Blank"**.
7. **Space Hardware**: Free CPU tier is usually enough for testing.
8. Click **"Create Space"**.

### 2. Set Environment Variables
1. In your new Space, go to the **"Settings"** tab.
2. Scroll down to **"Variables and secrets"**.
3. Add the following **Secrets** (New Secret):
   - `OPENROUTER_API_KEY`: Your OpenRouter key.
   - `NEON_DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `QDRANT_URL`: Your Qdrant Cloud URL.
   - `QDRANT_API_KEY`: Your Qdrant API key.
   - `JWT_SECRET`: A long random string for authentication.
   - `CORS_ORIGINS`: `https://Furqan2004.github.io` (Your GitHub Pages URL).

### 3. Deploy the Code
1. Clone the Space repository locally or use the Hugging Face web interface to upload files.
2. You only need the contents of the `backend/` folder.
3. Upload `Dockerfile`, `.dockerignore`, `requirements.txt`, and all `.py` files/folders from `backend/` to the Space root.
4. Hugging Face will automatically build and start the Docker container.

---

## 🌐 Frontend: GitHub Pages

The project includes a GitHub Action to deploy automatically on every push to `main`.

### 1. Configure the Repository
1. Go to your GitHub repository: `https://github.com/Furqan2004/physical-ai-book`.
2. Go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, ensure **"GitHub Actions"** is selected.

### 2. Set Environment Variables (Optional)
Since Docusaurus is a static site, environment variables are baked in during build.
1. Go to **Settings** > **Secrets and variables** > **Actions**.
2. Add a **Variable** (New repository variable):
   - `DOCUSAURUS_BACKEND_URL`: `https://your-space-name.hf.space` (The Direct URL of your Hugging Face Space).
     *To find this URL:* In Hugging Face Space, click the three dots (⋮) > **"Embed this Space"** > Look for the "Direct URL".

### 3. Deploy
1. Simply push your changes to the `main` branch.
2. GitHub will run the "Deploy to GitHub Pages" action.
3. Your site will be live at `https://Furqan2004.github.io/physical-ai-book/`.

---

## 🔗 Connection Checklist
- [ ] Backend `CORS_ORIGINS` includes the frontend URL.
- [ ] Frontend `DOCUSAURUS_BACKEND_URL` points to the Hugging Face Space URL.
- [ ] All API keys are set as secrets in Hugging Face.
