'use strict'

const fs = require('fs');

console.log('start');



fs.readFile('data.txt', 'utf-8', function (err, data) {
	if (err) throw err;

	const newData =
		data
			.split('\n').filter(function (line) {
				return line.length > 0;
			})
			.map(function (item, index) {
				return (index + 1) + '.' + item;
			})
	fs.writeFile('data_out.txt', newData, function (err) {
		if (err) throw err;
	})
});

console.log('done');

// szinkron toporog az jtoban
//aszinkron addig megterit meg kitakarit
