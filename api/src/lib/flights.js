const NodeCache = require( "node-cache" );
const flightCache = new NodeCache({ stdTTL: 600, checkperiod: 3600 });

const crypto = require('crypto');

import top100airports from './flights/topAirports.js';
import qpx from './flights/qpxExpress.js';

const flights = {};

flights.getAirports = () => {
  return top100airports;
}

flights.getFlights = (origin, destination, departure) => {
  var flightHash = crypto.createHmac('sha256', 'a').update(origin+'|'+destination+'|'+departure).digest('hex');
  return new Promise((resolve, reject) => {
    flightCache.get(flightHash, function(err, flightCacheRow){
      //console.log(err, flightCacheRow);
      if(typeof flightCacheRow !== 'undefined'){
        console.log('FROM CACHE', flightHash);
        resolve(flightCacheRow);
      } else {
        qpx.getFlightList(origin, destination, departure, function (error, result){
          if (error) reject(error);
          console.log('TO CACHE', flightHash);
          flightCache.set(flightHash, result);
          resolve(result);
        });
      }
    });
    //console.log(flightCacheRow);
  });
}

export default flights;
