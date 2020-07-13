FROM node:12.16.1

COPY trust.pem /root/.ssl/trust.pem

WORKDIR /
RUN ["mkdir", "/app"]
WORKDIR /app

COPY . .
RUN npm install
RUN npm run clean
RUN npm run build

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production
ENV K8S_MODE cluster

CMD ["npm", "run", "serve"]
