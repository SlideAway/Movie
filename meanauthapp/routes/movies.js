const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');
const config = require('../config/database');
const request = require('request');
const Movie = require('../models/movie');
const movieDB = require('moviedb')('66ba3c0468be69a0bd303a2938c623b5');
const passport = require('passport');
const jwt = require('jsonwebtoken');


/*
router.post('/movie', (req, res, next) => {
  let required = {
    title: req.body.title
  }
  let newMovie = new Movie({
    title: req.body.title,
    image: String,
    pubDate: Date,
    Director: String,
    Rating: String
  });
  let naver = 'https://openapi.naver.com/v1/search/movie.json?X-Naver-Client-Id=zgj2zeoBlpIvQXpzpdaQ&X-Naver-Client-Secret=Wj9WKCv_1c&query=';
  let api = naver + this.newMovie.title
  http.get(api, (res) => {
    newMovie = res.json();
  });
});
*/
router.post('/findmovie', (req, res, next) => {
  const title = req.body.title;
  Movie.getMovieByTitle(title, (err, movie) => {
    if (err) throw err;
    if (!movie) {
      return res.json({
        success: false,
        msg: '영화를 찾을 수 없음'
      });
    } else {
      console.log(movie.title);
      res.json({
        success: true,
        movie: {
          title: movie[0].title,
          subtitle: movie[0].subtitle,
          country: movie[0].country,
          pubdate: movie[0].pubdate,
          director: movie[0].director,
          genre: movie[0].genre
        }
      });
    }
  });
});
/*
router.post('/getImage', (req, res, next) => {
  const title = req.body.title;
  const base = 'https://api.themoviedb.org/3/search/movie?api_key=66ba3c0468be69a0bd303a2938c623b5&language=ko&include_adult=true&region=kr&query='
  let url = base + title;
  console.log(url);
  https.request(url, function(response) {
    console.log(res);
  });
*/

router.post('/getImage', (req, res, next) => {
  movieDB.searchMovie({query: title}, (err, response) => {
    for(var i=0; i<response.results.length; i++) {
      if(response.results[i].title == title || response.results[i].original_title == title) {
        res.json({
          success: true,
          movie: {
          poster:response.results[i].poster_path,
          rate: response.results[i].vote_average,
          pubDate:response.results[i].release_date
        }
      });
      }
      else {
        console.log('에러발생');
        console.log(response);
      }
    }
  });
});
module.exports = router;
