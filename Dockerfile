FROM node:18

# Install system dependencies (LibreOffice + pdftocairo)
RUN apt-get update && apt-get install -y \
  libreoffice \
  poppler-utils

# Create app directory
WORKDIR /app

# Copy files and install dependencies
COPY . .
RUN npm install

# Expose your backend port
EXPOSE 5000

# Start your server (adjust if your entry point is different)
CMD ["node", "app.js"]
