const EventResponse = require('./EventResponse');

class EventIgnoreResponse extends EventResponse {
  placeholder = true;
}

module.exports = EventIgnoreResponse;
