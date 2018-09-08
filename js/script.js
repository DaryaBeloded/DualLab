let select = document.getElementById("currency");
let btn = document.getElementById("doIt");
let currValue = select.value;

let btn2 = document.getElementById("doIt2");
let datepick = document.getElementsByClassName("datepicker-here")[0];

// Инициализация
$('#my-element').datepicker({
	maxDate: new Date(),
	range: true

})

// Доступ к экземпляру объекта
$('#my-element').data('datepicker')

function chart(url, curAbr, url2){
	let arg = arguments.length
	let xhr2 = new XMLHttpRequest();
	xhr2.open('GET', url, true);
	xhr2.onload = function(){
		let response2 = JSON.parse(this.responseText);
		
		google.charts.load('current', {'packages':['corechart', 'line']});
   		google.charts.setOnLoadCallback(drawChart);

   		function drawChart(){
   			let arrayForDataTable = [];
   			response2.forEach(function(elem){
   				let narr = [];
   				let ndate = new Date(elem.Date);
   				narr.push(ndate);
      			narr.push(elem.Cur_OfficialRate);
      			arrayForDataTable.push(narr);
      		})

      		if(arg > 2){
				let xhr3 = new XMLHttpRequest();				
				xhr3.open('GET', url2, false);
				xhr3.onload = function(){
					let response3 = JSON.parse(this.responseText);
					response3.forEach(function(elem){
		   				let narr = [];
		   				let ndate = new Date(elem.Date);
		   				narr.push(ndate);
		      			narr.push(elem.Cur_OfficialRate);
		      			arrayForDataTable.push(narr);
	      			})
				}
				xhr3.send();
			}      		

	    	let data = new google.visualization.DataTable();
	    	data.addColumn('date', 'Date');
      		data.addColumn('number', curAbr);
      		data.addRows(arrayForDataTable);

      		var options = {
		    	hAxis: {
			        title: 'Date'
			    },
		    	vAxis: {
			        title: 'Course'
			    },
		    	backgroundColor: '#f1f8e9'
		    }
		    let chart = new google.visualization.LineChart(document.getElementById('chart_div'));
		    chart.draw(data, options);
      	}
	}
	xhr2.send();	
}

let xhr = new XMLHttpRequest();
xhr.open('GET', "http://www.nbrb.by/API/ExRates/Currencies", true);
xhr.onload = function(){
	let response = JSON.parse(this.responseText);

	// КУРС ЗА ПОСЛЕДНЮЮ НЕДЕЛЮ
	btn.addEventListener("click", function(){
		currValue = select.value;
		let arr = [];
		for(let i = 0; i < response.length; i++){
			if(response[i].Cur_Abbreviation == currValue){
				arr.push(response[i]);
			}
		}

		let enddate = new Date();
		let startdate = new Date(enddate.getTime()-6*24*3600*1000);
		let curAbr = arr[arr.length - 1].Cur_Abbreviation;
		let curId = arr[arr.length - 1].Cur_ID;

		let url = `http://www.nbrb.by/API/ExRates/Rates/Dynamics/${curId}?
					startDate=${startdate.getFullYear()}-${startdate.getMonth() + 1}-${startdate.getDate()}
					&endDate=${enddate.getFullYear()}-${enddate.getMonth() + 1}-${enddate.getDate()}`
		chart(url, curAbr);	
	})

	// КУРС ЗА ВЫБРАННЫЙ ПЕРИОД
	btn2.addEventListener("click", function(){
		let dateArr = datepick.value.split('-');
		currValue = select.value;
		let arr = [];
		for(let i = 0; i < response.length; i++){
			if(response[i].Cur_Abbreviation == currValue){
				arr.push(response[i]);
			}
		}

		if(dateArr.length == 2) { 
			let startdate = dateArr[0].trim().split(".").reverse().join("-");
			let enddate = dateArr[1].trim().split(".").reverse().join("-");

			let curAbr = arr[arr.length - 1].Cur_Abbreviation;
			let curId, url;
				if ((new Date(startdate) >= new Date(arr[arr.length - 1].Cur_DateStart)) && (new Date(enddate) <= new Date(arr[arr.length - 1].Cur_DateEnd))){
					curId = arr[arr.length - 1].Cur_ID;
					url = `http://www.nbrb.by/API/ExRates/Rates/Dynamics/${curId}?
						startDate=${startdate}&endDate=${enddate}`;
					chart(url, curAbr);

				}
				else if ((new Date(startdate) >= new Date(arr[0].Cur_DateStart)) && (new Date(enddate) <= new Date(arr[0].Cur_DateEnd))){
						curId = arr[0].Cur_ID;
						url = `http://www.nbrb.by/API/ExRates/Rates/Dynamics/${curId}?
							startDate=${startdate}&endDate=${enddate}`;
						chart(url, curAbr);
					 }	
					 else {
						curId = arr[0].Cur_ID;
					 	url = `http://www.nbrb.by/API/ExRates/Rates/Dynamics/${curId}?
							startDate=${startdate}&endDate=${arr[0].Cur_DateEnd.substring(0, arr[0].Cur_DateEnd.indexOf("T"))}`;
						let curId2 = arr[1].Cur_ID;
						let url2 = `http://www.nbrb.by/API/ExRates/Rates/Dynamics/${curId2}?
							startDate=${arr[1].Cur_DateStart.substring(0, arr[1].Cur_DateStart.indexOf("T"))}&endDate=${enddate}`;
						chart(url, curAbr, url2);
					 }		
		}
	})
}
xhr.onerror = function() {
	console.log("Network Error")
}
xhr.send();
