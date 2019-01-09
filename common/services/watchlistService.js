'use strict';

const { MongoClient } = require('mongodb');
const moment = require('moment');

const url = 'mongodb://localhost:27017/musubu';

function getWatchlistByDate(userEmail, createdDate, cb) {

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log('Connected successfully to server');

    const searches = db.collection('savedSearch');

    const year = moment(createdDate).format('YYYY');
    const month = moment(createdDate).format('MM');
    const day = moment(createdDate).format('DD');

    const currentTimeZone = new Date().getTimezoneOffset() / 60;

    const startDate = moment(new Date(year, month - 1, day, 0, 0, 0).setHours(
      new Date(year, month - 1, day, 0, 0, 0).getHours() - currentTimeZone
    )).toISOString();

    const endDate = moment(
      new Date(year, month - 1, day, 0, 0, 0).setHours(23 - currentTimeZone, 59, 59)
    ).toISOString();

    searches.find({
      userEmail: userEmail,
      createdOn: {
        $lte: new Date(endDate),
        $gte: new Date(startDate),
      },
    }).toArray(function(err, items) {
      if (err) throw err;
      cb(null, items);
    });

    db.close();
  });
}

module.exports = {
  getWatchlistByDate,
};
