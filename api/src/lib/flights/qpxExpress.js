require('dotenv').config();

import https from 'https';

/* Google QPX Express Flight Information API */
const qpx = {};
qpx.qpx_apikey = process.env.QPX_API_KEY; // Browser Key

qpx.getFlightList = function (origin, destination, date, callback) {
	var qpx_request = {
		"fields":
			"kind,\
			trips(\
				kind,\
				requestId,\
				tripOption(\
					id,\
					kind,\
					slice(\
						duration,\
						kind,\
						segment(\
							bookingCode,\
							bookingCodeCount,\
							connectionDuration,\
							duration,\
							flight,\
							id,\
							kind,\
							leg(\
							arrivalTime,\
							changePlane,\
							connectionDuration,\
							departureTime,\
							destination,\
							duration,\
							id,\
							kind,\
							origin,\
							originTerminal\
							)\
						)\
					)\
				)\
			)\
		",
		"request": {
			"passengers": {
			"kind": "qpxexpress#passengerCounts",
			"adultCount": 1
		},
		"slice": [
		  {
			"kind": "qpxexpress#sliceInput",
			"origin": origin,
			"destination": destination,
			"maxStops": 0,
			"date": date
		  }
		],
		"solutions": 10
	  }
	};

	qpx.search(qpx_request, function(error, response){
		if (error) callback(error);
		callback(null, qpx.parseFlights(response));
	});

}

qpx.search = function (body, callback) {
		let strBody = JSON.stringify(body);
		let data = '';
		const options = {
			host : 'www.googleapis.com',
			method : 'POST',
			path : '/qpxExpress/v1/trips/search?key=' + qpx.qpx_apikey,
			headers : { 'Content-Type': 'application/json' },
			'content-length' : strBody.length
		};

		let request = https.request(options, (response)=>{
			response.setEncoding('utf8');
			response.on('data', (chunk)=>{
				data += chunk;
			});
			response.on('end', ()=>{
				callback(null, JSON.parse(data));
			});
		});

		request.on('error', error=>{
			console.log('error on : ', Error(error));
			callback(error, {});
		});

		request.write(strBody);
		request.end();
}

qpx.parseFlights = function (response) {
	var flights = [];
	if (typeof(response.trips) != 'undefined' && typeof(response.trips.tripOption) != 'undefined') {
		var tripOption = response.trips.tripOption;
		flights.push({id:'-', text:''})
		for (var id = 0; id<tripOption.length; id++) {
			if (tripOption[id].slice[0].segment.length>1) continue;
			var segment = tripOption[id].slice[0].segment[0];
			//console.log(segment);
			var leg = segment.leg[0];
			var depT = new Date(leg.departureTime);
			var tomorrow = new Date(Date.now()).valueOf(); // + 60*60*24*1000;
			if (depT.valueOf() > tomorrow) {
				flights.push({
					id: 'F' + id,
					carrier: segment.flight.carrier,
					flightNumber: segment.flight.number,
					flightId: segment.flight.carrier + '-' + segment.flight.number,
					text: segment.flight.carrier + segment.flight.number +
						' : ' + leg.origin + "-" + leg.destination + '; Dep.: ' + leg.departureTime + '; Arr.: ' + leg.arrivalTime,
					origin: leg.origin,
					destination: leg.destination,
					arrivalTime: leg.arrivalTime,
					departureTime: leg.departureTime,
					departureYearMonthDay: '/dep/' + depT.getUTCFullYear() + '/' + ('0'+(depT.getUTCMonth()+1)).slice(-2) + '/' + ('0'+depT.getUTCDate()).slice(-2),
					duration: leg.duration,
				});
			}
		}
	}
	if (flights.length == 0) {
		flights = [{id:'', text: 'Sorry, no flights found!'}];
	} else {
		flights[0] = {id:'-', text:(flights.length-1) + ' flights found - please select'};
		flights.sort(function (a,b) {
			if (a.id == '-') return 0;
			//console.log('COMPARE', new Date(a.departureTime).getTime(), b);
			let dep_a = new Date(a.departureTime).valueOf();
			let dep_b = new Date(b.departureTime).valueOf();
			if (dep_a == dep_b) return 0;
			if (dep_a < dep_b) return -1;
			return 1;
		});
	}
	return flights;
}

export default qpx;
