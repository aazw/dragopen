let isDragging = false;
let startX = 0, startY = 0;
let selectionBox = null;

// マウスダウンでドラッグ開始
document.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || !e.shiftKey) return; // 左クリックかつShiftキーが押されている場合のみ反応

    // 選択を無効化
    document.onselectstart = () => false;

    isDragging = true;
    startX = e.pageX;
    startY = e.pageY;

    // 矩形要素を作成
    selectionBox = document.createElement('div');
    selectionBox.classList.add('dragopen-selection-box');
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    document.body.appendChild(selectionBox);
});

// マウスムーブで矩形を拡大
document.addEventListener('mousemove', (e) => {
    if (!isDragging || !selectionBox) return;

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
document.addEventListener('mouseup', () => {
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
            chrome.runtime.sendMessage(selectedLinks);
        }

        // 矩形を削除
        document.body.removeChild(selectionBox);
        selectionBox = null;
    }

    // 無効化を解除
    document.onselectstart = null;

    isDragging = false;
});
