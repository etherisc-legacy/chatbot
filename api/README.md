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

Then goto `node_modules/web3/lib/web3/formatters.js`
And change 3 lines around line `213`
```
if (post.ttl) post.ttl = parseInt(post.ttl);//utils.fromDecimal(post.ttl);
if (post.powTime) post.powTime = parseInt(post.powTime);//utils.fromDecimal(post.powTime);
if (post.powTarget) post.powTarget = parseFloat(post.powTarget);//.toString();
```

### Start Geth 1.6 with Whisper V5
`exec bash -c '~/go-ethereum/build/bin/geth --verbosity 4 --shh --rpc --rpccorsdomain "*" --rpcport "8645" --light --rpcapi "db,eth,net,h,net,web3,shh" --networkid 3 --unlock "0"'`

### Setup environment
Copy `sample.env` to `.env` and fill the variables

### Run the server
Start it by running: `gulp` in `/api` folder

### Test with curl
Some tests

#### Check geth version
`curl http://localhost:8645 -X POST --data '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":67}'`

#### Get top 100 airports
```curl -X GET \
  http://localhost:3003/airports \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded'```

#### Look for flight
```curl -X POST \
  http://localhost:3003/getFlightList \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -d 'origin=AMS&destination=CDG&departure=2017-09-07'```
