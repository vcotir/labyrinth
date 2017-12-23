const axios = require('axios');
const _ = require('underscore');

const config = {
  headers: {
    'X-Labyrinth-Email': 'victorkjngo@gmail.com'
  }
};

let roomIds = [];

const renderConfigWithParams = (config, params) => {
  // purpuse: this function extends the original configureation object to have addition params (query string key value pairs)
  
  // input: object (original config object), object (key value pairs to be attached )
  var config = _.extend({
    params: params
  }, config);

  return config;
};

const request = (endpoint, params, data, waitTime = 0) => {
  // Purpose: this function is invoked  

  // input: string (endpoint name), object (parameters), object (request body, for post requests)
  // output: promisified result
  console.log('INVOKING REQUEST WITH THIS', endpoint, 'params', params, 'data', data, 'after', waitTime, 'ms');  
  const url = 'http://challenge2.airtime.com:7182/' + endpoint;
  let method = '';
  let callback = ({data}) => {
    return data;
  };

  const {roomId} = params;
  let newConfig = _.extend({}, config);

  switch (endpoint) {
    case 'start': 
      method = 'get';
      break;
    case 'exits':
      method = 'get';
      newConfig = renderConfigWithParams(config, {
        roomId
      });

      callback = ({data}) => {
        const {exits} = data;
        return exits;
      };

      break;
    case 'move':
      method = 'get';
      let {exit} = params;
      newConfig = renderConfigWithParams(config, {
        exit,
        roomId
      });

      callback = ({data}) => {
        const {roomId} = data;
        return roomId;
      };
      break;
    case 'wall':
      method = 'get';
      newConfig = renderConfigWithParams(config, {
        roomId
      });
      break;
    case 'report':
      method = 'post';
      break;

    default:
  }

  switch (method) {
    case 'GET':
    case 'get':
      return axios.get(url, newConfig)
        .then(callback)
        .catch(err => {
          console.log('Invoking request again with', endpoint, 'params', params, 'data', data, 'after', waitTime, 'ms');
          return new Promise ((resolve, reject) => {
            setTimeout(function () {
              request(endpoint, params, data, waitTime)
                .then(output => {
                  console.log('SUCCESS. Second times the charm!');
                  resolve(output);
                });
            }, waitTime += 500);
          });
        });
      break
    case 'POST', 'post':
      // console.log('DATA', data); 
      console.log('REPORT PROPERLY GENERATED. \nReady to send:', data);
      return axios.post(url, data, newConfig)
      .then(function (res) {
        console.log('Response from server', res.data);
        return res.data;  
      }); 
      break;
  }
  
};

const findStartId = () => {
  // purpose: returns the start roomId

  // input: n/a
  // o: promisified roomId

  return request('start', {});
};

const findExitDirections = (roomId) => {
  // purpose: return the exits of a given roomId

  // input: string (roomId)
  // o: promisified array of exits

  return request('exits', {roomId});
};

const peekExitId = (exit, roomId) => {
  // purpose: return roomId of the room through a certain exit

  // input: n/a
  // o: promisified roomId
  
  return request('move', {roomId, exit});
};

const asyncMap = (array, callback, roomId) => {
  // purpose: return a promisified array with promisified values

  // i: array, function (to be run on values of the array), string (optional roomId)
  // o: promified array

  if (!array || !array.length) {
    return [];
  }

  const promises = [];
  
  array.forEach(el => {
    promises.push(callback(el, roomId));
  });

  return Promise.all(promises);
};

const findRoomExitIds = (roomId) => {
  // purpose: given roomId, return list of exit roomIds

  // I: string (roomId)
  roomIds.push(roomId);
  return findExitDirections(roomId)
    .then(exits => {
      return asyncMap(exits, peekExitId, roomId)
    })
    .then(exitIds => {
      return asyncMap(exitIds, findRoomExitIds);
    });
};

const checkWriting = (roomId) => {
  // purpose: return the writing on wall of a room

  // input: string (roomId)
  // o: promisified object (writing on the wall)

  return request('wall', {roomId});
};

const postReport = (report) => {
  // Posts report to be 
  return request('report', {}, report);
};

const sortAscendingByOrder = (a, b) => {
  return a.order - b.order;
};

function buildAndPostReport () {
  roomIds = [];

  return findStartId()
    .then(({roomId}) => { 
      roomIds.push(roomId);
      return Promise.all([findExitDirections(roomId), roomId]);
    })
    .then(([exits, roomId]) => {
      return asyncMap(exits, peekExitId, roomId);
    })
    .then(exitIds => {
      return asyncMap(exitIds, findRoomExitIds);
    })
    .then(() => {
      const promises = [];
      roomIds.forEach(roomId => {
        promises.push(Promise.all([roomId, checkWriting(roomId)]));
      });

      return Promise.all(promises);
    })
    .then(roomIdsWritings => {
      const post = {
        roomIds: [],
        challenge: ''
      };

      const litupRoomsWritings = [];

      roomIdsWritings.forEach(([roomId, writing]) => {
        if (writing.order === -1) {
          post.roomIds.push(roomId);
        } else {
          litupRoomsWritings.push(writing);
        }
      });

      litupRoomsWritings.sort(sortAscendingByOrder);

      litupRoomsWritings.forEach(({writing}) => {
        post.challenge += writing;
      });

      return postReport(post);
    })
    .then(async (res) => {
      console.log('RESPONSE', res);
      let isSuccess = res === 'Congratulations!  Your work is complete.  Please send your code to challenge@airtime.com';
      if(!isSuccess) {
        console.log('BAD REPORT, TRYING AGAIN');
        return await buildAndPostReport();
      } 
      return res;
    })
    .catch(err => {
      console.error('ERROR', err);
    });

}

buildAndPostReport();

