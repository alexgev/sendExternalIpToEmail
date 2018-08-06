var nodemailer = require('nodemailer');
var publicIp = require('public-ip');
var async = require('async');
var CronJob = require('cron').CronJob;
var http = require('http');
var port = 1339;
var externalIp = '';


var server = http.createServer();

server.listen(port, function() {
	console.log('server listening on port ' + port);
	new CronJob('*/30 * * * * *', function () {
		sendIp();
	}, null, true, 'Europe/Moscow');
})


function sendIp() {
	var transporter = nodemailer.createTransport({
		service: 'yandex',
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASS
		}
	});
	
	async.waterfall([
		function(next) {
			publicIp.v4()
				.then(function(ip) {
					if (ip == externalIp) return next({notChanged: true});
					externalIp = ip;
					next(null, ip);
				}, function(err) {
					next(err);
				})
		},
		function(ip, next) {
			var mailOptions = {
				from: process.env.EMAIL,
				to: process.env.EMAIL,
				subject: 'External ip',
				text: 'Your external ip: ' + ip
			};
			transporter.sendMail(mailOptions, function(err, info){
				if (err) return next(err);
				next(null, info);
			});
		}
	], function(err, result) {
		if (err) console.log(err);
		console.log(result);
	})

}





