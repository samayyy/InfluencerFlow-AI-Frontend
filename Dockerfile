FROM node:21.1-alpine
WORKDIR /app
COPY package.json .   
RUN npm install --legacy-peer-deps
COPY . .
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=509297366198-0rr6bk49h3pa424k67c8del6b7ok09d6.apps.googleusercontent.com
EXPOSE 3000
CMD ["npm", "run", "dev"]
