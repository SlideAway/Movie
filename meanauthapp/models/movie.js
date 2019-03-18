const mongoose = require('mongoose');
const config = require('../config/database');

const MovieSchema = mongoose.Schema({
  title: {//제목
    type:String
  },
  subtitle: {//영제
    type:String
  },
  country: {//제작국가
    type:String
  },
  pubdate: {//개봉년도
    type:String
  },
  director: {//감독
    type:String
  },
  genre:{//장르
    type:String
  },
  rating: {//점수
    type:String
  },
  link:{//네이버 영화 링크
    type:String
  },
  image: {//포스터 URL
    type:String
  }
});


const Movie = module.exports = mongoose.model('Movie', MovieSchema);

module.exports.getMovieByTitle = function(title, callback) {
  Movie.find({$or:[{title:title}, {subtitle:title}]}, callback);//영화 제목과 영제를 키워드로 검색
}
/*
module.exports.saveInfo = function(movieInfo, callback) {
  movieInfo.save(callback);//영화 상세정보 저장(포스터링크, 점수, 네이버 영화 링크)
}

module.exports.isexist = function(title, callback) {//DB에 영화 정보가 있는지 검색
  if(Movie.find({$or:[{title:title}, {subtitle:title}]}, callback)) {
    return true;//데이터 존재시
  }
  else {
    return false;//데이터 부재시
  }
}

module.exports.isexitstimg = function(imgurl, callback) {
  if(Movie.findOne(imgurl, callback)) {
    return true;//데이터 존재시
  }
  else {
    return false;//데이터 부재시
  }
}
*/
