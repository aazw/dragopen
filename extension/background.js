// extension.jsからのメッセージ(url一覧)が受信された時に実行する処理
chrome.runtime.onMessage.addListener((urls, sender) => {
	// URLを開く
	for (const url of urls) {
		// 同じウインドウの非アクティブな新しいタブで開く
		// https://stackoverflow.com/questions/16503879/chrome-extension-how-to-open-a-link-in-new-tab
		chrome.tabs.create({
			url: url,
			active: false,
		});
	}
});
