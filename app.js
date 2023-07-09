require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

// Set up middleware
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Configure Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
const getToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
  } catch (error) {
    console.log("There was an error:", error);
  }
};

// Get artist
const getArtist = async (artist) => {
  try {
    const data = await spotifyApi.searchArtists(artist);
    return data;
  } catch (error) {
    console.log("There has been an error:", error);
  }
};

// Initialize the app
const initApp = async () => {
  await getToken();
};

// Call initialization function
initApp();

// Define routes
app.get("/", (req, res) => {
  const pageTitle = "Espotifai";
  const pageStyling = "/styles/index.css";
  res.render("index", { pageTitle, pageStyling });
});

app.get("/artist-search", async (req, res) => {
  const artistSearch = req.query["artist-search"];

  if (!artistSearch) {
    res.send("No search provided");
    return;
  }

  try {
    const data = await getArtist(artistSearch);
    const artist = data.body.artists.items;
    const pageTitle = artist[0].name;
    const pageStyling = "/styles/artist-style.css";
    res.render("artist-search-results", {
      artist: artist[0],
      pageTitle,
      pageStyling,
    });
  } catch (error) {
    console.log("There has been an error:", error);
    res.render("error");
  }
});

app.get("/all-albums/:artistId", async (req, res) => {
  const artistId = req.params.artistId;
  const pageTitle = "Albums";
  const pageStyling = "/styles/album-style.css";

  try {
    const data = await spotifyApi.getArtistAlbums(artistId);
    const albums = data.body.items;
    res.render("all-albums", { albums, pageTitle, pageStyling });
  } catch (error) {
    console.log("There has been an error:", error);
  }
});

app.get("/tracks/:albumId", async (req, res) => {
  const albumId = req.params.albumId;
  const pageStyling = "/styles/tracks.css";

  try {
    const data = await spotifyApi.getAlbumTracks(albumId);
    const tracks = data.body.items;
    const pageTitle = "Songs";
    res.render("track-information", { tracks, pageTitle, pageStyling });
  } catch (error) {
    console.log("There has been an error:", error);
  }
});

// Start the server
const port = 3000;
app.listen(port, () =>
  console.log(`My Spotify project running on port ${port} 🎧 🥁 🎸 🔊`)
);
