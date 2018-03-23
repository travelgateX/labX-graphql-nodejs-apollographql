const starships = require('./data/starships.json');
const droids = require('./data/droids.json');
const humans = require('./data/humans.json');

const humanData = {};
humans.forEach(ship => {
  humanData[ship.ID] = ship;
});

const droidData = {};
droids.forEach(ship => {
  droidData[ship.ID] = ship;
});

const starshipData = {};
starships.forEach(ship => {
  starshipData[ship.ID] = ship;
});

var reviews = {
  NEWHOPE: [],
  EMPIRE: [],
  JEDI: []
};

function getCharacter(id) {
  return Promise.resolve(humanData[id] || droidData[id]);
}

function getHero(episode) {
  if (episode === 'EMPIRE') {
    return humanData['1000'];
  }
  return droidData['2001'];
}

function getReviews(episode) {
  return reviews[episode];
}

function getHuman(id) {
  return humanData[id];
}

function getDroid(id) {
  return droidData[id];
}

function getStarship(id) {
  return starshipData[id];
}

function getFriendsConnection(obj, args, context, info) {
  //   console.log('____________________\n____________________');
  //   console.log(info);
  //   console.log(':::::\n::::\n:::');
  //   console.log(obj);
  const numberOfFriends = args.first || Infinity;
  const retrieveUntil = args.after || Infinity;

  const friendsConnection = {};

  const friends = [];
  const edges = [];

  //info.parentType
  const typeOfObj = info.path.prev.key || info.parentType;

  const friendsPromises = obj.Friends.map(f => getCharacter(f));

  Promise.all(friendsPromises).then(res => {
    for (let i = 0, len = res.length; i < len; i++) {
      if (
        i < numberOfFriends &&
        !edges.find(e => e.node.ID == retrieveUntil) &&
        Number(res[i].ID) < retrieveUntil
      ) {
        edges.push({
          cursor: res[i].ID,
          node: res[i]
        });
      }
      friends.push(res[i]);
    }

    const pageInfo = getPageInfo(obj, typeOfObj);

    friendsConnection.totalCount = friends.length;
    friendsConnection.friends = friends;
    friendsConnection.edges = edges;
    friendsConnection.pageInfo = pageInfo;
  });

  return Promise.resolve(friendsConnection);
}

function getPageInfo(obj, type) {
  const pageInfo = {};

  const informationArrays = {
    character: Object.keys(humanData).concat(Object.keys(droidData)),
    human: Object.keys(humanData),
    droid: Object.keys(droidData)
  };

  pageInfo.startCursor = Math.min(...informationArrays[type]);
  pageInfo.endCursor = Math.max(...informationArrays[type]);
  pageInfo.hasNextPage = (pageInfo.endCursor != obj.ID);
  return Promise.resolve(pageInfo);
}

const resolvers = {
  Query: {
    hero: (root, { episode }) => getHero(episode),
    character: (root, { id }) => getCharacter(id),
    human: (root, { id }) => getHuman(id),
    droid: (root, { id }) => getDroid(id),
    starship: (root, { id }) => getStarship(id),
    reviews: (root, { episode }) => getReviews(episode),
    search: (root, { text }) => {
      const re = new RegExp(text, 'i');
      const allData = [...humans, ...droids, ...starships];
      return allData.filter(obj => re.test(obj.Name));
    }
  },
  Mutation: {
    createReview: (root, { episode, review }) => {
      reviews[episode].push(review);
      return review;
    }
  },
  Character: {
    __resolveType(data, context, info) {
      if (humanData[data.ID]) {
        return info.schema.getType('Human');
      }
      if (droidData[data.ID]) {
        return info.schema.getType('Droid');
      }
      return null;
    },
    friendsConnection: (obj, args, context, info) =>
      getFriendsConnection(obj, args, context, info)
  },
  Human: {
    id: obj => obj.ID,
    name: obj => obj.Name,
    height: (obj, { unit }) => {
      if (unit === 'FOOT') {
        return obj.Height * 3.28084;
      }

      return obj.Height;
    },
    mass: obj => obj.Mass,
    friends: obj => {
      var friends = [];
      obj.Friends.forEach(function(friend) {
        friends.push(getCharacter(friend));
      });
      return friends;
    },
    appearsIn: obj => obj.AppearsIn,
    starships: obj => {
      var starships = [];
      obj.Starships.forEach(function(starship) {
        starships.push(getStarship(starship));
      });
      return starships;
    },
    friendsConnection: (obj, args, context, info) =>
      getFriendsConnection(obj, args, context, info)
  },
  Droid: {
    id: obj => obj.ID,
    name: obj => obj.Name,
    friends: obj => {
      var friends = [];
      obj.Friends.forEach(function(friend) {
        friends.push(getCharacter(friend));
      });
      return friends;
    },
    appearsIn: obj => obj.AppearsIn,
    primaryFunction: obj => obj.PrimaryFunction,
    friendsConnection: (obj, args, context, info) =>
      getFriendsConnection(obj, args, context, info)
  },
  Starship: {
    id: obj => obj.ID,
    name: obj => obj.Name,
    length: (obj, { unit }) => {
      if (unit === 'FOOT') {
        return obj.Length * 3.28084;
      }

      return obj.Length;
    }
  },
  SearchResult: {
    __resolveType(data, context, info) {
      if (humanData[data.ID]) {
        return info.schema.getType('Human');
      }
      if (droidData[data.ID]) {
        return info.schema.getType('Droid');
      }
      if (starshipData[data.ID]) {
        return info.schema.getType('Starship');
      }
      return null;
    }
  },
  Review: {
    stars: obj => obj.stars,
    commentary: obj => obj.commentary
  }
};
module.exports.resolvers = resolvers;
