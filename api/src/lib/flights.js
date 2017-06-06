import top100airports from './flights/topAirports.js';
import qpx from './flights/qpxExpress.js';

const flights = {};

flights.getAirports = () => {
  return top100airports;
}

flights.getFlights = (origin, destination, departure) => {
  return new Promise((resolve, reject) => {
    qpx.getFlightList(origin, destination, departure, function (error, result){
      if (error) reject(error);
      resolve(result);
    });
  });
}

export default flights;
