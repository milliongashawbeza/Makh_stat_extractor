'use strict';
let urls_list = [
	'https://app.makh.org/1683762405/statistics/detail-graph/2#Weekly',
	'https://app.makh.org/1683762405/statistics/detail-graph/1#Weekly'
];

downloadBn.addEventListener('click', function(){
	window.open('http://localhost:5001/download/filtered_urls');
}, false) 

chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) { 
	   chrome.tabs.query({}, function (tabs) {
		   tabs.forEach((tab) => {
			 chrome.tabs.sendMessage( 
			   tab.id,
			   urls_list, 
			   function (response) {
				// do something here if you want 
				console.log(response);
			   }
			 );
		   });
		 });
		 console.log(sender.tab ?
				 "from a content script:" + sender.tab.url :
				 "from the extension");
	 if (request.greeting=="hello") 
		 x()
	   sendResponse({farewell: "goodbye3"});
   }
 );  


chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) {
	 console.log(sender.tab ?
				 "from a content script:" + sender.tab.url :
				 "from the extension");
	 if (request.greeting == "hello") {
	   x()
	   sendResponse({farewell: "goodbye2"});
	 }
	   
	  
   }
 );
// start navigation when #startNavigation button is clicked
   function x() {
   // query the current tab to find its id
   chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
	   for(let i=0; i<urls_list.length; i++) {
		   // navigate to next url
		   await goToPage(urls_list[i], i+1, tabs[0].id);
		   
		   // wait for 5 seconds
		   await waitSeconds(5);
	   }

	   // navigation of all pages is finished
	   alert('Navigation Completed');
   });
};

async function goToPage(url, url_index, tab_id) {
   return new Promise(function(resolve, reject) {
	   // update current tab with new url
	   chrome.tabs.update({url: url});
	   
	   // fired when tab is updated
	   chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
		   // tab has finished loading, validate whether it is the same tab
		   if(tab_id == tabID && changeInfo.status === 'complete') {
			   // remove tab onUpdate event as it may get duplicated
			   chrome.tabs.onUpdated.removeListener(openPage);

			   // fired when content script sends a message
			   chrome.runtime.onMessage.addListener(function getDOMInfo(message) {
				   // remove onMessage event as it may get duplicated
				   chrome.runtime.onMessage.removeListener(getDOMInfo);

				   // save data from message to a JSON file and download
				   let json_data = {
					   title: JSON.parse(message).title,
					   h1: JSON.parse(message).h1,
					   url: url
				   };

				   let blob = new Blob([JSON.stringify(json_data)], {type: "application/json;charset=utf-8"});
				   let objectURL = URL.createObjectURL(blob);
				   chrome.downloads.download({ url: objectURL, filename: ('content/' + url_index + '/data.json'), conflictAction: 'overwrite' });
			   });

			   // execute content script
			   chrome.tabs.executeScript({ file: 'script.js' }, function() {
				   // resolve Promise after content script has executed
				   resolve();
			   });
		   }
	   });
   });
}

// async function to wait for x seconds 
async function waitSeconds(seconds) {
   return new Promise(function(resolve, reject) {
	   setTimeout(function() {
		   resolve();
	   }, seconds*1000);
   });
}
// list of urls to navigate
