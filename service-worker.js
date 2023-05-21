// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.



console.log("This prints to the console of the service worker (background script)")
importScripts('service-worker-utils.js')

let urls_list = [];
chrome.runtime.onInstalled.addListener(function () {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: { hostEquals: 'https://app.makh.org/' },
			})
			],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});


function makeid(length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}
var page_no = 0;
var file_name = ''
chrome.runtime.onMessage.addListener(
	async function (request, sender, sendResponse) {
		console.log(sender.tab ?
			"from a content script:" + sender.tab.url :
			"from the extension");
		if (request.action == "addData") {
			console.log(request.data)
			try {
				fetch("http://localhost:5001/export/" + file_name, {
					method: "POST",
					body: request.data,
					headers: {
						"Content-type": "application/json; charset=UTF-8"
					}
				});
			} catch (e) {
				console.log("Error" + e)
			}
			page_no = page_no + 1;
			console.log("page " + page_no)
			sendResponse({ farewell: "goodbye/3" });
			s(page_no)
		}
		if (request.greeting == "hello") {
			page_no = 0;
			file_name = 'export_' + makeid(7);
			await chrome.storage.session.set({ name: "David", color: "green" });
			const { name, color } = await chrome.storage.session.get(["name", "color"]);
			console.log({ name, color });
			urls_list = request.data;
			//urls_list.push(urls_list[0])
			console.log(urls_list);
			sendResponse({ farewell: "goodbye/3" });
			loop_urls()
		}

	}
);


function loop_urls() {
	// query the current tab to find its id
	chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
		for (let i = 0; i < urls_list.length; i++) {
			// navigate to next url
			await goToPage(urls_list[i], i + 1, tabs[0].id);

			// wait for 5 seconds
			await waitSeconds(15);
			if(i==0){
				await goToPage(urls_list[i], i + 1, tabs[0].id);
			}
			if (i == urls_list.length - 1) {
				var filename = file_name+'.xlsx'
				var urlx = "http://localhost:5001/download/" + file_name;
				chrome.downloads.download({ filename: filename, url: urlx });
				//	fetch("http://localhost:5001/download/"+file_name, {
				//				method: "get",
				//				headers: {
				//					"Content-type": "application/json; charset=UTF-8"
				//				}
				//			});
			}
		}


		// navigation of all pages is finished
		//alert('Navigation Completed');
	});
};
// start na vigation when #startNavigation button is clicked

async function goToPage(url, url_index, tab_id) {
	return new Promise(function (resolve, reject) {
		// update current tab with new url
		chrome.tabs.update({ url: url });

		// fired when tab is updated
		chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
			// tab has finished loading, validate whether it is the same tab
			if (tab_id == tabID && changeInfo.status === 'complete') {
				// remove tab onUpdate event as it may get duplicated
				chrome.tabs.onUpdated.removeListener(openPage);
				// fired when content script sends a message
				chrome.runtime.onMessage.addListener(function getDOMInfo(message) {
					// remove onMessage event as it may get duplicated
					chrome.runtime.onMessage.removeListener(getDOMInfo);
					console.log(message)
					// save data from message to a JSON file and download
					try {
						fetch("http://localhost:5001/export/" + file_name, {
							method: "POST",
							body: message,
							headers: {
								"Content-type": "application/json; charset=UTF-8"
							}
						})
					} catch (e) {
						console.log("Error" + e)
					}
				});
				// execute content script
				chrome.scripting.executeScript({
					target: { tabId: tab_id, allFrames: true },
					files: ["script2.js"],
				}).then(() => {
					resolve();
				});
			}
		});
	});
}
// async function goToPage(url, url_index, tab_id) {
// 	return new Promise(function (resolve, reject) {
// 		// update current tab with new url
// 		chrome.tabs.update({ url: url });
// 		console.log("TAB ID 1" + tab_id);
// 		// fired when tab is updated
// 		chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
// 			// tab has finished loading, validate whether it is the same tab
// 			if (tab_id == tabID && changeInfo.status === 'complete') {
// 				console.log("Tab ID 2 " + tabID);
// 				// remove tab onUpdate event as it may get duplicated
// 				chrome.tabs.onUpdated.removeListener(openPage);

// 				// fired when content script sends a message

// 				chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
// 					console.log("Message received.. ")
// 					if (request.action == "addData") {
// 						console.log(request.data)
// 						try {
// 							fetch("http://localhost:5001/export/" + file_name, {
// 								method: "POST",
// 								body: request.data,
// 								headers: {
// 									"Content-type": "application/json; charset=UTF-8"
// 								}
// 							});
// 						} catch (e) {
// 							console.log("Error" + e)
// 						}

// 						console.log("page * " + page_no)

// 						sendResponse({ farewell: "goodbye /3" });
// 						chrome.scripting.executeScript({
// 							target: { tabId: tab_id, allFrames: true },
// 							files: ["script.js"],
// 						}).then(() => { resolve() });
// 					}
// 				}
// 				);
// 				chrome.scripting.executeScript({
// 					target: { tabId: tab_id, allFrames: true },
// 					files: ["script.js"],
// 				}).then(() => { resolve() });
// 			}
// 		});
// 	});
// }

// async function to wait for x seconds 
async function waitSeconds(seconds) {
	return new Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve();
		}, seconds * 1000);
	});
}
