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

# Expose your backend port (important for Railway)
EXPOSE 5000

# Start your server via package.json script
CMD ["npm", "start"]
