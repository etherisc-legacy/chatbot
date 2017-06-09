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

### Using status web3 provider for Whisper V5
Make sure `node_modules/web3` is gone and run: `npm run install-status-web3`
Run `npm install` in the new `node_modules/web3` folder

### Start Geth 1.6 with Whisper V5
`exec bash -c '~/go-ethereum/build/bin/geth --verbosity 4 --shh --rpc --rpccorsdomain "*" --port "8546" --light --rpcapi "db,eth,net,h,net,web3,shh" --networkid 3 --unlock "0"'`

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
