window.addEventListener("load", myMain, false);

function myMain(evt) {
	var jsInitChecktimer = setInterval(checkForJS_Finish, 111);

	async function checkForJS_Finish() {
		if (document.querySelector(".footer")==null||document.querySelector(".ibox")==null){

		} else{
			clearInterval(jsInitChecktimer);
			var url = []
			if (document.getElementsByClassName("breadcrumb")[0]) {
			
				const node = document.createElement("li");
				const createButton = document.createElement('button')
				createButton.innerText = 'Export'
				createButton.id = "buttonId";
				createButton.className = "btn btn-danger btn-xs";
				node.appendChild(createButton)

				document.getElementsByClassName("breadcrumb")[0].appendChild(node);
				document.getElementById("buttonId").onclick = function jsFunc() {
					var v = document.getElementsByClassName('ibox-title');
					for (x = 0; x < v.length; x++) {
						var u = v[x].getElementsByTagName('a')[0].href
						url.push(u);
						// exportUrl(v[x]) 
					
						if (x == v.length - 1) {
							(async () => { 
								
								const response = await chrome.runtime.sendMessage({ greeting: "hello" ,data:url});
								// do something with response here, not outside the function
								console.log(response);
							})();
						}
					}
					//document.getElementsByClassName('ibox-title')[0].getElementsByTagName('a')[0].click();    

					console.log("Scraping Started")
				}
			}
		


		}
	}
}






//Select The Stastic Page   