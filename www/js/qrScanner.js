/**
 * QRリーダ初期化
 */
function qrScannerInit() {
    var qrCancelButton = document.getElementById('QRCancelButton');
    qrCancelButton.addEventListener('click', function () {
        qrScannerHide({ result: null });
    });
}

/**
 * QRリーダー起動
 */
function qrScannerShow() {
    var targetView = 'contents';
    wizViewManager.hide(targetView);
    var prepareDone = function (err, status) {
        // navigator.notification.alert('prepareDone');
        var data = { err: err, status: status };
        if (err) {
            navigator.notification.alert(err.message);
            throw err;
        }

        document.getElementById('QRScanner').style.display = 'block';
        QRScanner.show(showDone);
    };
    var showDone = function (status) {
        // navigator.notification.alert('showDone');
        var data = { status: status };
        qrScannerScan();
    };
    QRScanner.prepare(prepareDone);
}

/**
 * QRリーダースキャン開始 
 */
function qrScannerScan() {
    // navigator.notification.alert('qrScannerScan');
    var scanDone = function (err, contents) {
        var data = { err: err, contents: contents };
        if (err) {
            throw err;
        }
        // alert(JSON.stringify(contents));
        qrScannerHide({ result: contents });
    };
    QRScanner.scan(scanDone);
}

/**
 * QRリーダー破棄
 * @param data
 */
function qrScannerHide(data) {
    var hideDone = function (status) {
        // var data = { status: status };
        // navigator.notification.alert(status);
    };
    var destroyDone = function (status) {
        // var data = { status: status };
        // navigator.notification.alert(status);
    };
    // QRScanner.hide(hideDone);
    QRScanner.destroy(destroyDone);
    document.getElementById('QRScanner').style.display = 'none';
    var targetView = 'contents';
    wizViewManager.show(targetView);
    wizViewMessenger.postMessage(JSON.stringify(data), targetView);
}
