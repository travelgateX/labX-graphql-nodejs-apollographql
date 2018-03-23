const typeDefs =
`
# A character from the Star Wars universe
interface Character {
  # The ID of the character
  id: ID!

  # The name of the character
  name: String!

  # The friends of the character, or an empty list if they have none
  friends: [Character]

  # The movies this character appears in
  appearsIn: [Episode!]!
}

# An autonomous mechanical character in the Star Wars universe
type Droid implements Character {
  # The ID of the droid
  id: ID!

  # What others call this droid
  name: String!

  # This droid's friends, or an empty list if they have none
  friends: [Character]

  # The movies this droid appears in
  appearsIn: [Episode!]!

  # This droid's primary function
  primaryFunction: String
}

# The episodes in the Star Wars trilogy
enum Episode {
  # Star Wars Episode IV: A New Hope, released in 1977.
  NEWHOPE

  # Star Wars Episode V: The Empire Strikes Back, released in 1980.
  EMPIRE

  # Star Wars Episode VI: Return of the Jedi, released in 1983.
  JEDI
}

# A humanoid creature from the Star Wars universe
type Human implements Character {
  # The ID of the human
  id: ID!

  # What this human calls themselves
  name: String!

  # Height in the preferred unit, default is meters
  height(unit: LengthUnit = METER): Float!

  # Mass in kilograms, or null if unknown
  mass: Float

  # This human's friends, or an empty list if they have none
  friends: [Character]

  # The movies this human appears in
  appearsIn: [Episode!]!

  # A list of starships this person has piloted, or an empty list if none
  starships: [Starship]

  species(id: ID): Specie
}

# Units of height
enum LengthUnit {
  # The standard unit around the world
  METER

  # Primarily used in the United States
  FOOT
}

# The mutation type, represents all updates we can make to our data
type Mutation {
  createReview(episode: Episode!, review: ReviewInput!): Review
}

# The query type, represents all of the entry points into our object graph
type Query {
  hero(episode: Episode = NEWHOPE): Character
  reviews(episode: Episode!): [Review]!
  search(text: String!): [SearchResult]!
  character(id: ID!): Character
  droid(id: ID!): Droid
  human(id: ID!): Human
  starship(id: ID!): Starship
}

# Represents a review for a movie
type Review {
  # The number of stars this review gave, 1-5
  stars: Int!

  # Comment about the movie
  commentary: String
}

# The input object sent when someone is creating a new review
input ReviewInput {
  # 0-5 stars
  stars: Int!

  # Comment about the movie, optional
  commentary: String
}

union SearchResult = Human | Droid | Starship

type Starship {
  # The ID of the starship
  id: ID!

  # The name of the starship
  name: String!

  # Length of the starship, along the longest axis
  length(unit: LengthUnit = METER): Float!
}

type Specie {
  designation: String @examples(values:["designation1", "designation2"])
  language: String @examples(values:["language1", "language2", "language3"])
  subEspecies: [Specie!]
  homeworld: Homeworld
}

type Homeworld {
  name: String @examples(values: ["name1", "name2", "name3", "name4"])
  species: [Specie!]
}
`
;
module.exports.typeDefs = typeDefs;