window.addEventListener("load", myMain, false);

function myMain(evt) {
	var jsInitChecktimer = setInterval(checkForJS_Finish, 3000);

	async function checkForJS_Finish() {
		if (document.getElementsByClassName("pull-left graph-name")==null||typeof(document.getElementsByClassName("pull-left graph-name"))=='Undefined'||document.querySelector(".footer")==null||document.querySelector(".ibox")==null){

		} else{
			clearInterval(jsInitChecktimer);
			
		
			let page_title = document.title,
				page_h1_tag = '';

			if (document.querySelector("h1") !== null)
				page_h1_tag = document.querySelector("h1").textContent;

			if (document.querySelector('#graph_values_listing') !== null)
				page_h1_tag = "Table";
			// prepare JSON data with page title & first h1 tag
			let data = JSON.stringify({ title: page_title, h1: page_h1_tag });

			// send message back to popup script

			//chrome.runtime.sendMessage(null, data);
			let data2 = [];
			if (document.getElementById('graph_values_listing')) {

				var tbody = document.getElementById("graph_values_listing");
				var tr = tbody.getElementsByTagName("tr")
				var graph_name = document.getElementsByClassName("pull-left graph-name")[0].textContent;

				for (t = 0; t < tr.length; t++) {
					var td = tr[t].getElementsByTagName("td")
					r(td, graph_name);
					if (t == tr.length - 1) {
						//var d = JSON
						//sendMessage(data2)
						var s = JSON.stringify(data2) 
						if(data2.length<1){
							await chrome.runtime.sendMessage(zzz)
						}else{
							await chrome.runtime.sendMessage(null, s);

						}
						//await chrome.runtime.sendMessage({ action: "addData", data: s, url: url });
						

					}

					
				}
			}
			function r(td, graph_name) {
				var entry = new Map();
				for (d = 0; d < td.length; d++) {
					if (d == 0) {
						entry.set('graph_name', graph_name);
						entry.set('date', td[d].textContent)
					}
					else if (d == 1) {
						// console.log(td[d])
						console.log(td[d].getElementsByClassName("graph_values")[0].value)
						entry.set('value', td[d].getElementsByClassName("graph_values")[0].value)
					}
					else if (d == 2) {
						entry.set('by', td[d].textContent)
					} else if (d == 3) {
						entry.set('change', td[d].textContent)
					} else if (d == 4) {
						entry.set('change', td[d].textContent)
					}
					if (d == td.length - 1) {
						const obj = Object.fromEntries(entry);
						data2.push(obj);
						console.log(td[d].textContent)


						// do something with response here, not outside the function
						//console.log(response);



					}
				}
			}






		}
	}
}






//Select The Stastic Page   