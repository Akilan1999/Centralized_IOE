var DB_config = require('../../config/database.js');

//This shows the cheapest electrictiy avaliable in the market
exports.home = function(req, res) {


	var session = {
		'user_id':req.session.user_id,
		'username':req.session.username
	};

  /* Checks if session.username exsists. If not then redirects to the login page */
	if(req.session.username != null){

  //Query 1 to display top 10 cheapest per KwH
	DB_config.connection.query("SELECT sell_id,seller_id,users.name as name,Total_KwH,Cost_per_KwH FROM users,sellers" +
	" where users.user_id = sellers.seller_id order by Cost_per_KwH limit 10;",
	function (err, result, fields) {
    if (err) throw err;

     //displays the battery information of the user logged in
		 DB_config.connection.query("select * from battery_info where user_id = ?",[session.user_id],
		 function (err_battery, result_battery, fields_battery) {

			 if (err_battery) throw err_battery;
			 //renders index page with certain data passed
			 res.render('index.ejs',{sellers:result,session:session,battery:result_battery});
		 });
  });

  }
  else{
	 res.redirect('/login');
  }
}

//This allows the customer to sell specific amount of electricity in the market
exports.sell = function(req, res) {

	//post request of sell
   var Amt_KwH = req.body.Amt_KwH;
	 var Cost_per_KwH = req.body.Cost_per_KwH;
	 var Battery = req.body.select_battery;
	 var User_id = req.session.user_id;

	 DB_config.connection.query("insert into sellers(seller_id,Total_KwH,Cost_per_KwH) values(?,?,?)",[User_id,Amt_KwH,Cost_per_KwH],
 	 function (err, result, fields) {

 		if (err) throw err;
 		//renders index page with certain data passed
 		res.redirect('/home');
 	 });


}

//This allows customers to buy from our grid
exports.buy = function(req, res) {

	var session = {
		'user_id':req.session.user_id,
		'username':req.session.username
	};

	//post request for buying
	var Amt_KwH = req.body.Amt_KwH;
	var Cost_per_KwH = req.body.Cost_per_KwH;
	var Seller_id = req.body.Seller_id;
	var Sell_id = req.body.Sell_id;

	var total = Math.round((Amt_KwH * Cost_per_KwH)*100)/100; //Rounds the total to 2 decimal places
	var date = new Date().toISOString().slice(0, 19).replace('T', ' '); //Converts date to sql date format

	//Inserts the information to the bill
	DB_config.connection.query("insert into bills(buyer_id,seller_id,No_of_KwH,Cost_per_KwH,b_date) values(?,?,?,?,?)",[session.user_id,Seller_id,Amt_KwH,Cost_per_KwH,date],
	function (err, result, fields) {

	 if (err) throw err;
	 //updates seller information
	 DB_config.connection.query("update sellers set Total_KwH = Total_KwH - ? where sell_id = ?",[Amt_KwH,Sell_id],
 	 function (err_update, result_update, fields_update) {

 	  if (err_update) throw err_update;
	 //Gets informations about Total_KwH seller
	 DB_config.connection.query("select Total_KwH from sellers where sell_id = ?",[Sell_id],
	 function (err_query, result_query, fields_query) {

		if (err_query) throw err_query;

		//if the KwH is equal to zero then it deletes the entire row
	  if (result_query[0].Total_KwH === 0){
			DB_config.connection.query("delete from sellers where sell_id = ?",[Sell_id],
	 	  function (err_query, result_query, fields_query) {
	 		  if (err_query) throw err_query;
          res.redirect('/home');
	 	});
		}
		else{
	 res.redirect('/home');
    }
	});
 	});
	});


}

//To view bills
exports.bills = function(req, res) {

	var session = {
	 'user_id':req.session.user_id,
	 'username':req.session.username
  };

	if(req.session.username != null){

		DB_config.connection.query("select bill_no,name, No_of_KwH,Cost_per_KwH,b_date from bills,users where seller_id = user_id AND buyer_id = ? order by b_date desc",[session.user_id],
		function (err, result, fields) {

			if (err) throw err;
			//renders index page with certain data passed
		  res.render('bills.ejs',{session:session,bills:result});
		});

	}
	else{
		 res.redirect('/login');
	}

	//Local functions that cannot be exported




}
