require("dotenv").config();

const { configDotenv } = require("dotenv");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
const getToken = async () => {
  try {
    let data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
    // console.log(data.body.access_token);
  } catch (error) {
    console.log("There was an error ", error);
  }
};

// Get artist
const getArtist = async (artist) => {
  try {
    let data = await spotifyApi.searchArtists(artist);
    // console.log(data);
    return data;
  } catch (error) {
    console.log("There has been an error ", error);
  }
};

//Caller function
const initApp = async () => {
  await getToken();
  await getArtist();
};

//Call caller function
initApp();

// Our routes go here:
app.get("/", (request, response) => {
  response.render("index");
});

app.get("/artist-search", async (request, response) => {
  //artist
  const artistSearch = request.query["artist-search"];

  if (!artistSearch) {
    response.send("No search provided");
    return;
  }
  try {
    // console.log("Input value", artistSearch);
    const data = await getArtist(artistSearch);
    const artist = data.body.artists.items;

    response.render("artist-search-results", {
      artist: artist[0],
    });
  } catch (error) {
    console.log("There has been an error", error);
    response.render("error");
  }
});

app.get("/all-albums/:artistId", async (request, response) => {
  const artistId = request.params.artistId;

  try {
    const data = await spotifyApi.getArtistAlbums(artistId);
    const albums = data.body.items;
    response.render("all-albums", { albums });
  } catch (error) {
    console.log("There has been an error ", error);
  }
});

app.get("/:name/:albumId", async (request, response) => {
  const name = request.params.name;
  const albumId = request.params.albumId;

  try {
    const data = await spotifyApi.getAlbumTracks(albumId);
    const tracks = data.body.items;
    console.log(tracks);
    response.render("track-information", { tracks });
  } catch (error) {
    console.log("There has been an error ", error);
  }
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
