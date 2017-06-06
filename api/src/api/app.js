const app = {};

import flights from '../lib/flights.js';

app.getAirports = (req, res) => {
  const airports = flights.getAirports();
  res.status(200).json(airports);
}

app.getFlightList = (req, res) => {
  const search = req.body;
  console.log(search.origin, search.destination, search.departure);
  flights.getFlights(search.origin, search.destination, search.departure).then((flightList) => {
    res.status(200).json(flightList);
  }).catch((error) => {
    res.status(500).json(error);
  });
}

export default app;
