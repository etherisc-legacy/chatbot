const app = {};

import flights from '../lib/flights.js';
import whisperProxy from '../lib/whisperProxy.js';

//whisperProxy.init();

app.getAirports = (req, res) => {
  const airports = flights.getAirports();
  res.status(200).json(airports);
}

app.getFlightList = (req, res) => {
  const search = req.body;
  flights.getFlights(search.origin, search.destination, search.departure).then((flightList) => {
    res.status(200).json(flightList);
  }).catch((error) => {
    res.status(500).json(error);
  });
}

export default app;
