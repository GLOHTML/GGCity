var currDom;
var t0, t1;
function startPlay(){
	 t0 = performance.now();
}

function doRecordVisit(){
	$.getJSON('//api.ipify.org?format=json', function(data){
		$.getJSON('//freegeoip.app/json/'+data.ip, function(data2){
			recordVisit(data.ip,data2.country_name);
			//console.log(data.ip);
		    //console.log(data2.country_name);
		});
	});
}

function recordVisit(ip,loc){	
	t1 = performance.now();
	var playtime=(t1-t0)/1000;
  var form_data = new FormData();                  
  form_data.append('userip', ip);
  form_data.append('loc',loc);
  form_data.append('dom',currDom);
  form_data.append('playtime',playtime);
	$.ajax({
		url: window.location.href.substring(0, window.location.href.lastIndexOf("/"))+'/RecordVisit.php',
		type: "POST",
		data:form_data,
		processData: false,
		contentType: false,
		success:function(data) {
			//console.log(data);
		}

	});
	
}


function saveData(name,score,phone="",email=""){	
  var form_data = new FormData();
  form_data.append('name', name);
  form_data.append('score', score);
  form_data.append('phone', phone);
  form_data.append('email', email);
  form_data.append('dom', currDom);
	$.ajax({
		url: window.location.href.substring(0, window.location.href.lastIndexOf("/"))+'/SaveData.php',
		type: "POST",
		data:form_data,
		processData: false,
		contentType: false,
		success:function(data) {
			//console.log(data);
		}

	});
	
}
window.addEventListener('message', function(event) {
	currDom = event.origin;
	if(typeof c2_callFunction === "function"){
			c2_callFunction('StartRequest', [event.origin]);
	}
	}, false);
window.parent.postMessage('StartRequest', '*');