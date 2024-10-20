<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


# TesloDB API

1. clone project
2. ```yarn install```
3. clone the file ```.env.template``` and rename to ```.env```
4. change environment
5. rise up data base
```
docker-compose up -d
```
6. SEED execution
```
localhost:3000/api/seed
```
7. run project ```yarn start:dev```
8. the doc make with this library ```@nestjs/swagger``` and the url of doc is:
```
http://localhost:3000/api
```

9. in deploying app you must change this lines:
```
"start": "nest start",
"start:prod": "node dist/main",
```

for this:
```
"start": "node dist/main",
"start:prod": "nest start",
```
this is for heroku able reed commands and deploy the app (remenber the app was created in node --version: v20.17.0)