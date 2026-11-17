# The ₹99 WhatsApp video renderer (Cloud Run job "invite-video").
# Playwright's image already has Chromium and its system libraries; the
# version must match playwright in package.json.
FROM mcr.microsoft.com/playwright:v1.64.1-noble
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg fonts-noto-color-emoji && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY record-invite.mjs job.mjs ./
ENTRYPOINT ["node", "job.mjs"]
