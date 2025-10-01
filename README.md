# Nodejs, Dynamodb, Handlebars Site #
To run locally, create .env file in ./Webiste/ folder and fill in the following:
``AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
PORT=3001
``
To run the application as a docker container using docker desktop; use the following command to build the container and mount the container to a local directory. ``docker run -v "<path>/:/app" -w /app -p 3001:3001 node:18-slim bash -c "npm install && node app.js"``
