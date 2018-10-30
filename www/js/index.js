

var environment = {
    url: 'https://tbp-experiment-tiff.azurewebsites.net'
};
var app = {
    /**
     * 初期化
     * @function initialize
     */
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    /**
     * API準備完了
     * @function onDeviceReady
     */
    onDeviceReady: function () {
        document.addEventListener("backbutton", app.onBackKeyDown, false);
        window.addEventListener('message', this.callNative, false);
        var button = document.getElementById('reloadButton');
        button.addEventListener('click', app.reload.bind(this));
        this.createWizViewManager();
        qrScannerInit();
        document.getElementById('loading').style.display = 'none';
    },
    /**
     * webview起動（wizViewManager）
     * @function createWizViewManager
     */
    createWizViewManager: function () {
        var viewName = 'contents';
        var devicePixelRatio = window.devicePixelRatio;
        var adMobHeight = 50;
        var url = environment.url;
        var option = {
            src: url,
            // TODO 広告分の高さ調整
            // height: ((/android/i).test(device.platform))
            //     ? (window.innerHeight - adMobHeight) * devicePixelRatio
            //     : window.innerHeight - adMobHeight
        };
        var success = function () {
            wizViewManager.show(viewName);
            ocument.getElementById('loading').style.display = 'none';
        };
        var fail = function (err) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
            var button = document.getElementById('reloadButton');
            button.disabled = false;
        };
        wizViewManager.create(viewName, option, success, fail);
        // 下記で連携
        // var targetView = 'mainView';
        // wizViewMessenger.postMessage(data, targetView);
    },

    /**
     * ネイティブ連携
     * @function callNative
     */
    callNative: function (res) {
        try {
            var targetView = 'contents';
            var data = JSON.parse(res.data);
            if (data.method === 'inAppBrowser') {
                // 外部リンク
                cordova.InAppBrowser.open(data.option.url, data.option.target);
            } else if (data.method === 'fido') {
                // 生体認証
                if (data.option.action === 'register') {
                    executeRegistration(data.option.user);
                } else if (data.option.action === 'authentication') {
                    executeAuthentication(data.option.user);
                } else if (data.option.action === 'remove') {
                    deleteRegistration(data.option.handle, data.option.user);
                } else if (data.option.action === 'registerList') {
                    executeDeregistration(data.option.user);
                }
            } else if (data.method === 'device') {
                // 端末情報
                wizViewMessenger.postMessage(JSON.stringify(device), targetView);
            } else if (data.method === 'geolocation') {
                // 位置情報
                if (navigator.geolocation === undefined) {
                    wizViewMessenger.postMessage(
                        JSON.stringify(new Error('navigator.geolocation is undefined')),
                        targetView
                    );
                    return;
                }
                var done = function (position) { wizViewMessenger.postMessage(JSON.stringify(position), targetView) };
                var fail = function (error) { wizViewMessenger.postMessage(JSON.stringify(error), targetView) };
                navigator.geolocation.getCurrentPosition(done, fail, data.option);
            } else if (data.method === 'QRScanner') {
                // QRリーダー
                if (data.option.action === 'show') {
                    cordova.plugins.barcodeScanner.scan(
                        function (result) {
                            wizViewMessenger.postMessage(JSON.stringify({result: result, error: null}), targetView);
                        },
                        function (error) {
                            wizViewMessenger.postMessage(JSON.stringify({result: null, error: error}), targetView);
                        },
                        {
                            orientation : 'portrait'
                        }
                    );
                }
            }
        } catch (err) {
            navigator.notification.alert(err.message);
        }
    },
    /**
     * @function reload
     * @param {Event} event
     */
    reload: function (event) {
        event.preventDefault();
        document.getElementById('loading').style.display = 'block';
        var button = document.getElementById('reloadButton');
        button.disabled = true;
        setTimeout(this.createWizViewManager, 3000);
    },
    /**
     * @function onBackKeyDown
     * @param {Event} event
     */
    onBackKeyDown(event) {
        event.preventDefault();
    }
};

app.initialize();
