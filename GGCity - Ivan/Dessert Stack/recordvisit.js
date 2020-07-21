var currDom;
var t0, t1;
function startPlay(){
	console.log("game start");
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
	console.log("record");
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


function saveData(nama,score,phone="",email=""){	
	console.log("save data");
	var additional="Name="+nama+"&Score="+score;
	if(phone!=""){
		additional+="&Phone="+phone;
	}
	if(email!=""){
		additional+="&Email="+email;
	}
	additional+="&Dom="+currDom;
	var targetUrl=window.location.href.substring(0, window.location.href.lastIndexOf("/"))+'/SaveData.php?'+additional;
	console.log(targetUrl);
	$.ajax({
		url: targetUrl,
		type: "POST",
		success:function(data) {
			//console.log(data);
			window.parent.postMessage('RefreshTable', '*');
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