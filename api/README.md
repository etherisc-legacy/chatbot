## API endpoint
This endpoint provides data to the chatbots.
- [GET] /airports - Get popular airports
- [POST] /getFlightList - Find flights

### Install depencies
Make sure you have the following dev depencies:
- babel-cli
- babel-core
- babel-preset-es2015
- babel-preset-stage-0
- eslint
- gulp
- gulp-run
- nodemon

### Install packages
Install packages: `npm install` in `/api` folder

### Setup environment
Copy `sample.env` to `.env` and fill the variables

### Run the server
Start it by running: `gulp` in `/api` folder

### Test with curl
```curl -X GET \
  http://localhost:3003/airports \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded'```

```curl -X POST \
  http://localhost:3003/getFlightList \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -d 'origin=AMS&destination=CDG&departure=2017-06-07'```
