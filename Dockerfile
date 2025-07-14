FROM node:18

# Install system dependencies for canvas + LibreOffice + pdftocairo
RUN apt-get update && apt-get install -y \
  libcairo2-dev \
  libjpeg-dev \
  libpango1.0-dev \
  libgif-dev \
  librsvg2-dev \
  libreoffice \
  poppler-utils \
  build-essential \
  g++

# Create app directory
WORKDIR /app

# Copy files and install dependencies
COPY . .
RUN npm install

# Expose backend port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
