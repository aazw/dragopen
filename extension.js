const isDebug = false;

let isDragging = false;
let startX = 0, startY = 0;
let selectionBox = null;

// マウスダウンでドラッグ開始
document.addEventListener('mousedown', (e) => {
    if (isDebug) {
        console.log(`mousedown: pageX: ${e.pageX}, pageY: ${e.pageY}, isDragging: ${isDragging}`);
    };

    // 左クリックかつShiftキーが押されている場合のみ反応
    if (e.button !== 0 || !e.shiftKey) return;

    // 選択を無効化
    document.onselectstart = () => false;

    // 昔の矩形が残ってしまってたら削除
    if (selectionBox) {
        // 矩形を削除
        document.body.removeChild(selectionBox);
        selectionBox = null;
    }

    // 矩形要素を作成
    isDragging = true;
    startX = e.pageX;
    startY = e.pageY;

    selectionBox = document.createElement('div');
    selectionBox.classList.add('dragopen-selection-box');
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    document.body.appendChild(selectionBox);
});

// マウスムーブで矩形を拡大
document.addEventListener('mousemove', (e) => {
    if (!isDragging || !selectionBox) return;

    if (isDebug) {
        console.log(`mousemove: pageX: ${e.pageX}, pageY: ${e.pageY}, isDragging: ${isDragging}`);
    };

    // 矩形描写
    const currentX = e.pageX;
    const currentY = e.pageY;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);

    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;

    // 対象判定
    if (selectionBox) {
        // 矩形内にあるリンクを取得
        const rect = selectionBox.getBoundingClientRect();
        const links = document.querySelectorAll('a');

        for (const link of links) {
            // 見えない状態だがそこに存在するタグを排除
            if (!isElementVisible(link)) {
                continue;
            }

            // リンクの形を取得
            const linkRect = link.getBoundingClientRect();

            // 矩形とリンクが一部でも重なるかを確認
            const isOverlapping =
                rect.left < linkRect.right &&
                rect.right > linkRect.left &&
                rect.top < linkRect.bottom &&
                rect.bottom > linkRect.top;

            if (isOverlapping) {
                if (!link.classList.contains("dragopen-selected")) {
                    link.classList.add('dragopen-selected');
                }
            } else {
                if (link.classList.contains("dragopen-selected")) {
                    link.classList.remove('dragopen-selected');
                }
            }
        }
    }
});

// マウスアップでドラッグ終了
document.addEventListener('mouseup', (e) => {
    if (isDebug) {
        console.log(`mouseup: pageX: ${e.pageX}, pageY: ${e.pageY}, isDragging: ${isDragging}`);
    }

    if (!isDragging) return;

    if (selectionBox) {
        // 対象のaタグを取得
        const links = document.querySelectorAll('a.dragopen-selected');

        // 対象のaタグからhrefのURLを取得
        const selectedLinks = [];
        for (const link of links) {
            // URL取得
            selectedLinks.push(link.href);

            // 選択中を示すクラスを削除
            link.classList.remove('dragopen-selected');
        }

        // background.jsにメッセージ(url一覧)を送信
        if (selectedLinks.length > 0) {
            // URLの重複を排除
            // https://tech.iimon.co.jp/entry/2024/12/20#-2-Set-%E3%81%AB%E3%82%88%E3%82%8B%E9%87%8D%E8%A4%87%E5%89%8A%E9%99%A4
            const uniqLinks = [...new Set(selectedLinks)];
            if (isDebug) {
                console.log(uniqLinks);
            }

            try {
                chrome.runtime.sendMessage(uniqLinks);
            }
            catch (e) {
                console.error("the links can be not opened because background process is invalidated.");
                console.error(e);
            }
        }

        // 矩形を削除
        document.body.removeChild(selectionBox);
        selectionBox = null;
    }

    // 無効化を解除
    document.onselectstart = null;

    isDragging = false;
});

// HTML要素が「実際に見えるかどうか」を判定する
// DOMにおける要素の表示状態を確認する
function isElementVisible(el) {

    // 要素が存在しない場合は不可視とみなす
    if (!el) return false;

    // 実際に適用されているCSSスタイルを取得
    const style = window.getComputedStyle(el);

    // display が none でないか、visibility が hidden でないか
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        return false;
    }

    // offsetParent が null の場合も非表示とみなす（例: position: absolute; display: none;など）
    if (el.offsetParent === null) {
        return false;
    }

    // offsetWidth と offsetHeight が 0 の場合
    if (el.offsetWidth === 0 && el.offsetHeight === 0) {
        return false;
    }

    // 表示されている
    return true;
}
