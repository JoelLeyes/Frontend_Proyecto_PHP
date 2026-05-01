FROM node:20-alpine

WORKDIR /app

ARG VITE_API_URL=https://api.agendaonline.cloud-ip.cc
ENV VITE_API_URL=${VITE_API_URL}

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build
RUN mkdir -p public

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
