/**
 * Copyright (c) 2006-2020, JGraph Ltd
 * Copyright (c) 2006-2020, draw.io AG
 */

/**
 * 为可选的 x 和 y 坐标构造一个新点。如果不
 * 给出坐标，然后使用 <x> 和 <y> 的默认值。
 * @constructor
 * @class Implements a basic 2D point. Known subclassers = {@link mxRectangle}.
 * @param {number} x X-coordinate of the point.
 * @param {number} y Y-coordinate of the point.
 */
App = function (editor, container, lightbox) {
    EditorUi.call(this, editor, container, (lightbox != null) ? lightbox :
        (urlParams['lightbox'] == '1' || (uiTheme == 'min' &&
            urlParams['chrome'] != '0')));

    // 记录卸载窗口并修改 Google Drive 文件
    if (!mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp) {
        window.onunload = mxUtils.bind(this, function () {
            var file = this.getCurrentFile();

            if (file != null && file.isModified()) {
                var evt = {
                    category: 'DISCARD-FILE-' + file.getHash(),
                    action: ((file.savingFile) ? 'saving' : '') +
                        ((file.savingFile && file.savingFileTime != null) ? '_' +
                            Math.round((Date.now() - file.savingFileTime.getTime()) / 1000) : '') +
                        ((file.saveLevel != null) ? ('-sl_' + file.saveLevel) : '') +
                        '-age_' + ((file.ageStart != null) ? Math.round((Date.now() - file.ageStart.getTime()) / 1000) : 'x') +
                        ((this.editor.autosave) ? '' : '-nosave') +
                        ((file.isAutosave()) ? '' : '-noauto') +
                        '-open_' + ((file.opened != null) ? Math.round((Date.now() - file.opened.getTime()) / 1000) : 'x') +
                        '-save_' + ((file.lastSaved != null) ? Math.round((Date.now() - file.lastSaved.getTime()) / 1000) : 'x') +
                        '-change_' + ((file.lastChanged != null) ? Math.round((Date.now() - file.lastChanged.getTime()) / 1000) : 'x') +
                        '-alive_' + Math.round((Date.now() - App.startTime.getTime()) / 1000),
                    label: (file.sync != null) ? ('client_' + file.sync.clientId) : 'nosync'
                };

                if (file.constructor == DriveFile && file.desc != null && this.drive != null) {
                    evt.label += ((this.drive.user != null) ? ('-user_' + this.drive.user.id) : '-nouser') + '-rev_' +
                        file.desc.headRevisionId + '-mod_' + file.desc.modifiedDate + '-size_' + file.getSize() +
                        '-mime_' + file.desc.mimeType;
                }

                EditorUi.logEvent(evt);
            }
        });
    }

    // 记录更改以自动保存
    this.editor.addListener('autosaveChanged', mxUtils.bind(this, function () {
        var file = this.getCurrentFile();

        if (file != null) {
            EditorUi.logEvent({
                category: ((this.editor.autosave) ? 'ON' : 'OFF') +
                    '-AUTOSAVE-FILE-' + file.getHash(), action: 'changed',
                label: 'autosave_' + ((this.editor.autosave) ? 'on' : 'off')
            });
        }
    }));

    // Pre-fetches images
    if (mxClient.IS_SVG) {
        mxGraph.prototype.warningImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAE7SURBVHjaYvz//z8DJQAggBjwGXDuHMP/tWuD/uPTCxBAOA0AaQRK/f/+XeJ/cbHlf1wGAAQQTgPu3QNLgfHSpZo4DQAIIKwGwGyH4e/fFbG6AiQJEEAs2Ew2NFzH8OOHBMO6dT/A/KCg7wxGRh+wuhQggDBcALMdFIAcHBxgDGJjcwVIIUAAYbhAUXEdVos4OO4DXcGBIQ4QQCguQPY7sgtgAYruCpAgQACx4LJdU1OCwctLEcyWlLwPJF+AXQE0EMUBAAEEdwF6yMOiD4RRY0QT7gqQAEAAseDzu6XldYYPH9DD4joQa8L5AAEENgWb7SBcXa0JDQMBrK4AcQACiAlfyOMCEFdAnAYQQEz4FLa0XGf4/v0H0IIPONUABBAjyBmMjIwMS5cK/L927QORbtBkaG29DtYLEGAAH6f7oq3Zc+kAAAAASUVORK5CYII=';
    } else {
        var img = new Image();
        img.src = mxGraph.prototype.warningImage.src;
    }

    //处理弹出窗口拦截器的全局助手方法
    window.openWindow = mxUtils.bind(this, function (url, pre, fallback) {
        if (urlParams['openInSameWin'] == '1') {
            fallback();
            return;
        }

        var wnd = null;

        try {
            wnd = window.open(url);
        } catch (e) {
            // ignore
        }

        if (wnd == null || wnd === undefined) {
            this.showDialog(new PopupDialog(this, url, pre, fallback).container, 320, 140, true, true);
        } else if (pre != null) {
            pre();
        }
    });

    // 工具栏项目的初始状态被禁用
    this.updateDocumentTitle();
    this.updateUi();

    // 显示错误消息的全局辅助方法
    window.showOpenAlert = mxUtils.bind(this, function (message) {
        // 在显示错误消息之前必须调用取消
        if (window.openFile != null) {
            window.openFile.cancel(true);
        }

        this.handleError(message);
    });

    //通过拖放处​​理打开文件
    if (!this.editor.chromeless || this.editor.editable) {
        this.addFileDropHandler([document]);
    }

    // 处理等待插件的队列
    if (App.DrawPlugins != null) {
        for (var i = 0; i < App.DrawPlugins.length; i++) {
            try {
                App.DrawPlugins[i](this);
            } catch (e) {
                if (window.console != null) {
                    console.log('Plugin Error:', e, App.DrawPlugins[i]);
                }
            } finally {
                App.embedModePluginsCount--;
                this.initializeEmbedMode();
            }
        }

        // 为插件安装全局回调
        window.Draw.loadPlugin = mxUtils.bind(this, function (callback) {
            try {
                callback(this);
            } finally {
                App.embedModePluginsCount--;
                this.initializeEmbedMode();
            }
        });

        //设置超时以防插件无法快速加载或根本无法加载
        setTimeout(mxUtils.bind(this, function () {
            //Force finish loading if its not yet called
            if (App.embedModePluginsCount > 0) {
                App.embedModePluginsCount = 0;
                this.initializeEmbedMode();
            }
        }), 5000); //5 秒超时
    }

    this.load();
};

/**
 * 超时错误
 */
App.ERROR_TIMEOUT = 'timeout';

/**
 * 忙错误
 */
App.ERROR_BUSY = 'busy';

/**
 * 未知错误
 */
App.ERROR_UNKNOWN = 'unknown';

/**
 * 谷歌驱动模式
 */
App.MODE_GOOGLE = 'google';

/**
 * Dropbox 模式
 */
App.MODE_DROPBOX = 'dropbox';

/**
 * OneDrive 模式
 */
App.MODE_ONEDRIVE = 'onedrive';

/**
 * Github 模式
 */
App.MODE_GITHUB = 'github';

/**
 * Gitlab mode
 */
App.MODE_GITLAB = 'gitlab';

/**
 * 设备模式
 */
App.MODE_DEVICE = 'device';

/**
 * 浏览器模式
 */
App.MODE_BROWSER = 'browser';

/**
 * Trello 应用模式
 */
App.MODE_TRELLO = 'trello';

/**
 * 嵌入应用模式
 */
App.MODE_EMBED = 'embed';

/**
 * 以毫秒为单位设置自动保存的延迟。默认值为 2000。
 */
App.DROPBOX_APPKEY = 'libwls2fa9szdji';

/**
 * 设置 URL 以从中加载 Dropbox SDK
 */
App.DROPBOX_URL = window.DRAWIO_BASE_URL + '/js/dropbox/Dropbox-sdk.min.js';

/**
 * 设置 URL 以从中加载 Dropbox dropins JS。
 */
App.DROPINS_URL = 'https://www.dropbox.com/static/api/2/dropins.js';

/**
 * OneDrive 客户端 JS（文件/文件夹选择器）。这是一个稍微修改的版本，允许使用 accessTokens
 * 但它不适用于 IE11，所以我们回退到原来的
 */
App.ONEDRIVE_URL = mxClient.IS_IE11 ? 'https://js.live.net/v7.2/OneDrive.js' : window.DRAWIO_BASE_URL + '/js/onedrive/OneDrive.js';
App.ONEDRIVE_INLINE_PICKER_URL = window.DRAWIO_BASE_URL + '/js/onedrive/mxODPicker.js';

/**
 * Trello URL
 */
App.TRELLO_URL = 'https://api.trello.com/1/client.js';

/**
 * Trello JQuery dependency
 */
App.TRELLO_JQUERY_URL = 'https://code.jquery.com/jquery-1.7.1.min.js';

/**
 * 指定推送器项目的密钥。
 */
App.PUSHER_KEY = '1e756b07a690c5bdb054';

/**
 * 指定推送器项目的密钥。
 */
App.PUSHER_CLUSTER = 'eu';

/**
 * 指定推送器 API 的 URL。
 */
App.PUSHER_URL = 'https://js.pusher.com/4.3/pusher.min.js';

/**
 * Google APIs to load. The realtime API is needed to notify collaborators of conversion
 * of the realtime files, but after Dec 11 it's read-only and hence no longer needed.
 */
App.GOOGLE_APIS = 'drive-share';

/**
 * Function: authorize
 *
 * Authorizes the client, gets the userId and calls <open>.
 */
App.startTime = new Date();

/**
 * 定义用于通过 p URL 参数加载的插 件 ID。更新表
 * https://www.diagrams.net/doc/faq/supported-url-parameters
 */
App.pluginRegistry = {};

App.publicPlugin = [
    'ex',
    'voice',
    'tips',
    'svgdata',
    'number',
    'sql',
    'props',
    'text',
    'anim',
    'update',
    'trees',
//	'import',
    'replay',
    'anon',
    'tickets',
    'flow',
    'webcola',
//	'rnd', 'page', 'gd',
    'tags'
];
App.address_ajax = new Address();
/**
 * 加载所有给定的脚本并在之后调用 onload
 * 所有脚本都已完成加载。
 */
App.loadScripts = function (scripts, onload) {
    var n = scripts.length;

    for (var i = 0; i < n; i++) {
        mxscript(scripts[i], function () {
            if (--n == 0 && onload != null) {
                onload();
            }
        });
    }
};

/**
 * 功能：获取存储模式
 *
 * 返回当前模式。
 */
App.getStoredMode = function () {
    var mode = null;

    if (mode == null && isLocalStorage) {
        mode = localStorage.getItem('.mode');
    }

    if (mode == null && typeof (Storage) != 'undefined') {
        var cookies = document.cookie.split(";");

        for (var i = 0; i < cookies.length; i++) {
            // Removes spaces around cookie
            var cookie = mxUtils.trim(cookies[i]);

            if (cookie.substring(0, 5) == 'MODE=') {
                mode = cookie.substring(5);
                break;
            }
        }

        if (mode != null && isLocalStorage) {
            // Moves to local storage
            var expiry = new Date();
            expiry.setYear(expiry.getFullYear() - 1);
            document.cookie = 'MODE=; expires=' + expiry.toUTCString();
            localStorage.setItem('.mode', mode);
        }
    }

    return mode;
};

/**
 * 在加载时执行的静态应用程序初始化程序。
 */
(function () {

    if (!mxClient.IS_CHROMEAPP) {
        if (urlParams['offline'] != '1') {
            // 切换到 db.draw.io 的保管箱模式
            if (window.location.hostname == 'db.draw.io' && urlParams['mode'] == null) {
                urlParams['mode'] = 'dropbox';
            }

            App.mode = urlParams['mode'];
        }

        if (App.mode == null) {
            // 存储模式覆盖首选模式
            App.mode = App.getStoredMode();
        }

        /**
         * 延迟加载后端。
         */
        if (window.mxscript != null) {
            // 如果未禁用或启用并处于嵌入模式，则为除 IE8 及以下的所有浏览器加载 gapi
            if (urlParams['embed'] != '1') {
                if (typeof window.DriveClient === 'function') {
                    if (urlParams['gapi'] != '0' && isSvgBrowser &&
                        (document.documentMode == null || document.documentMode >= 10)) {
                        // 立即加载客户端
                        if (App.mode == App.MODE_GOOGLE || (urlParams['state'] != null &&
                            window.location.hash == '') || (window.location.hash != null &&
                            window.location.hash.substring(0, 2) == '#G')) {
                            // mxscript('https://apis.google.com/js/api.js');
                        }
                        // 如果在 loadFile 中未公开，则保持延迟加载以回退到经过身份验证的 Google 文件
                        else if (urlParams['chrome'] == '0' && (window.location.hash == null ||
                            window.location.hash.substring(0, 45) !== '#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D')) {
                            // 禁用客户端加载
                            window.DriveClient = null;
                        }
                    } else {
                        // 禁用客户端加载
                        window.DriveClient = null;
                    }
                }

                // Loads dropbox for all browsers but IE8 and below (no CORS) if not disabled or if enabled and in embed mode
                // KNOWN: Picker does not work in IE11 (https://dropbox.zendesk.com/requests/1650781)
                if (typeof window.DropboxClient === 'function') {
                    if (urlParams['db'] != '0' && isSvgBrowser &&
                        (document.documentMode == null || document.documentMode > 9)) {
                        // Immediately loads client
                        if (App.mode == App.MODE_DROPBOX || (window.location.hash != null &&
                            window.location.hash.substring(0, 2) == '#D')) {
                            mxscript(App.DROPBOX_URL, function () {
                                // Must load this after the dropbox SDK since they use the same namespace
                                mxscript(App.DROPINS_URL, null, 'dropboxjs', App.DROPBOX_APPKEY);
                            });
                        } else if (urlParams['chrome'] == '0') {
                            window.DropboxClient = null;
                        }
                    } else {
                        // Disables loading of client
                        window.DropboxClient = null;
                    }
                }

                // Loads OneDrive for all browsers but IE6/IOS if not disabled or if enabled and in embed mode
                if (typeof window.OneDriveClient === 'function') {
                    if (urlParams['od'] != '0' && (navigator.userAgent == null ||
                        navigator.userAgent.indexOf('MSIE') < 0 || document.documentMode >= 10)) {
                        // Immediately loads client
                        if (App.mode == App.MODE_ONEDRIVE || (window.location.hash != null &&
                            window.location.hash.substring(0, 2) == '#W')) {
                            if (urlParams['inlinePicker'] == '1' || mxClient.IS_ANDROID || mxClient.IS_IOS) {
                                mxscript(App.ONEDRIVE_INLINE_PICKER_URL, function () {
                                    window.OneDrive = {}; //Needed to allow code that check its existance to work BUT it's not used
                                });
                            } else {
                                mxscript(App.ONEDRIVE_URL);
                            }
                        } else if (urlParams['chrome'] == '0') {
                            window.OneDriveClient = null;
                        }
                    } else {
                        // Disables loading of client
                        window.OneDriveClient = null;
                    }
                }

                // Loads Trello for all browsers but < IE10 if not disabled or if enabled and in embed mode
                if (typeof window.TrelloClient === 'function') {
                    if (urlParams['tr'] == '1' && isSvgBrowser && !mxClient.IS_IE11 &&
                        (document.documentMode == null || document.documentMode >= 10)) {
                        // Immediately loads client
                        if (App.mode == App.MODE_TRELLO || (window.location.hash != null &&
                            window.location.hash.substring(0, 2) == '#T')) {
                            mxscript(App.TRELLO_JQUERY_URL, function () {
                                mxscript(App.TRELLO_URL);
                            });
                        } else if (urlParams['chrome'] == '0') {
                            window.TrelloClient = null;
                        }
                    } else {
                        // Disables loading of client
                        window.TrelloClient = null;
                    }
                }
            }

            // Loads JSON for older browsers
            if (typeof (JSON) == 'undefined') {
                mxscript('js/json/json2.min.js');
            }
        }
    }
})();

/**
 * 清除 PWA 缓存。
 */
App.clearServiceWorker = function (success) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        if (registrations != null && registrations.length > 0) {
            for (var i = 0; i < registrations.length; i++) {
                registrations[i].unregister();
            }

            if (success != null) {
                success();
            }
        }
    });
};

/**
 * 程序流程从这里开始。
 *
 * 使用应用程序实例调用可选回调。
 */
App.main = function (callback, createUi) {
    // 记录未捕获的错误
    window.onerror = function (message, url, linenumber, colno, err) {
        EditorUi.logError('Global: ' + ((message != null) ? message : ''),
            url, linenumber, colno, err, null, true);
    };

    // 在嵌入模式下删除信息文本
    if (urlParams['embed'] == '1' || urlParams['lightbox'] == '1') {
        var geInfo = document.getElementById('geInfo');

        if (geInfo != null) {
            geInfo.parentNode.removeChild(geInfo);
        }
    }

    // 重定向到最新的 AWS 图标
    if (document.referrer != null && urlParams['libs'] == 'aws3' &&
        document.referrer.substring(0, 42) == 'https://aws.amazon.com/architecture/icons/') {
        urlParams['libs'] = 'aws4';
    }

    if (window.mxscript != null) {
        // 检查脚本内容更改以避免生产中的 CSP 错误
        if (urlParams['dev'] == '1' && CryptoJS != null && urlParams['mode'] != 'trello') {
            var scripts = document.getElementsByTagName('script');

            // 检查引导脚本
            if (scripts != null && scripts.length > 0) {
                var content = mxUtils.getTextContent(scripts[0]);

                if (CryptoJS.MD5(content).toString() != 'f13d3aba97e718436f2562cef8787e06') {
                    // console.log('更改上一行中的引导脚本 MD5:', CryptoJS.MD5(content).toString());
                    // alert('[Dev] Bootstrap 脚本更改需要更新 CSP');
                }
            }

            // 检查主脚本
            if (scripts != null && scripts.length > 1) {
                var content = mxUtils.getTextContent(scripts[scripts.length - 1]);

                if (CryptoJS.MD5(content).toString() != 'd53805dd6f0bbba2da4966491ca0a505') {
                    // console.log('更改上一行的主脚本 MD5:', CryptoJS.MD5(content).toString());
                    // alert('[Dev] 主要脚本更改需要更新 CSP');
                }
            }
        }

        try {
            // 删除 www.draw.io 上的 PWA 缓存以通过重定向强制使用新域
            if (Editor.enableServiceWorker && (urlParams['offline'] == '0' ||
                /www\.draw\.io$/.test(window.location.hostname) ||
                (urlParams['offline'] != '1' && urlParams['dev'] == '1'))) {
                App.clearServiceWorker(function () {
                    if (urlParams['offline'] == '0') {
                        alert('Cache cleared');
                    }
                });
            } else if (Editor.enableServiceWorker) {
                // 如果支持服务工作者，则作为渐进式 Web 应用程序运行
                console.log(" 如果支持服务工作者，则作为渐进式 Web 应用程序运行")
                navigator.serviceWorker.register('/service-worker.js');
            }
        } catch (e) {
            if (window.console != null) {
                console.error(e);
            }
        }

        //加载 Pusher API
        if (('ArrayBuffer' in window) && !mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp &&
            DrawioFile.SYNC == 'auto' && (urlParams['embed'] != '1' || urlParams['embedRT'] == '1') && urlParams['local'] != '1' &&
            (urlParams['chrome'] != '0' || urlParams['rt'] == '1') &&
            urlParams['stealth'] != '1' && urlParams['offline'] != '1') {
            // TODO：检查异步加载是否足够快
            mxscript(App.PUSHER_URL);
        }

        // 加载插件
        if (urlParams['plugins'] != '0' && urlParams['offline'] != '1' && false) {
            console.log("加载插件")
            // mxSettings 在配置模式下尚未初始化，redirect 参数
            // 嵌入模式下插件调用者中的 p URL 参数
            var plugins = (mxSettings.settings != null) ? mxSettings.getPlugins() : null;

            // Configured plugins in embed mode with configure=1 URL should be loaded so we
            // look ahead here and parse the config to fetch the list of custom plugins
            if (mxSettings.settings == null && isLocalStorage && typeof (JSON) !== 'undefined') {
                try {
                    var temp = JSON.parse(localStorage.getItem(mxSettings.key));

                    if (temp != null) {
                        plugins = temp.plugins;
                    }
                } catch (e) {
                    // ignore
                }
            }

            var temp = urlParams['p'];
            App.initPluginCallback();

            if (temp != null) {
                // Mapping from key to URL in App.plugins
                App.loadPlugins(temp.split(';'));
            }

            if (plugins != null && plugins.length > 0 && urlParams['plugins'] != '0') {
                // Loading plugins inside the asynchronous block below stops the page from loading so a
                // hardcoded message for the warning dialog is used since the resources are loadd below
                var warning = 'The page has requested to load the following plugin(s):\n \n {1}\n \n Would you like to load these plugin(s) now?\n \n NOTE : Only allow plugins to run if you fully understand the security implications of doing so.\n';
                var tmp = window.location.protocol + '//' + window.location.host;
                var local = true;

                for (var i = 0; i < plugins.length && local; i++) {
                    if (plugins[i].charAt(0) != '/' && plugins[i].substring(0, tmp.length) != tmp) {
                        local = false;
                    }
                }

                if (local || mxUtils.confirm(mxResources.replacePlaceholders(warning, [plugins.join('\n')]).replace(/\\n/g, '\n'))) {
                    for (var i = 0; i < plugins.length; i++) {
                        try {
                            if (App.pluginsLoaded[plugins[i]] == null) {
                                App.pluginsLoaded[plugins[i]] = true;
                                App.embedModePluginsCount++;

                                if (plugins[i].charAt(0) == '/') {
                                    plugins[i] = PLUGINS_BASE_PATH + plugins[i];
                                }

                                mxscript(plugins[i]);
                            }
                        } catch (e) {
                            // ignore
                        }
                    }
                }
            }
        }

        // 如果未禁用或启用并处于嵌入模式，则为除 IE8 及以下的所有浏览器加载 gapi
        // 特殊情况：无法在下面的异步代码中加载
        if (typeof window.DriveClient === 'function' &&
            (typeof gapi === 'undefined' && (((urlParams['embed'] != '1' && urlParams['gapi'] != '0') ||
                (urlParams['embed'] == '1' && urlParams['gapi'] == '1')) && isSvgBrowser &&
                isLocalStorage && (document.documentMode == null || document.documentMode >= 10)))) {
            // mxscript('https://apis.google.com/js/api.js?onload=DrawGapiClientCallback', null, null, null, mxClient.IS_SVG);
        }
        // 禁用客户端
        else if (typeof window.gapi === 'undefined') {
            window.DriveClient = null;
        }
    }

    /**
     * 异步 MathJax 扩展。
     */
    if (urlParams['math'] != '0') {
        Editor.initMath();
    }

    function doLoad(bundle) {
        // 预取异步请求，以便下面的代码同步运行
        // 通过 mxResources 中的后备系统加载正确的包（一个文件）。样式表
        // 在构建过程中被编译成JS，只在本地开发时需要。
        mxUtils.getAll((urlParams['dev'] != '1') ? [bundle] : [bundle,
            STYLE_PATH + '/default.xml', STYLE_PATH + '/dark-default.xml'], function (xhr) {
            // 将捆绑文本添加到资源
            mxResources.parse(xhr[0].getText());

            // 配置方式
            if (isLocalStorage && localStorage != null && window.location.hash != null &&
                window.location.hash.substring(0, 9) == '#_CONFIG_') {
                try {
                    var trustedPlugins = {};

                    for (var key in App.pluginRegistry) {
                        trustedPlugins[App.pluginRegistry[key]] = true;
                    }

                    // 只允许受信任的插件
                    function checkPlugins(plugins) {
                        if (plugins != null) {
                            for (var i = 0; i < plugins.length; i++) {
                                if (!trustedPlugins[plugins[i]]) {
                                    throw new Error(mxResources.get('invalidInput') + ' "' + plugins[i]) + '"';
                                }
                            }
                        }

                        return true;
                    };

                    var value = JSON.parse(Graph.decompress(window.location.hash.substring(9)));

                    if (value != null && checkPlugins(value.plugins)) {
                        EditorUi.debug('Setting configuration', JSON.stringify(value));

                        if (confirm(mxResources.get('configLinkWarn')) &&
                            confirm(mxResources.get('configLinkConfirm'))) {
                            localStorage.setItem('.configuration', JSON.stringify(value));
                            window.location.hash = '';
                            window.location.reload();
                        }
                    }

                    window.location.hash = '';
                } catch (e) {
                    window.location.hash = '';
                    alert(e);
                }
            }

            // 准备主题从旧的默认样式到旧的 XML 文件的映射
            if (xhr.length > 2) {
                Graph.prototype.defaultThemes['default-style2'] = xhr[1].getDocumentElement();
                Graph.prototype.defaultThemes['darkTheme'] = xhr[2].getDocumentElement();
            }

            // Main
            function realMain() {
                var ui = (createUi != null) ? createUi() : new App(new Editor(
                    urlParams['chrome'] == '0' || uiTheme == 'min',
                    null, null, null, urlParams['chrome'] != '0'));

                if (window.mxscript != null) {
                    // 如果未禁用或启用并处于嵌入模式，则为所有浏览器加载 Dropbox，但 IE8 及以下（无 CORS）
                    // 已知：选择器在 IE11 中不起作用(https://dropbox.zendesk.com/requests/1650781)
                    // if (typeof window.DropboxClient === 'function' &&
                    //     (window.Dropbox == null && window.DrawDropboxClientCallback != null &&
                    //         (((urlParams['embed'] != '1' && urlParams['db'] != '0') ||
                    //             (urlParams['embed'] == '1' && urlParams['db'] == '1')) &&
                    //             isSvgBrowser && (document.documentMode == null || document.documentMode > 9)))) {
                    //     mxscript(App.DROPBOX_URL, function () {
                    //         // 必须在 dropbox SDK 之后加载它，因为它们使用相同的命名空间
                    //         mxscript(App.DROPINS_URL, function () {
                    //             DrawDropboxClientCallback();
                    //         }, 'dropboxjs', App.DROPBOX_APPKEY);
                    //     });
                    // }
                    // 禁用客户端
                    // else if (typeof window.Dropbox === 'undefined' || typeof window.Dropbox.choose === 'undefined') {
                    window.DropboxClient = null;
                    // }

                    //如果未禁用或启用并处于嵌入模式，则为所有浏览器加载 OneDrive，但 IE6/IOS
                    // if (typeof window.OneDriveClient === 'function' &&
                    //     (typeof OneDrive === 'undefined' && window.DrawOneDriveClientCallback != null &&
                    //         (((urlParams['embed'] != '1' && urlParams['od'] != '0') || (urlParams['embed'] == '1' &&
                    //             urlParams['od'] == '1')) && (navigator.userAgent == null ||
                    //             navigator.userAgent.indexOf('MSIE') < 0 || document.documentMode >= 10)))) {
                    //     if (urlParams['inlinePicker'] == '1' || mxClient.IS_ANDROID || mxClient.IS_IOS) {
                    //         mxscript(App.ONEDRIVE_INLINE_PICKER_URL, function () {
                    //             window.OneDrive = {}; //Needed to allow code that check its existance to work BUT it's not used
                    //             window.DrawOneDriveClientCallback();
                    //         });
                    //     } else {
                    //         mxscript(App.ONEDRIVE_URL, window.DrawOneDriveClientCallback);
                    //     }
                    // }
                    // // 禁用客户端
                    // else if (typeof window.OneDrive === 'undefined') {
                    window.OneDriveClient = null;
                    // }

                    // 为所有浏览器加载 Trello，但 < IE10 如果未禁用或启用并处于嵌入模式
                    // if (typeof window.TrelloClient === 'function' && !mxClient.IS_IE11 &&
                    //     typeof window.Trello === 'undefined' && window.DrawTrelloClientCallback != null &&
                    //     urlParams['tr'] == '1' && (navigator.userAgent == null ||
                    //         navigator.userAgent.indexOf('MSIE') < 0 || document.documentMode >= 10)) {
                    //     mxscript(App.TRELLO_JQUERY_URL, function () {
                    //         // Must load this after the dropbox SDK since they use the same namespace
                    //         mxscript(App.TRELLO_URL, function () {
                    //             DrawTrelloClientCallback();
                    //         });
                    //     });
                    // }
                    // // Disables client
                    // else if (typeof window.Trello === 'undefined') {
                    window.TrelloClient = null;
                    // }

                }

                if (callback != null) {
                    callback(ui);
                }

                /**
                 * 仅供开发者使用
                 */
                if (urlParams['chrome'] != '0' && urlParams['test'] == '1') {
                    EditorUi.debug('App.start', [ui, (new Date().getTime() - t0.getTime()) + 'ms']);

                    if (urlParams['export'] != null) {
                        EditorUi.debug('Export:', EXPORT_URL);
                    }
                }
            };

            if (urlParams['dev'] == '1') {
                //走这里
                realMain();
            } else {

                App.loadScripts(['js/shapes.min.js', 'js/stencils.min.js',
                    'js/extensions.min.js'], realMain);
            }
        }, function (xhr) {
            var st = document.getElementById('geStatus');

            if (st != null) {
                st.innerHTML = 'Error loading page. <a>Please try refreshing.</a>';

                // 尝试使用默认资源重新加载以防任何语言资源不可用
                st.getElementsByTagName('a')[0].onclick = function () {
                    mxLanguage = 'en';
                    doLoad(mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) ||
                        mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage));
                };
            }
        });
    };

    function doMain() {
        // autosaveDelay 和 defaultEdgeLength 的可选覆盖
        try {
            if (mxSettings.settings != null) {
                if (mxSettings.settings.autosaveDelay != null) {
                    var val = parseInt(mxSettings.settings.autosaveDelay);

                    if (!isNaN(val) && val > 0) {
                        DrawioFile.prototype.autosaveDelay = val;
                        EditorUi.debug('Setting autosaveDelay', val);
                    } else {
                        EditorUi.debug('Invalid autosaveDelay', val);
                    }
                }

                if (mxSettings.settings.defaultEdgeLength != null) {
                    var val = parseInt(mxSettings.settings.defaultEdgeLength);

                    if (!isNaN(val) && val > 0) {
                        Graph.prototype.defaultEdgeLength = val;
                        EditorUi.debug('使用 defaultEdgeLength', val);
                    } else {
                        EditorUi.debug('无效的默认边长', val);
                    }
                }
            }
        } catch (e) {
            if (window.console != null) {
                console.error(e);
            }
        }

        // 添加所需的资源（禁用回退属性的加载，这只能
        // 如果我们知道所有键都在语言特定文件中定义，则使用）
        mxResources.loadDefaultBundle = false;
        doLoad(mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) ||
            mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage));
    };

    // 如果请求配置并等待配置消息，则发送加载事件
    if (urlParams['configure'] == '1') {
        var op = window.opener || window.parent;

        var configHandler = function (evt) {
            if (evt.source == op) {
                try {
                    var data = JSON.parse(evt.data);

                    if (data != null && data.action == 'configure') {
                        mxEvent.removeListener(window, 'message', configHandler);
                        Editor.configure(data.config, true);
                        mxSettings.load();
                        doMain();
                    }
                } catch (e) {
                    if (window.console != null) {
                        console.log('配置消息错误： ' + e, evt.data);
                    }
                }
            }
        };

        // 从 opener 接收 XML 消息并将其放入图中
        mxEvent.addListener(window, 'message', configHandler);
        op.postMessage(JSON.stringify({event: 'configure'}), '*');
    } else {
        if (Editor.config == null) {
            // 从全局范围或本地存储加载配置
            if (window.DRAWIO_CONFIG != null) {
                try {
                    EditorUi.debug('使用全局配置', window.DRAWIO_CONFIG);
                    Editor.configure(window.DRAWIO_CONFIG);
                    mxSettings.load();
                } catch (e) {
                    if (window.console != null) {
                        console.error(e);
                    }
                }
            }

            // 从本地存储加载配置
            if (isLocalStorage && localStorage != null && urlParams['embed'] != '1') {
                var configData = localStorage.getItem('.configuration');

                if (configData != null) {
                    try {
                        configData = JSON.parse(configData);

                        if (configData != null) {
                            EditorUi.debug('使用本地配置', configData);
                            Editor.configure(configData);
                            mxSettings.load();
                        }
                    } catch (e) {
                        if (window.console != null) {
                            console.error(e);
                        }
                    }
                }
            }
        }

        doMain();
    }
};

//扩展 EditorUi
mxUtils.extend(App, EditorUi);

/**
 * 执行连接到 Google Drive 的第一步。
 */
App.prototype.defaultUserPicture = 'https://lh3.googleusercontent.com/-HIzvXUy6QUY/AAAAAAAAAAI/AAAAAAAAAAA/giuR7PQyjEk/photo.jpg?sz=64';

/**
 *
 */
App.prototype.shareImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowOTgwMTE3NDA3MjA2ODExODhDNkFGMDBEQkQ0RTgwOSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxMjU2NzdEMTcwRDIxMUUxQjc0MDkxRDhCNUQzOEFGRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxMjU2NzdEMDcwRDIxMUUxQjc0MDkxRDhCNUQzOEFGRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowNjgwMTE3NDA3MjA2ODExODcxRkM4MUY1OTFDMjQ5OCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNzgwMTE3NDA3MjA2ODExODhDNkFGMDBEQkQ0RTgwOSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrM/fs0AAADgSURBVHjaYmDAA/7//88MwgzkAKDGFiD+BsQ/QWxSNaf9RwN37twpI8WAS+gGfP78+RpQSoRYA36iG/D379+vQClNdLVMOMz4gi7w79+/n0CKg1gD9qELvH379hzIHGK9oA508ieY8//8+fO5rq4uFCilRKwL1JmYmNhhHEZGRiZ+fn6Q2meEbDYG4u3/cYCfP38uA7kOm0ZOIJ7zn0jw48ePPiDFhmzArv8kgi9fvuwB+w5qwH9ykjswbFSZyM4sEMDPBDTlL5BxkFSd7969OwZ2BZKYGhDzkmjOJ4AAAwBhpRqGnEFb8QAAAABJRU5ErkJggg==';

/**
 *
 */
App.prototype.chevronUpImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/chevron-up.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDg2NEE3NUY1MUVBMTFFM0I3MUVEMTc0N0YyOUI4QzEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDg2NEE3NjA1MUVBMTFFM0I3MUVEMTc0N0YyOUI4QzEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0ODY0QTc1RDUxRUExMUUzQjcxRUQxNzQ3RjI5QjhDMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0ODY0QTc1RTUxRUExMUUzQjcxRUQxNzQ3RjI5QjhDMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pg+qUokAAAAMUExURQAAANnZ2b+/v////5bgre4AAAAEdFJOU////wBAKqn0AAAAL0lEQVR42mJgRgMMRAswMKAKMDDARBjg8lARBoR6KImkH0wTbygT6YaS4DmAAAMAYPkClOEDDD0AAAAASUVORK5CYII=';

/**
 *
 */
App.prototype.chevronDownImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/chevron-down.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDg2NEE3NUI1MUVBMTFFM0I3MUVEMTc0N0YyOUI4QzEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDg2NEE3NUM1MUVBMTFFM0I3MUVEMTc0N0YyOUI4QzEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0ODY0QTc1OTUxRUExMUUzQjcxRUQxNzQ3RjI5QjhDMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0ODY0QTc1QTUxRUExMUUzQjcxRUQxNzQ3RjI5QjhDMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsCtve8AAAAMUExURQAAANnZ2b+/v////5bgre4AAAAEdFJOU////wBAKqn0AAAALUlEQVR42mJgRgMMRAkwQEXBNAOcBSPhclB1cNVwfcxI+vEZykSpoSR6DiDAAF23ApT99bZ+AAAAAElFTkSuQmCC';

/**
 *
 */
App.prototype.formatShowImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/format-show.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODdCREY5REY1NkQ3MTFFNTkyNjNEMTA5NjgwODUyRTgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODdCREY5RTA1NkQ3MTFFNTkyNjNEMTA5NjgwODUyRTgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4N0JERjlERDU2RDcxMUU1OTI2M0QxMDk2ODA4NTJFOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4N0JERjlERTU2RDcxMUU1OTI2M0QxMDk2ODA4NTJFOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PlnMQ/8AAAAJUExURQAAAP///3FxcTfTiAsAAAACdFJOU/8A5bcwSgAAACFJREFUeNpiYEQDDEQJMMABTAAixcQ00ALoDiPRcwABBgB6DADly9Yx8wAAAABJRU5ErkJggg==';

/**
 *
 */
App.prototype.formatHideImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/format-hide.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODdCREY5REI1NkQ3MTFFNTkyNjNEMTA5NjgwODUyRTgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODdCREY5REM1NkQ3MTFFNTkyNjNEMTA5NjgwODUyRTgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4N0JERjlEOTU2RDcxMUU1OTI2M0QxMDk2ODA4NTJFOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4N0JERjlEQTU2RDcxMUU1OTI2M0QxMDk2ODA4NTJFOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqjT9SMAAAAGUExURQAAAP///6XZn90AAAACdFJOU/8A5bcwSgAAAB9JREFUeNpiYEQDDEQJMMABTAAmNdAC6A4j0XMAAQYAcbwA1Xvj1CgAAAAASUVORK5CYII=';

/**
 *
 */
App.prototype.fullscreenImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/fullscreen.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABpJREFUCNdjgAAbGxAy4AEh5gNwBBGByoIBAIueBd12TUjqAAAAAElFTkSuQmCC';

/**
 * 如果自动保存打开，则显示未保存数据对话框的时间间隔。
 * 默认值为 300000（5 分钟）。
 */
App.prototype.warnInterval = 300000;

/**
 *
 */
App.prototype.compactMode = false;

/**
 *
 */
App.prototype.fullscreenMode = false;

/**
 * 根据模式覆盖 UI 设置。
 */
if (urlParams['embed'] != '1') {
    App.prototype.menubarHeight = 64;
} else {
    App.prototype.footerHeight = 0;
}

/**
 * 加载插件队列并等待 UI 实例
 */
App.initPluginCallback = function () {
    if (App.DrawPlugins == null) {
        // 需要立即加载插件但等待 UI 实例的解决方法
        App.DrawPlugins = [];

        // 插件的全局入口点是 Draw.loadPlugin。这是唯一
        // 长期支持的访问 EditorUi 实例的解决方案。
        window.Draw = new Object();
        window.Draw.loadPlugin = function (callback) {
            App.DrawPlugins.push(callback);
        };
    }
};

/**
 *
 */
App.pluginsLoaded = {};
App.embedModePluginsCount = 0;

/**
 * 加载插件队列并等待 UI 实例
 */
App.loadPlugins = function (plugins, useInclude) {
    EditorUi.debug('加载插件', plugins);

    for (var i = 0; i < plugins.length; i++) {
        if (plugins[i] != null && plugins[i].length > 0) {
            try {
                var url = PLUGINS_BASE_PATH + App.pluginRegistry[plugins[i]];

                if (url != null) {
                    if (App.pluginsLoaded[url] == null) {
                        App.pluginsLoaded[url] = true;
                        App.embedModePluginsCount++;

                        if (typeof window.drawDevUrl === 'undefined') {
                            if (useInclude) {
                                mxinclude(url);
                            } else {
                                mxscript(url);
                            }
                        } else {
                            if (useInclude) {
                                mxinclude(url);
                            } else {
                                mxscript(drawDevUrl + url);
                            }
                        }
                    }
                } else if (window.console != null) {
                    console.log('Unknown plugin:', plugins[i]);
                }
            } catch (e) {
                if (window.console != null) {
                    console.log('Error loading plugin:', plugins[i], e);
                }
            }
        }
    }
};

/**
 * 延迟嵌入模式初始化，直到所有插件都加载完毕
 */
App.prototype.initializeEmbedMode = function () {
    if (urlParams['embed'] == '1') {
        if (window.location.hostname == 'app.diagrams.net') {
            this.showBanner('EmbedDeprecationFooter', 'app.diagrams.net will stop working for embed mode. Please use embed.diagrams.net.');
        }

        if (App.embedModePluginsCount > 0 || this.initEmbedDone) {
            return; //等待插件加载，或者这是由于超时导致的重复调用
        } else {
            this.initEmbedDone = true;
        }

        EditorUi.prototype.initializeEmbedMode.apply(this, arguments);
    }
};

/**
 * TODO：定义查看器协议并实现新的查看器样式工具栏
 */
App.prototype.initializeViewerMode = function () {
    var parent = window.opener || window.parent;

    if (parent != null) {
        this.editor.graph.addListener(mxEvent.SIZE, mxUtils.bind(this, function () {
            parent.postMessage(JSON.stringify(this.createLoadMessage('size')), '*');
        }));
    }
};

/**
 * 初始化
 */
App.prototype.init = function () {
    // console.log("app.js:init:1103:初始化 init-1")
    EditorUi.prototype.init.apply(this, arguments);

    /**
     * 指定默认文件名。 //未命名图库
     */
    this.defaultLibraryName = mxResources.get('untitledLibrary');

    /**
     * 保留用于描述更改的侦听器。
     */
    this.descriptorChangedListener = mxUtils.bind(this, this.descriptorChanged);

    /**
     * 创建 github 客户端。
     */
    this.gitHub = null;
    // this.gitHub = (!mxClient.IS_IE || document.documentMode == 10 ||
    //     mxClient.IS_IE11 || mxClient.IS_EDGE) &&
    // (urlParams['gh'] != '0' && (urlParams['embed'] != '1' ||
    //     urlParams['gh'] == '1')) ? new GitHubClient(this) : null;

    if (this.gitHub != null) {
        this.gitHub.addListener('userChanged', mxUtils.bind(this, function () {
            this.updateUserElement();
            this.restoreLibraries();
        }))
    }

    /**
     * 创建 gitlab 客户端。
     */
    this.gitLab = null;
    // this.gitLab = (!mxClient.IS_IE || document.documentMode == 10 ||
    //     mxClient.IS_IE11 || mxClient.IS_EDGE) &&
    // (urlParams['gl'] != '0' && (urlParams['embed'] != '1' ||
    //     urlParams['gl'] == '1')) ? new GitLabClient(this) : null;

    if (this.gitLab != null) {
        this.gitLab.addListener('userChanged', mxUtils.bind(this, function () {
            this.updateUserElement();
            this.restoreLibraries();
        }));
    }

    /**
     * 单个后端的延迟加载
     */
    if (urlParams['embed'] != '1' || urlParams['od'] == '1') {
        /**
         * 如果所有必需的库都可​​用，则创建 onedrive 客户端。
         */
        var initOneDriveClient = mxUtils.bind(this, function () {
            // if (typeof OneDrive !== 'undefined') {
            //     /**
            //      * Holds the x-coordinate of the point.
            //      */
            //     this.oneDrive = new OneDriveClient(this);
            //
            //     this.oneDrive.addListener('userChanged', mxUtils.bind(this, function () {
            //         this.updateUserElement();
            //         this.restoreLibraries();
            //     }));
            //
            //     // Notifies listeners of new client
            //     this.fireEvent(new mxEventObject('clientLoaded', 'client', this.oneDrive));
            // } else if (window.DrawOneDriveClientCallback == null) {
            window.DrawOneDriveClientCallback = initOneDriveClient;
            // }
        });

        initOneDriveClient();
    }

    /**
     * Trello 的延迟加载
     */
    if (urlParams['embed'] != '1' || urlParams['tr'] == '1') {
        /**
         * 如果所有必需的库都可​​用，则创建 Trello 客户端。
         */
        var initTrelloClient = mxUtils.bind(this, function () {
            //     if (typeof window.Trello !== 'undefined') {
            //         console.log("Trello 客户端。")
            //         try {
            //             this.trello = new TrelloClient(this);
            //
            //             //TODO we have no user info from Trello so we don't set a user
            //             this.trello.addListener('userChanged', mxUtils.bind(this, function () {
            //                 this.updateUserElement();
            //                 this.restoreLibraries();
            //             }));
            //
            //             // Notifies listeners of new client
            //             this.fireEvent(new mxEventObject('clientLoaded', 'client', this.trello));
            //         } catch (e) {
            //             if (window.console != null) {
            //                 console.error(e);
            //             }
            //         }
            //     } else if (window.DrawTrelloClientCallback == null) {
            window.DrawTrelloClientCallback = initTrelloClient;
            // }
        });

        initTrelloClient();
    }

    /**
     * 创建具有所有必需库的驱动器客户端可用。
     */
    if (urlParams['embed'] != '1' || urlParams['gapi'] == '1') {
        var initDriveClient = mxUtils.bind(this, function () {
            /**
             * 如果所有必需的库都可​​用，则创建 google drive 客户端。
             */
            // if (typeof gapi !== 'undefined') {
            //     var doInit = mxUtils.bind(this, function () {
            //         this.drive = new DriveClient(this);
            //
            //         this.drive.addListener('userChanged', mxUtils.bind(this, function () {
            //             this.updateUserElement();
            //             this.restoreLibraries();
            //             this.checkLicense();
            //         }))
            //
            //         // Notifies listeners of new client
            //         this.fireEvent(new mxEventObject('clientLoaded', 'client', this.drive));
            //     });
            //
            //     if (window.DrawGapiClientCallback != null) {
            //         gapi.load(((urlParams['picker'] != '0') ? 'picker,' : '') + App.GOOGLE_APIS, doInit);
            //
            //         /**
            //          * Clears any callbacks.
            //          */
            //         window.DrawGapiClientCallback = null;
            //     } else {
            //         doInit();
            //     }
            // } else if (window.DrawGapiClientCallback == null) {
            window.DrawGapiClientCallback = initDriveClient;
            // }
        });

        initDriveClient();
    }

    if (urlParams['embed'] != '1' || urlParams['db'] == '1') {
        /**
         * 如果所有必需的库都可​​用，则创建 Dropbox 客户端。
         */
        var initDropboxClient = mxUtils.bind(this, function () {
            // if (typeof Dropbox === 'function' && typeof Dropbox.choose !== 'undefined') {
            //     /**
            //      * 清除保管箱客户端回调。
            //      */
            //     window.DrawDropboxClientCallback = null;
            //
            //     /**
            //      * 保存点的 x 坐标。
            //      */
            //     try {
            //         this.dropbox = new DropboxClient(this);
            //
            //         this.dropbox.addListener('userChanged', mxUtils.bind(this, function () {
            //             this.updateUserElement();
            //             this.restoreLibraries();
            //         }));
            //
            //         // Notifies listeners of new client
            //         this.fireEvent(new mxEventObject('clientLoaded', 'client', this.dropbox));
            //     } catch (e) {
            //         if (window.console != null) {
            //             console.error(e);
            //         }
            //     }
            // } else if (window.DrawDropboxClientCallback == null) {
            window.DrawDropboxClientCallback = initDropboxClient;
            // }
        });

        initDropboxClient();
    }

    if (urlParams['embed'] != '1') {
        /**
         * 保存背景元素。
         */
        this.bg = this.createBackground();
        document.body.appendChild(this.bg);
        this.diagramContainer.style.visibility = 'hidden';
        this.formatContainer.style.visibility = 'hidden';
        this.hsplit.style.display = 'none';
        this.sidebarContainer.style.display = 'none';
        this.sidebarFooterContainer.style.display = 'none';

        // 设置初始模式 //设备
        if (urlParams['local'] == '1') {
            this.setMode(App.MODE_DEVICE);
        } else {
            this.mode = App.mode;
        }

        // 移动设备的“添加到主屏幕”对话框
        if ('serviceWorker' in navigator && !this.editor.isChromelessView() &&
            (mxClient.IS_ANDROID || mxClient.IS_IOS)) {
            window.addEventListener('beforeinstallprompt', mxUtils.bind(this, function (e) {
                this.showBanner('AddToHomeScreenFooter', mxResources.get('installApp'), function () {
                    e.prompt();
                });
            }));
        }

        if (!mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp && !this.isOffline() &&
            !mxClient.IS_ANDROID && !mxClient.IS_IOS && urlParams['open'] == null &&
            (!this.editor.chromeless || this.editor.editable)) {
            this.editor.addListener('fileLoaded', mxUtils.bind(this, function () {
                var file = this.getCurrentFile();
                var mode = (file != null) ? file.getMode() : null;

                if (mode == App.MODE_DEVICE || mode == App.MODE_BROWSER) {
                    // console.log("显示下载的文件")
                    //桌面版APP
                    // this.showDownloadDesktopBanner();
                } else if (urlParams['embed'] != '1' && this.getServiceName() == 'draw.io') {
                    // 只是 app.diagrams.net 用户
                    //桌面版APP
                    // this.showNameConfBanner();
                }
            }));
        }

        if (!mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp && urlParams['embed'] != '1' && DrawioFile.SYNC == 'auto' &&
            urlParams['local'] != '1' && urlParams['stealth'] != '1' && !this.isOffline() &&
            (!this.editor.chromeless || this.editor.editable)) {
            // 检查缓存是否处于活动状态
            var acceptResponse = true;

            var timeoutThread = window.setTimeout(mxUtils.bind(this, function () {
                acceptResponse = false;

                // 如果无法访问缓存，则切换到手动同步
                DrawioFile.SYNC = 'manual';

                var file = this.getCurrentFile();

                if (file != null && file.sync != null) {
                    file.sync.destroy();
                    file.sync = null;

                    var status = mxUtils.htmlEntities(mxResources.get('timeout'));
                    this.editor.setStatus('<div title="' + status +
                        '" class="geStatusAlert" style="overflow:hidden;">' + status +
                        '</div>');
                }

                EditorUi.logEvent({category: 'TIMEOUT-CACHE-CHECK', action: 'timeout', label: 408});
            }), Editor.cacheTimeout);

            var t0 = new Date().getTime();

            mxUtils.get(EditorUi.cacheUrl + '?alive', mxUtils.bind(this, function (req) {
                window.clearTimeout(timeoutThread);
            }));
        }
    } else if (this.menubar != null) {
        this.menubar.container.style.paddingTop = '0px';
    }

    this.updateHeader();

    if (this.menubar != null) {
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.style.display = 'inline-block';
        this.buttonContainer.style.paddingRight = '48px';
        this.buttonContainer.style.position = 'absolute';
        this.buttonContainer.style.right = '0px';

        this.menubar.container.appendChild(this.buttonContainer);
    }

    if (uiTheme == 'atlas' && this.menubar != null) {
        if (this.toggleElement != null) {
            this.toggleElement.click();
            this.toggleElement.style.display = 'none';
        }

        this.icon = document.createElement('img');
        this.icon.setAttribute('src', IMAGE_PATH + '/rollback.png');
        this.icon.setAttribute('height', '20px');
        this.icon.setAttribute('width', '20px');
        this.icon.setAttribute('title', mxResources.get('返回'));
        this.icon.style.backgroundColor = 'aliceblue';
        this.icon.style.borderRadius = '7px';
        this.icon.style.padding = '6px';
        this.icon.style.cursor = 'pointer';

        mxEvent.addListener(this.icon, 'click', mxUtils.bind(this, function () {
            window.location.replace(MyFile)
        }));

        this.menubar.container.insertBefore(this.icon, this.menubar.container.firstChild);
    }

    if (this.editor.graph.isViewer()) {
        this.initializeViewerMode();
    }
};

/**
 * 安排健全性检查。
 */
App.prototype.scheduleSanityCheck = function () {
    if (!mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp &&
        this.sanityCheckThread == null) {
        this.sanityCheckThread = window.setTimeout(mxUtils.bind(this, function () {
            this.sanityCheckThread = null;
            this.sanityCheck();
        }), this.warnInterval);
    }
};

/**
 * 停止健全性检查。
 */
App.prototype.stopSanityCheck = function () {
    if (this.sanityCheckThread != null) {
        window.clearTimeout(this.sanityCheckThread);
        this.sanityCheckThread = null;
    }
};

/**
 * 一段时间后显示未保存更改和自动保存的警告。
 */
App.prototype.sanityCheck = function () {
    var file = this.getCurrentFile();

    if (file != null && file.isModified() && file.isAutosave() && file.isOverdue()) {
        var evt = {
            category: 'WARN-FILE-' + file.getHash(),
            action: ((file.savingFile) ? 'saving' : '') +
                ((file.savingFile && file.savingFileTime != null) ? '_' +
                    Math.round((Date.now() - file.savingFileTime.getTime()) / 1000) : '') +
                ((file.saveLevel != null) ? ('-sl_' + file.saveLevel) : '') +
                '-age_' + ((file.ageStart != null) ? Math.round((Date.now() - file.ageStart.getTime()) / 1000) : 'x') +
                ((this.editor.autosave) ? '' : '-nosave') +
                ((file.isAutosave()) ? '' : '-noauto') +
                '-open_' + ((file.opened != null) ? Math.round((Date.now() - file.opened.getTime()) / 1000) : 'x') +
                '-save_' + ((file.lastSaved != null) ? Math.round((Date.now() - file.lastSaved.getTime()) / 1000) : 'x') +
                '-change_' + ((file.lastChanged != null) ? Math.round((Date.now() - file.lastChanged.getTime()) / 1000) : 'x') +
                '-alive_' + Math.round((Date.now() - App.startTime.getTime()) / 1000),
            label: (file.sync != null) ? ('client_' + file.sync.clientId) : 'nosync'
        };

        if (file.constructor == DriveFile && file.desc != null && this.drive != null) {
            evt.label += ((this.drive.user != null) ? ('-user_' + this.drive.user.id) : '-nouser') + '-rev_' +
                file.desc.headRevisionId + '-mod_' + file.desc.modifiedDate + '-size_' + file.getSize() +
                '-mime_' + file.desc.mimeType;
        }

        EditorUi.logEvent(evt);

        var msg = mxResources.get('ensureDataSaved');

        if (file.lastSaved != null) {
            var str = this.timeSince(file.lastSaved);

            if (str == null) {
                str = mxResources.get('lessThanAMinute');
            }

            msg = mxResources.get('lastSaved', [str]);
        }

        //重置可能的陈旧状态
        this.spinner.stop();

        this.showError(mxResources.get('unsavedChanges'), msg, mxResources.get('ignore'),
            mxUtils.bind(this, function () {
                this.hideDialog();
            }), null, mxResources.get('save'), mxUtils.bind(this, function () {
                this.stopSanityCheck();
                this.actions.get((this.mode == null || !file.isEditable()) ?
                    'saveAs' : 'save').funct();
            }), null, null, 360, 120, null, mxUtils.bind(this, function () {
                this.scheduleSanityCheck();
            }));
    }
};

/**
 * 如果当前域用于新的驱动器应用程序，则返回 true。
 */
App.prototype.isDriveDomain = function () {
    // console.log(urlParams['drive'] != '0',"window.location.hostname",window.location.hostname)
    return urlParams['drive'] != '0' &&
        (window.location.hostname == 'test.draw.io' ||
            window.location.hostname == 'www.draw.io' ||
            window.location.hostname == 'drive.draw.io' ||
            window.location.hostname == 'app.diagrams.net' ||
            window.location.hostname == 'jgraph.github.io');
};

/**
 * 返回用于通知的推送器实例。创建不存在的实例。
 */
App.prototype.getPusher = function () {
    if (this.pusher == null && typeof window.Pusher === 'function') {
        this.pusher = new Pusher(App.PUSHER_KEY,
            {
                cluster: App.PUSHER_CLUSTER,
                encrypted: true
            });
    }

    return this.pusher;
};

/**
 * 每个会话显示一个用于下载桌面版本的页脚。
 */
App.prototype.showNameChangeBanner = function () {
    this.showBanner('DiagramsFooter', 'draw.io is now diagrams.net', mxUtils.bind(this, function () {
        this.openLink('https://www.diagrams.net/blog/move-diagrams-net');
    }));
};

/**
 * 每个会话显示一个用于下载桌面版本的页脚。
 */
App.prototype.showNameConfBanner = function () {
    this.showBanner('ConfFooter', 'Try draw.io for Confluence', mxUtils.bind(this, function () {
        this.openLink('https://marketplace.atlassian.com/apps/1210933/draw-io-diagrams-for-confluence');
    }), true);
};

/**
 * 每个会话显示一个用于下载桌面版本的页脚。
 */
App.prototype.showDownloadDesktopBanner = function () {
    var link = 'https://get.diagrams.net/';

    if (this.showBanner('DesktopFooter', mxResources.get('downloadDesktop'), mxUtils.bind(this, function () {
        this.openLink(link);
    }))) {
        // Downloads installer for macOS and Windows
        mxUtils.get('https://api.github.com/repos/jgraph/drawio-desktop/releases/latest', mxUtils.bind(this, function (req) {
            try {
                var rel = JSON.parse(req.getText());

                if (rel != null) {
                    if (rel.tag_name != null && rel.name != null && rel.html_url != null) {
                        if (mxClient.IS_MAC) {
                            link = 'https://github.com/jgraph/drawio-desktop/releases/download/' +
                                rel.tag_name + '/draw.io-' + rel.name + '.dmg';
                        } else if (mxClient.IS_WIN) {
                            link = 'https://github.com/jgraph/drawio-desktop/releases/download/' +
                                rel.tag_name + '/draw.io-' + rel.name + '-windows-installer.exe';
                        }
                    }
                }
            } catch (e) {
                // ignore
            }
        }));
    }
};

/**
 * 每个会话显示一个用于下载桌面版本的页脚。
 */
App.prototype.showRatingBanner = function () {
    if (!this.bannerShowing && !this['hideBanner' + 'ratingFooter'] &&
        (!isLocalStorage || mxSettings.settings == null ||
            mxSettings.settings['close' + 'ratingFooter'] == null)) {
        var banner = document.createElement('div');
        banner.style.cssText = 'position:absolute;bottom:10px;left:50%;max-width:90%;padding:18px 34px 12px 20px;' +
            'font-size:16px;font-weight:bold;white-space:nowrap;cursor:pointer;z-index:' + mxPopupMenu.prototype.zIndex + ';';
        mxUtils.setPrefixedStyle(banner.style, 'box-shadow', '1px 1px 2px 0px #ddd');
        mxUtils.setPrefixedStyle(banner.style, 'transform', 'translate(-50%,120%)');
        mxUtils.setPrefixedStyle(banner.style, 'transition', 'all 1s ease');
        banner.className = 'geBtn gePrimaryBtn';

        var img = document.createElement('img');
        img.setAttribute('src', Dialog.prototype.closeImage);
        img.setAttribute('title', mxResources.get('close'));
        img.setAttribute('border', '0');
        img.style.cssText = 'position:absolute;right:10px;top:12px;filter:invert(1);padding:6px;margin:-6px;cursor:default;';
        banner.appendChild(img);

        var star = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZ' +
            'XdvcmtzIENTM5jWRgMAAAQRdEVYdFhNTDpjb20uYWRvYmUueG1wADw/eHBhY2tldCBiZWdpbj0iICAgIiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8i' +
            'IHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDQuMS1jMDM0IDQ2LjI3Mjk3NiwgU2F0IEphbiAyNyAyMDA3IDIyOjExOjQxICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDI' +
            'vMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4YXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eGFwOkNyZW' +
            'F0b3JUb29sPkFkb2JlIEZpcmV3b3JrcyBDUzM8L3hhcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhhcDpDcmVhdGVEYXRlPjIwMDgtMDItMTdUMDI6MzY6NDVaPC94YXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhhcDpNb2RpZ' +
            'nlEYXRlPjIwMDktMDMtMTdUMTQ6MTI6MDJaPC94YXA6TW9kaWZ5RGF0ZT4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmRjPSJo' +
            'dHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo' +
            'gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIC' +
            'AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI' +
            'CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIIImu8AAAAAVdEVYdENyZWF0aW9uIFRpbWUAMi8xNy8wOCCcqlgAAAHuSURBVDiNlZJBi1JRGIbfk+fc0ZuMXorJe4XujWoMdREaA23HICj6AQeLINr0C4I27ab2' +
            '7VqOI9+q/sH8gMDceG1RkIwgClEXFMbRc5zTZgZURmG+5fu9PN/7Hg6wZohoh4h21nn4uqXW+q0xZgzg+SrPlTXX73uet+26bp6ICpcGaK1fua57M5vN3tZav7gUgIiSqVTqcRAEm0EQbCaTyQoRXb3Iy4hoG8CT6XSaY4xtMMa' +
            'SQohMPp8v+r7vAEC3243CMGwqpfoApsaYE8uyfgM45ABOjDEvXdfNlMvlzFINAIDneY7neZVzvdlsDgaDQYtzfsjOIjtKqU+e5+0Wi0V3VV8ACMOw3+/3v3HOX0sp/7K53te11h/S6fRuoVAIhBAL76OUOm2320dRFH0VQuxJKf' +
            '8BAFu+UKvVvpRKpWe2bYt5fTweq0ajQUKIN1LK43N94SMR0Y1YLLYlhBBKqQUw51wkEol7WmuzoC8FuJtIJLaUUoii6Ljb7f4yxpz6vp9zHMe2bfvacDi8BeDHKkBuNps5rVbr52QyaVuW9ZExttHpdN73ej0/Ho+nADxYCdBaV' +
            '0aj0RGAz5ZlHUgpx2erR/V6/d1wOHwK4CGA/QsBnPN9AN+llH+WkqFare4R0QGAO/M6M8Ysey81/wGqa8MlVvHPNAAAAABJRU5ErkJggg==';

        mxUtils.write(banner, 'Please rate us');
        document.body.appendChild(banner);

        var star1 = document.createElement('img');
        star1.setAttribute('border', '0');
        star1.setAttribute('align', 'absmiddle');
        star1.setAttribute('title', '1 star');
        star1.setAttribute('style', 'margin-top:-6px;cursor:pointer;margin-left:8px;');
        star1.setAttribute('src', star);
        banner.appendChild(star1);

        var star2 = document.createElement('img');
        star2.setAttribute('border', '0');
        star2.setAttribute('align', 'absmiddle');
        star2.setAttribute('title', '2 star');
        star2.setAttribute('style', 'margin-top:-6px;margin-left:3px;cursor:pointer;');
        star2.setAttribute('src', star);
        banner.appendChild(star2);

        var star3 = document.createElement('img');
        star3.setAttribute('border', '0');
        star3.setAttribute('align', 'absmiddle');
        star3.setAttribute('title', '3 star');
        star3.setAttribute('style', 'margin-top:-6px;margin-left:3px;cursor:pointer;');
        star3.setAttribute('src', star);
        banner.appendChild(star3);

        var star4 = document.createElement('img');
        star4.setAttribute('border', '0');
        star4.setAttribute('align', 'absmiddle');
        star4.setAttribute('title', '4 star');
        star4.setAttribute('style', 'margin-top:-6px;margin-left:3px;cursor:pointer;');
        star4.setAttribute('src', star);
        banner.appendChild(star4);

        this.bannerShowing = true;

        var onclose = mxUtils.bind(this, function () {
            if (banner.parentNode != null) {
                banner.parentNode.removeChild(banner);
                this.bannerShowing = false;

                this['hideBanner' + 'ratingFooter'] = true;

                if (isLocalStorage && mxSettings.settings != null) {
                    mxSettings.settings['close' + 'ratingFooter'] = Date.now();
                    mxSettings.save();
                }
            }
        });

        mxEvent.addListener(img, 'click', mxUtils.bind(this, function (e) {
            mxEvent.consume(e);
            onclose();
        }));
        mxEvent.addListener(star1, 'click', mxUtils.bind(this, function (e) {
            mxEvent.consume(e);
            onclose();
        }));
        mxEvent.addListener(star2, 'click', mxUtils.bind(this, function (e) {
            mxEvent.consume(e);
            onclose();
        }));
        mxEvent.addListener(star3, 'click', mxUtils.bind(this, function (e) {
            mxEvent.consume(e);
            onclose();
        }));
        mxEvent.addListener(star4, 'click', mxUtils.bind(this, function (e) {
            mxEvent.consume(e);
            window.open('https://marketplace.atlassian.com/apps/1210933/draw-io-diagrams-for-confluence?hosting=datacenter&tab=reviews');
            onclose();
        }));

        var hide = mxUtils.bind(this, function () {
            mxUtils.setPrefixedStyle(banner.style, 'transform', 'translate(-50%,120%)');

            window.setTimeout(mxUtils.bind(this, function () {
                onclose();
            }), 1000);
        });

        window.setTimeout(mxUtils.bind(this, function () {
            mxUtils.setPrefixedStyle(banner.style, 'transform', 'translate(-50%,0%)');
        }), 500);

        window.setTimeout(hide, 60000);
    }
};

/**
 *
 */
App.prototype.checkLicense = function () {
    var driveUser = this.drive.getUser();
    var email = ((urlParams['dev'] == '1') ? urlParams['lic'] : null) ||
        ((driveUser != null) ? driveUser.email : null);

    if (!this.isOffline() && !this.editor.chromeless && email != null) {
        // Anonymises the local part of the email address
        var at = email.lastIndexOf('@');
        var domain = email;

        if (at >= 0) {
            domain = email.substring(at + 1);
            email = Editor.crc32(email.substring(0, at)) + '@' + domain;
        }

        // Timestamp is workaround for cached response in certain environments
        mxUtils.post('/license', 'domain=' + encodeURIComponent(domain) + '&email=' + encodeURIComponent(email) +
            '&lc=' + encodeURIComponent(driveUser.locale) + '&ts=' + new Date().getTime(),
            mxUtils.bind(this, function (req) {
                try {
                    if (req.getStatus() >= 200 && req.getStatus() <= 299) {
                        var value = req.getText();

                        if (value.length > 0) {
                            var lic = JSON.parse(value);

                            if (lic != null) {
                                this.handleLicense(lic, domain);
                            }
                        }
                    }
                } catch (e) {
                    // ignore
                }
            }));
    }
};

/**
 * 如果当前域用于新的驱动器应用程序，则返回 true。
 */
App.prototype.handleLicense = function (lic, domain) {
    if (lic != null && lic.plugins != null) {
        App.loadPlugins(lic.plugins.split(';'), true);
    }
};

/**
 *
 */
App.prototype.getEditBlankXml = function () {
    var file = this.getCurrentFile();

    if (file != null && this.editor.isChromelessView() && this.editor.graph.isLightboxView()) {
        return file.getData();
    } else {
        return this.getFileData(true);
    }
};

/**
 * 根据选择更新操作状态。
 */
App.prototype.updateActionStates = function () {
    EditorUi.prototype.updateActionStates.apply(this, arguments);

    this.actions.get('revisionHistory').setEnabled(this.isRevisionHistoryEnabled());
};

/**
 * 将指定条目添加到本地存储中的最近文件列表
 */
App.prototype.addRecent = function (entry) {
    if (isLocalStorage && localStorage != null) {
        var recent = this.getRecent();

        if (recent == null) {
            recent = [];
        } else {
            for (var i = 0; i < recent.length; i++) {
                if (recent[i].id == entry.id) {
                    recent.splice(i, 1);
                }
            }
        }

        if (recent != null) {
            console.log("app.js:1789,--添加到本地存储中的最近文件列表--", JSON.stringify(recent))
            recent.unshift(entry);
            recent = recent.slice(0, 10);
            localStorage.setItem('.recent', JSON.stringify(recent));
        }
    }
};

/**
 * 从本地存储返回最近的文件列表
 */
App.prototype.getRecent = function () {
    if (isLocalStorage && localStorage != null) {
        try {
            var recent = localStorage.getItem('.recent');

            if (recent != null) {
                return JSON.parse(recent);
            }
        } catch (e) {
            // ignore
        }

        return null;
    }
};

/**
 * 清除本地存储中最近的文件列表
 */
App.prototype.resetRecent = function (entry) {
    if (isLocalStorage && localStorage != null) {
        try {
            localStorage.removeItem('.recent');
        } catch (e) {
            // ignore
        }
    }
};

/**
 * 设置应用程序的 卸载前打开
 */
App.prototype.onBeforeUnload = function () {
    // if (urlParams['embed'] == '1' && this.editor.modified) {
    //     return mxResources.get('allChangesLost');
    // } else {
    //     var file = this.getCurrentFile();
    //
    //     if (file != null) {
    //         // 已知：大多数浏览器忽略消息
    //         if (file.constructor == LocalFile && file.getHash() == '' && !file.isModified() &&
    //             urlParams['nowarn'] != '1' && !this.isDiagramEmpty() && urlParams['url'] == null &&
    //             !this.editor.isChromelessView() && file.fileHandle == null) {
    //             return mxResources.get('ensureDataSaved');
    //         } else if (file.isModified()) {
    //             return mxResources.get('allChangesLost');
    //         } else {
    //             file.close(true);
    //         }
    //     }
    // }
};

/**
 * 修改文档title
 */
App.prototype.updateDocumentTitle = function () {
    if (!this.editor.graph.isLightboxView()) {
        var title = this.editor.appName;
        var file = this.getCurrentFile();

        //是离线应用程序
        // if (this.isOfflineApp()) {
        //     title += ' app';
        // }

        if (file != null) {
            var filename = (file.getTitle() != null) ? file.getTitle() : this.defaultFilename;
            title = filename + ' - ' + title;
        }

        if (document.title != title) {
            document.title = title;
            var graph = this.editor.graph;
            graph.invalidateDescendantsWithPlaceholders(graph.model.getRoot());
            graph.view.validate();
        }
    }
};

/**
 * 返回当前文件的缩略图。
 */
App.prototype.getThumbnail = function (width, fn) {
    var result = false;

    try {
        var acceptResponse = true;

        var timeoutThread = window.setTimeout(mxUtils.bind(this, function () {
            acceptResponse = false;
            fn(null);
        }), this.timeout);

        var success = mxUtils.bind(this, function (canvas) {
            window.clearTimeout(timeoutThread);

            if (acceptResponse) {
                fn(canvas);
            }
        });

        if (this.thumbImageCache == null) {
            this.thumbImageCache = new Object();
        }

        var graph = this.editor.graph;

        // 通过创建图表导出第一页的 PNG，而其他页面可见
        // LATER：在不在第一页时为图形或 SVG 添加缓存
        // 为避免在保存深色主题期间刷新，请使用单独的图形实例
        var darkTheme = graph.themes != null && graph.defaultThemeName == 'darkTheme';

        if (darkTheme || (this.pages != null && this.currentPage != this.pages[0])) {
            var graphGetGlobalVariable = graph.getGlobalVariable;
            graph = this.createTemporaryGraph((darkTheme) ? graph.getDefaultStylesheet() : graph.getStylesheet());
            var page = this.pages[0];

            // 避免在黑暗模式下覆盖 getSvg 中的样式表
            if (darkTheme) {
                graph.defaultThemeName = 'default';
            }

            graph.getGlobalVariable = function (name) {
                if (name == 'page') {
                    return page.getName();
                } else if (name == 'pagenumber') {
                    return 1;
                }

                return graphGetGlobalVariable.apply(this, arguments);
            };

            graph.getGlobalVariable = graphGetGlobalVariable;
            document.body.appendChild(graph.container);
            graph.model.setRoot(page.root);
        }

        // 使用客户端画布导出
        if (mxClient.IS_CHROMEAPP || this.useCanvasForExport) {
            this.editor.exportToCanvas(mxUtils.bind(this, function (canvas) {
                try {
                    // 从 DOM 中删除临时图
                    if (graph != this.editor.graph && graph.container.parentNode != null) {
                        graph.container.parentNode.removeChild(graph.container);
                    }
                } catch (e) {
                    canvas = null;
                }

                success(canvas);
            }), width, this.thumbImageCache, '#ffffff', function () {
                // 在错误情况下以 null 继续
                success();
            }, null, null, null, null, null, null, graph);

            result = true;
        } else if (this.canvasSupported && this.getCurrentFile() != null) {
            var canvas = document.createElement('canvas');
            var bounds = graph.getGraphBounds();
            var scale = width / bounds.width;

            // 将比例限制为 1 或 2 * 宽度/高度
            scale = Math.min(1, Math.min((width * 3) / (bounds.height * 4), scale));

            var x0 = Math.floor(bounds.x);
            var y0 = Math.floor(bounds.y);

            canvas.setAttribute('width', Math.ceil(scale * (bounds.width + 4)));
            canvas.setAttribute('height', Math.ceil(scale * (bounds.height + 4)));

            var ctx = canvas.getContext('2d');

            // 配置画布
            ctx.scale(scale, scale);
            ctx.translate(-x0, -y0);

            // 绘制白色背景而不是透明
            var bg = graph.background;

            if (bg == null || bg == '' || bg == mxConstants.NONE) {
                bg = '#ffffff';
            }

            //油漆背景
            ctx.save();
            ctx.fillStyle = bg;
            ctx.fillRect(x0, y0, Math.ceil(bounds.width + 4), Math.ceil(bounds.height + 4));
            ctx.restore();

            var htmlCanvas = new mxJsCanvas(canvas);

            // 注意：传入异步画布的 htmlCanvas 仅用于图像
            // 和画布缓存（在这种情况下没有像我们一样使用画布缓存
            // 不渲染文本）。要通过 thumbImageCache 重用该缓存，我们
            // 将其传递到异步画布并覆盖图像缓存
            // 新创建的带有thumbImageCache 的html 画布。
            // LATER：如果文件更改，是否需要清除拇指图像缓存？
            var asynCanvas = new mxAsyncCanvas(this.thumbImageCache);
            htmlCanvas.images = this.thumbImageCache.images;

            // 渲染图
            var imgExport = new mxImageExport();

            imgExport.drawShape = function (state, canvas) {
                if (state.shape instanceof mxShape && state.shape.checkBounds()) {
                    canvas.save();
                    canvas.translate(0.5, 0.5);
                    state.shape.paint(canvas);
                    canvas.translate(-0.5, -0.5);
                    canvas.restore();
                }
            };

            imgExport.drawText = function (state, canvas) {
                // 缩略图没有文本输出
            };

            imgExport.drawState(graph.getView().getState(graph.model.root), asynCanvas);

            asynCanvas.finish(mxUtils.bind(this, function () {
                try {
                    imgExport.drawState(graph.getView().getState(graph.model.root), htmlCanvas);

                    // 从 DOM 中删除临时图
                    if (graph != this.editor.graph && graph.container.parentNode != null) {
                        graph.container.parentNode.removeChild(graph.container);
                    }
                } catch (e) {
                    canvas = null;
                }

                success(canvas);
            }));

            result = true;
        }
    } catch (e) {
        result = false;

        // 从 DOM 中删除临时图
        if (graph != null && graph != this.editor.graph && graph.container.parentNode != null) {
            graph.container.parentNode.removeChild(graph.container);
        }
    }

    return result;
};

/**
 * 创建背景
 *
 */
App.prototype.createBackground = function () {
    var bg = this.createDiv('background');
    bg.style.position = 'absolute';
    bg.style.background = 'white';
    bg.style.left = '0px';
    bg.style.top = '0px';
    bg.style.bottom = '0px';
    bg.style.right = '0px';

    mxUtils.setOpacity(bg, 100);

    return bg;
};


(function () {
    var editorUiSetMode = EditorUi.prototype.setMode;

    App.prototype.setMode = function (mode, remember) {
        editorUiSetMode.apply(this, arguments);

        // 注意：使用本地存储 影响文件对话框
        // 如果模式未定义，则不应修改
        if (this.mode != null) {
            Editor.useLocalStorage = this.mode == App.MODE_BROWSER;
        }

        if (this.appIcon != null) {
            var file = this.getCurrentFile();
            mode = (file != null) ? file.getMode() : mode;

            if (mode == App.MODE_GOOGLE) {
                this.appIcon.setAttribute('title', mxResources.get('openIt', [mxResources.get('googleDrive')]));
                this.appIcon.style.cursor = 'pointer';
            } else if (mode == App.MODE_DROPBOX) {
                this.appIcon.setAttribute('title', mxResources.get('openIt', [mxResources.get('dropbox')]));
                this.appIcon.style.cursor = 'pointer';
            } else if (mode == App.MODE_ONEDRIVE) {
                this.appIcon.setAttribute('title', mxResources.get('openIt', [mxResources.get('oneDrive')]));
                this.appIcon.style.cursor = 'pointer';
            } else {
                this.appIcon.removeAttribute('title');
                this.appIcon.style.cursor = (mode == App.MODE_DEVICE) ? 'pointer' : 'default';
            }
        }

        if (remember) {
            try {
                if (isLocalStorage) {
                    localStorage.setItem('.mode', mode);
                } else if (typeof (Storage) != 'undefined') {
                    var expiry = new Date();
                    expiry.setYear(expiry.getFullYear() + 1);
                    document.cookie = 'MODE=' + mode + '; expires=' + expiry.toUTCString();
                }
            } catch (e) {
                // ignore possible access denied
            }
        }
    };
})();

/**
 * Function: authorize
 *
 * 授权客户端，获取用户 ID 并调用 <open>。
 */
App.prototype.appIconClicked = function (evt) {
    if (mxEvent.isAltDown(evt)) {
        this.showSplash(true);
    } else {
        var file = this.getCurrentFile();
        var mode = (file != null) ? file.getMode() : null;

        if (mode == App.MODE_GOOGLE) {
            if (file != null && file.desc != null && file.desc.parents != null &&
                file.desc.parents.length > 0 && !mxEvent.isShiftDown(evt)) {
                // Opens containing folder
                this.openLink('https://drive.google.com/drive/folders/' + file.desc.parents[0].id);
            } else if (file != null && file.getId() != null) {
                this.openLink('https://drive.google.com/open?id=' + file.getId());
            } else {
                this.openLink('https://drive.google.com/?authuser=0');
            }
        } else if (mode == App.MODE_ONEDRIVE) {
            if (file != null && file.meta != null && file.meta.webUrl != null) {
                var url = file.meta.webUrl;
                var name = encodeURIComponent(file.meta.name);

                if (url.substring(url.length - name.length, url.length) == name) {
                    url = url.substring(0, url.length - name.length);
                }

                this.openLink(url);
            } else {
                this.openLink('https://onedrive.live.com/');
            }
        } else if (mode == App.MODE_DROPBOX) {
            if (file != null && file.stat != null && file.stat.path_display != null) {
                var url = 'https://www.dropbox.com/home/Apps/drawio' + file.stat.path_display;

                if (!mxEvent.isShiftDown(evt)) {
                    url = url.substring(0, url.length - file.stat.name.length);
                }

                this.openLink(url);
            } else {
                this.openLink('https://www.dropbox.com/');
            }
        } else if (mode == App.MODE_TRELLO) {
            this.openLink('https://trello.com/');
        } else if (mode == App.MODE_GITHUB) {
            if (file != null && file.constructor == GitHubFile) {
                this.openLink(file.meta.html_url);
            } else {
                this.openLink('https://github.com/');
            }
        } else if (mode == App.MODE_GITLAB) {
            if (file != null && file.constructor == GitLabFile) {
                this.openLink(file.meta.html_url);
            } else {
                this.openLink(DRAWIO_GITLAB_URL);
            }
        } else if (mode == App.MODE_DEVICE) {
            this.openLink('https://get.draw.io/');
        }
    }

    mxEvent.consume(evt);
};

/**
 * 功能：授权
 *
 * 授权客户端，获取userId并调用<open>。
 */
App.prototype.clearMode = function () {
    if (isLocalStorage) {
        localStorage.removeItem('.mode');
    } else if (typeof (Storage) != 'undefined') {
        var expiry = new Date();
        expiry.setYear(expiry.getFullYear() - 1);
        document.cookie = 'MODE=; expires=' + expiry.toUTCString();
    }
};

/**
 * 获取图表标识
 */
App.prototype.getDiagramId = function () {
    var id = window.location.hash;

    // 去除哈希符号
    if (id != null && id.length > 0) {
        id = id.substring(1);
    }

    // Trello 客户端在哈希后附加数据的解决方法
    if (id != null && id.length > 1 && id.charAt(0) == 'T') {
        var idx = id.indexOf('#');

        if (idx > 0) {
            id = id.substring(0, idx);
        }
    }

    return id;
};

/**
 * 打开 URL 参数中指定的任何文件。
 */
App.prototype.open = function () {
    // FF 中不允许跨域窗口访问，所以如果我们
    // 从另一个域打开，那么这将失败。
    try {
        // 如果在嵌入模式下使用 create URL 参数，则
        // 我们尝试从 window.opener[value] 打开 XML。
        // 用于通过选项卡嵌入以绕过计时
        // 在没有 onload 事件的情况下传递消息时出现问题。
        if (window.opener != null) {
            var value = urlParams['create'];

            if (value != null) {
                value = decodeURIComponent(value);
            }


            if (value != null && value.length > 0 && value.substring(0, 7) != 'http://' &&
                value.substring(0, 8) != 'https://') {

                var doc = mxUtils.parseXml(window.opener[value]);
                this.editor.setGraphXml(doc.documentElement);
            } else if (window.opener.openFile != null) {
                //打开文件
                window.opener.openFile.setConsumer(mxUtils.bind(this, function (xml, filename, temp) {
                    this.spinner.stop();

                    if (filename == null) {
                        var title = urlParams['title'];
                        temp = true;

                        if (title != null) {
                            filename = decodeURIComponent(title);
                        } else {
                            filename = this.defaultFilename;
                        }
                    }

                    // 用 XML 扩展名替换 PNG
                    var dot = (!this.useCanvasForExport) ? filename.substring(filename.length - 4) == '.png' : -1;

                    if (dot > 0) {
                        filename = filename.substring(0, filename.length - 4) + '.drawio';
                    }

                    this.fileLoaded((mxClient.IS_IOS) ?
                        new StorageFile(this, xml, filename) :
                        new LocalFile(this, xml, filename, temp));
                }));
            }
        }
    } catch (e) {
        // ignore
    }
};

/**
 * 加载
 * @param then
 */
App.prototype.loadGapi = function (then) {
    if (typeof gapi !== 'undefined') {
        gapi.load(((urlParams['picker'] != '0') ? 'picker,' : '') + App.GOOGLE_APIS, then);
    }
};

/**
 * 主功能。程序从这里开始。
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.load = function () {
    // console.log("App.prototype.load--主功能，程序从这里开始。 init-3")
    // 检查我们是否在嵌入式模式下运行
    if (urlParams['embed'] != '1') {
        //this
        if (this.spinner.spin(document.body, mxResources.get('starting'))) {
            try {
                this.stateArg = (urlParams['state'] != null && this.drive != null) ? JSON.parse(decodeURIComponent(urlParams['state'])) : null;
            } catch (e) {
                // ignores invalid state args
            }

            this.editor.graph.setEnabled(this.getCurrentFile() != null);

            // 将 userId 从 state 参数传递给客户端
            if ((window.location.hash == null || window.location.hash.length == 0) &&
                this.drive != null && this.stateArg != null && this.stateArg.userId != null) {
                this.drive.setUserId(this.stateArg.userId);
            }

            // 对移至哈希标签的 fileId 参数的旧支持
            if (urlParams['fileId'] != null) {
                window.location.hash = 'G' + urlParams['fileId'];
                window.location.search = this.getSearch(['fileId']);
            } else {
                // 客户端的异步或禁用加载
                if (this.drive == null) {
                    if (this.mode == App.MODE_GOOGLE) {
                        this.mode = null;
                    }

                    this.start();
                } else {
                    this.loadGapi(mxUtils.bind(this, function () {
                        this.start();
                    }));
                }
            }
        }
    } else {

        this.restoreLibraries();

        if (urlParams['gapi'] == '1') {
            this.loadGapi(function () {
            });
        }
    }
};

/**
 * 添加用于自动保存本地更改图表的侦听器。
 */
App.prototype.showRefreshDialog = function (title, message) {
    if (!this.showingRefreshDialog) {
        this.showingRefreshDialog = true;

        this.showError(title || mxResources.get('externalChanges'),
            message || mxResources.get('redirectToNewApp'),
            mxResources.get('refresh'), mxUtils.bind(this, function () {
                var file = this.getCurrentFile();

                if (file != null) {
                    file.setModified(false);
                }

                this.spinner.spin(document.body, mxResources.get('connecting'));
                this.editor.graph.setEnabled(false);
                window.location.reload();
            }), null, null, null, null, null, 340, 180);

        // Adds important notice to dialog
        if (this.dialog != null && this.dialog.container != null) {
            var alert = this.createRealtimeNotice();
            alert.style.left = '0';
            alert.style.right = '0';
            alert.style.borderRadius = '0';
            alert.style.borderLeftStyle = 'none';
            alert.style.borderRightStyle = 'none';
            alert.style.marginBottom = '26px';
            alert.style.padding = '8px 0 8px 0';

            this.dialog.container.appendChild(alert);
        }
    }
};

/**
 * 在微调器停止后调用 start 。
 */
App.prototype.showAlert = function (message) {
    if (message != null && message.length > 0) {
        var div = document.createElement('div');
        div.className = 'geAlert';
        div.style.zIndex = 2e9;
        div.style.left = '50%';
        div.style.top = '-100%';
        mxUtils.setPrefixedStyle(div.style, 'transform', 'translate(-50%,0%)');
        mxUtils.setPrefixedStyle(div.style, 'transition', 'all 1s ease');

        div.innerHTML = message;

        var close = document.createElement('a');
        close.className = 'geAlertLink';
        close.style.textAlign = 'right';
        close.style.marginTop = '20px';
        close.style.display = 'block';
        close.setAttribute('title', mxResources.get('close'));
        close.innerHTML = mxResources.get('close');
        div.appendChild(close);

        mxEvent.addListener(close, 'click', function (evt) {
            if (div.parentNode != null) {
                div.parentNode.removeChild(div);
                mxEvent.consume(evt);
            }
        });

        document.body.appendChild(div);

        // Delayed to get smoother animation after DOM rendering
        window.setTimeout(function () {
            div.style.top = '30px';
        }, 10);

        // Fades out the alert after 15 secs
        window.setTimeout(function () {
            mxUtils.setPrefixedStyle(div.style, 'transition', 'all 2s ease');
            div.style.opacity = '0';

            window.setTimeout(function () {
                if (div.parentNode != null) {
                    div.parentNode.removeChild(div);
                }
            }, 2000);
        }, 15000);
    }
};

/**
 * 开始
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.start = function () {
    // console.log("App.prototype.start init-4")
    if (this.bg != null && this.bg.parentNode != null) {
        this.bg.parentNode.removeChild(this.bg);
    }

    this.restoreLibraries();
    this.spinner.stop();

    try {
        // 处理所有错误
        var ui = this;

        window.onerror = function (message, url, linenumber, colno, err) {
            // 忽略语法错误 [1344]
            if (message != 'ResizeObserver loop limit exceeded') {
                EditorUi.logError('Uncaught: ' + ((message != null) ? message : ''),
                    url, linenumber, colno, err, null, true);
                ui.handleError({message: message}, mxResources.get('unknownError'),
                    null, null, null, null, true);
            }
        };

        // 如果未处于嵌入或客户端模式，则侦听散列的更改
        if (urlParams['client'] != '1' && urlParams['embed'] != '1') {
            // 如果有，则安装侦听器以声明当前草稿
            try {
                if (isLocalStorage) {
                    window.addEventListener('storage', mxUtils.bind(this, function (evt) {
                        var file = this.getCurrentFile();
                        EditorUi.debug('storage event', evt, file);

                        if (file != null && evt.key == '.draft-alive-check' && evt.newValue != null && file.draftId != null) {
                            this.draftAliveCheck = evt.newValue;
                            file.saveDraft();
                        }
                    }));
                }

                if (!mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp && !this.isOfflineApp() &&
                    urlParams['open'] == null && /www\.draw\.io$/.test(window.location.hostname) &&
                    (!this.editor.chromeless || this.editor.editable)) {
                    //显示下载桌面版APP
                    // this.showNameChangeBanner();
                }
            } catch (e) {
                // ignore
            }

            mxEvent.addListener(window, 'hashchange', mxUtils.bind(this, function (evt) {
                try {
                    this.hideDialog();
                    var id = this.getDiagramId();
                    var file = this.getCurrentFile();

                    if (file == null || file.getHash() != id) {
                        this.loadFile(id, true);
                    }
                } catch (e) {
                    // 解决Dialog ctor中可能为null的scrollWidth的解决方法
                    if (document.body != null) {
                        this.handleError(e, mxResources.get('errorLoadingFile'), mxUtils.bind(this, function () {
                            var file = this.getCurrentFile();
                            window.location.hash = (file != null) ? file.getHash() : '';
                        }));
                    }
                }
            }));
        }

        // CSV 导入的描述符
        if ((window.location.hash == null || window.location.hash.length <= 1) && urlParams['desc'] != null) {
            try {
                this.loadDescriptor(JSON.parse(Graph.decompress(urlParams['desc'])),
                    null, mxUtils.bind(this, function (e) {
                        this.handleError(e, mxResources.get('errorLoadingFile'));
                    }));
            } catch (e) {
                this.handleError(e, mxResources.get('errorLoadingFile'));
            }
        }
        // 将旧的 url URL 参数重定向到新的 #U 格式
        else if ((window.location.hash == null || window.location.hash.length <= 1) && urlParams['url'] != null) {
            this.loadFile('U' + urlParams['url'], true);
        } else if (this.getCurrentFile() == null) {
            var done = mxUtils.bind(this, function () {
                // 以客户端模式启动并等待数据
                if (urlParams['client'] == '1' && (window.location.hash == null ||
                    window.location.hash.length == 0 || window.location.hash.substring(0, 2) == '#P')) {
                    var doLoadFile = mxUtils.bind(this, function (xml) {
                        // 从 PNG 中提取图形模型
                        if (xml.substring(0, 22) == 'data:image/png;base64,') {
                            xml = this.extractGraphModelFromPng(xml);
                        }

                        var title = urlParams['title'];

                        if (title != null) {
                            title = decodeURIComponent(title);
                        } else {
                            title = this.defaultFilename;
                        }

                        var file = new LocalFile(this, xml, title, true);

                        if (window.location.hash != null && window.location.hash.substring(0, 2) == '#P') {
                            file.getHash = function () {
                                return window.location.hash.substring(1);
                            };
                        }

                        this.fileLoaded(file);
                        this.getCurrentFile().setModified(!this.editor.chromeless);
                    });

                    var parent = window.opener || window.parent;

                    if (parent != window) {
                        var value = urlParams['create'];

                        if (value != null) {
                            doLoadFile(parent[decodeURIComponent(value)]);
                        } else {
                            value = urlParams['data'];

                            if (value != null) {
                                doLoadFile(decodeURIComponent(value));
                            } else {
                                this.installMessageHandler(mxUtils.bind(this, function (xml, evt) {
                                    // 忽略来自其他窗口的消息
                                    if (evt.source == parent) {
                                        doLoadFile(xml);
                                    }
                                }));
                            }
                        }
                    }
                }
                //检查是否没有显示较早的加载错误
                else if (this.dialog == null) {
                    if (urlParams['demo'] == '1') {
                        var prev = Editor.useLocalStorage;
                        this.createFile(this.defaultFilename, null, null, null, null, null, null, true);
                        Editor.useLocalStorage = prev;
                    } else {
                        //this
                        var waiting = false;

                        // 检查我们是否正在等待加载某个异步文件
                        // FF 中不允许跨域窗口访问，所以如果我们
                        // 从另一个域打开，那么这将失败。
                        try {
                            waiting = window.opener != null && window.opener.openFile != null;
                        } catch (e) {
                            // ignore
                        }
                        // console.log("waiting init-5", waiting);

                        //false
                        if (waiting) {

                            // Spinner 在 App.open 中停止  加载中
                            this.spinner.spin(document.body, mxResources.get('loading'));
                            //停止
                            // this.spinner.stop();
                        } else {
                            var id = this.getDiagramId();

                            if (EditorUi.enableDrafts && (urlParams['mode'] == null || EditorUi.isElectronApp) &&
                                this.getServiceName() == 'draw.io' && (id == null || id.length == 0) &&
                                !this.editor.isChromelessView()) {
                                //草稿
                                this.checkDrafts();
                            } else if (id != null && id.length > 0) {
                                this.loadFile(id, null, null, mxUtils.bind(this, function () {
                                    var temp = decodeURIComponent(urlParams['viewbox'] || '');

                                    if (temp != '') {
                                        try {
                                            var bounds = JSON.parse(temp);
                                            this.editor.graph.fitWindow(bounds, bounds.border);
                                        } catch (e) {
                                            // 忽略无效视口
                                            console.error(e);
                                        }
                                    }
                                }));
                            } else if (urlParams['splash'] != '0') {
                                this.loadFile();
                            } else {
                                this.createFile(this.defaultFilename, this.getFileData(), null, null, null, null, null, true);
                            }
                        }
                    }
                }
            });

            var value = decodeURIComponent(urlParams['create'] || '');

            if ((window.location.hash == null || window.location.hash.length <= 1) &&
                value != null && value.length > 0 && this.spinner.spin(document.body, mxResources.get('loading'))) {
                var reconnect = mxUtils.bind(this, function () {
                    // 删除 URL 参数并重新加载页面
                    if (this.spinner.spin(document.body, mxResources.get('reconnecting'))) {
                        window.location.search = this.getSearch(['create', 'title']);
                    }
                    ;
                });

                var showCreateDialog = mxUtils.bind(this, function (xml) {
                    this.spinner.stop();

                    // 重置对话框模式 - 本地文件仅用于预览
                    if (urlParams['splash'] != '0') {
                        this.fileLoaded(new LocalFile(this, xml, null));

                        this.editor.graph.setEnabled(false);
                        this.mode = urlParams['mode'];
                        var title = urlParams['title'];

                        if (title != null) {
                            title = decodeURIComponent(title);
                        } else {
                            title = this.defaultFilename;
                        }

                        var serviceCount = this.getServiceCount(true);

                        if (isLocalStorage) {
                            serviceCount++;
                        }

                        var rowLimit = (serviceCount <= 4) ? 2 : (serviceCount > 6 ? 4 : 3);

                        var dlg = new CreateDialog(this, title, mxUtils.bind(this, function (filename, mode) {
                                if (mode == null) {
                                    this.hideDialog();
                                    var prev = Editor.useLocalStorage;
                                    this.createFile((filename.length > 0) ? filename : this.defaultFilename,
                                        this.getFileData(), null, null, null, true, null, true);
                                    Editor.useLocalStorage = prev;
                                } else {
                                    this.pickFolder(mode, mxUtils.bind(this, function (folderId) {
                                        this.createFile(filename, this.getFileData(true),
                                            null, mode, null, true, folderId);
                                    }));
                                }
                            }), null, null, null, null, urlParams['browser'] == '1',
                            null, null, true, rowLimit, null, null, null,
                            this.editor.fileExtensions);
                        this.showDialog(dlg.container, 400, (serviceCount > rowLimit) ? 390 : 270,
                            true, false, mxUtils.bind(this, function (cancel) {
                                if (cancel && this.getCurrentFile() == null) {
                                    this.showSplash();
                                }
                            }));
                        dlg.init();
                    }
                });

                value = decodeURIComponent(value);

                if (value.substring(0, 7) != 'http://' && value.substring(0, 8) != 'https://') {
                    // FF 中不允许跨域窗口访问，所以如果我们
                    // 从另一个域打开，那么这将失败。
                    try {
                        if (window.opener != null && window.opener[value] != null) {
                            showCreateDialog(window.opener[value]);
                        } else {
                            this.handleError(null, mxResources.get('errorLoadingFile'));
                        }
                    } catch (e) {
                        this.handleError(e, mxResources.get('errorLoadingFile'));
                    }
                } else {
                    this.loadTemplate(value, function (text) {
                        showCreateDialog(text);
                    }, mxUtils.bind(this, function () {
                        this.handleError(null, mxResources.get('errorLoadingFile'), reconnect);
                    }));
                }
            } else {
                // 将 state 参数中的 fileId 传递给哈希标签并重新加载
                // 没有状态参数的页面
                if ((window.location.hash == null || window.location.hash.length <= 1) &&
                    urlParams['state'] != null && this.stateArg != null && this.stateArg.action == 'open') {
                    if (this.stateArg.ids != null) {
                        if (window.history && window.history.replaceState) {
                            // 删除状态 URL 参数而不重新加载页面
                            window.history.replaceState(null, null, window.location.pathname +
                                this.getSearch(['state']));
                        }

                        window.location.hash = 'G' + this.stateArg.ids[0];
                    }
                } else if ((window.location.hash == null || window.location.hash.length <= 1) &&
                    this.drive != null && this.stateArg != null && this.stateArg.action == 'create') {
                    if (window.history && window.history.replaceState) {
                        // 删除状态 URL 参数而不重新加载页面
                        window.history.replaceState(null, null, window.location.pathname +
                            this.getSearch(['state']));
                    }

                    this.setMode(App.MODE_GOOGLE);
                    this.actions.get('new').funct();
                } else {
                    // 删除打开的 URL 参数。 Hash 也在 Init 中更新以加载客户端。
                    if (urlParams['open'] != null && window.history && window.history.replaceState) {
                        window.history.replaceState(null, null, window.location.pathname +
                            this.getSearch(['open']));
                        window.location.hash = urlParams['open'];
                    }

                    done();
                }
            }
        }
    } catch (e) {
        this.handleError(e);
    }
};

/**
 * 检查孤立的草稿。
 */
App.prototype.loadDraft = function (xml, success) {
    console.log("App.prototype.loadDraft---检查孤立的草稿。")
    this.createFile(this.defaultFilename, xml, null, null, mxUtils.bind(this, function () {
        window.setTimeout(mxUtils.bind(this, function () {
            var file = this.getCurrentFile();

            if (file != null) {
                file.fileChanged();

                if (success != null) {
                    success();
                }
            }
        }), 0);
    }), null, null, true);
};
App.prototype.websocker = function (i) {
    if (typeof WebSocket == 'undefined') {
        var errorWrapper = mxUtils.bind(i, function (e) {
            i.handleError("浏览器暂不支持同步功能，请使用更高版本的浏览器,以免数据丢失", "连接丢失");
        });
        errorWrapper()
    }

    var ws = new WebSocket(App.address_ajax.get_WebSocket_uri());
    client = Stomp.over(ws);
    client.heartbeat.incoming = 0;
    var n  = function () {
        client.subscribe(`/exchange/mxgraph_cooperate/` + LocalFile.prototype.getGrawFid(), function (e) {
            var ws = e.body;
            // console.log("获取到的消息==",msg.split("#-@-#")[0],msg.split("#-@-#")[1])
            LocalFile.prototype.setGrawVersion(ws.split("#-@-#")[1]);
            // console.log("从js中获取",LocalFile.prototype.getGrawVersion());
            EditorUi.prototype.synchronizeCurrentFile(false, i, ws.split("#-@-#")[0]);
        });
    };
    client.connect('web', 'web', n, function () {
        console.log("链接丢失,重新连接")
        i.websocker(i);
    }, '/');
}

/**
 * 检查草稿。
 */
App.prototype.checkDrafts = function () {
    // console.log("App.prototype.checkDrafts,检查草稿 init-6")
    try {
        // 触发其他窗口的存储事件以标记活动草稿
        var guid = Editor.guid();
        localStorage.setItem('.draft-alive-check', guid);

        window.setTimeout(mxUtils.bind(this, function () {
            localStorage.removeItem('.draft-alive-check');

            var errorWrapper = mxUtils.bind(this, function (e) {
                this.handleError("该文件不存在或没有权限", "文件打开失败", function () {
                    window.location.href = 'http://' + location.host + '/myFile.html';
                });
            });
            this.getDatabaseItems(mxUtils.bind(this, function (items) {
                // 收集孤立的草稿
                var drafts = [];
                for (var i = 0; i < items.length; i++) {
                    try {
                        var key = items[i].key;

                        if (key != null && key.substring(0, 7) == '.draft_') {
                            var obj = JSON.parse(items[i].data);

                            if (obj != null && obj.type == 'draft' && obj.aliveCheck != guid) {
                                obj.key = key;
                                drafts.push(obj);
                            }
                        }
                    } catch (e) {
                        // ignore
                    }
                }

                for (var draft of drafts) {
                    this.removeDatabaseItem(draft.key);
                }

                // console.log("创建新的文件 init-10")
                that = this;
                var url = window.location.href;
                // console.log(url);
                if (url.split('?')[1] != null && url.split('?')[1] != "") {
                    App.address_ajax.ajax('', "/file/lookBvaFile/" + decodeURI(url.split('?')[1]), "post", "json", "", function (res) {
                        if (res.resp_code == 200) {
                            LocalFile.prototype.setTitle(res.datas.name);
                            LocalFile.prototype.setGrawVersion(res.datas.version);
                            LocalFile.prototype.setGrawFid(url.split('?')[1]);
                            LocalFile.prototype.setGrawUrl(res.datas.name);
                            // sessionStorage.setItem(decodeURI(url.split('?')[1]), res.data.name);
                            that.createFile(res.datas.name, res.datas.data, null, null, null, null, null, true);
                            that.websocker(that);
                        } else {
                            errorWrapper();
                        }

                    })
                } else {
                    errorWrapper();
                    // var url = MXGRAPH_URL+"/index.html?file=/" + this.defaultFilename+".drawio";
                    // window.history.pushState(null, null, url)
                    // this.createFile(this.defaultFilename, this.getFileData(), null, null, null, null, null, true);
                }
            }), mxUtils.bind(this, function () {
                errorWrapper();
                // if (urlParams['splash'] != '0') {
                //     this.loadFile();
                // } else {
                //     this.createFile(this.defaultFilename, this.getFileData(), null, null, null, null, null, true);
                // }
            }));
        }), 0);
    } catch (e) {
        // ignore
    }
};

/**
 * 在没有文件菜单的情况下运行时不应显示启动对话框
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.showSplash = function (force) {

    //停止显示初始对话框,直接创建新的画布
    urlParams['noFileMenu'] = '1';
    var prev = Editor.useLocalStorage;
    this.createFile(this.defaultFilename + (EditorUi.isElectronApp ? '.drawio' : ''), null, null, null, null, null, null,
        urlParams['local'] != '1');
    Editor.useLocalStorage = prev;

    if (urlParams['noFileMenu'] == '1') {
        return;
    }

    var serviceCount = this.getServiceCount(true);

    //创建新绘图   打开现有绘图
    var showSecondDialog = mxUtils.bind(this, function () {
        var dlg = new SplashDialog(this);

        this.showDialog(dlg.container, 340, (mxClient.IS_CHROMEAPP || EditorUi.isElectronApp) ? 200 : 230, true, true,
            mxUtils.bind(this, function (cancel) {
                // 如果对话框关闭，则创建一个空白图表
                if (cancel && !mxClient.IS_CHROMEAPP) {
                    //TODO 创建空白图表
                    console.log("创建空白图表")

                    var prev = Editor.useLocalStorage;
                    this.createFile(this.defaultFilename + (EditorUi.isElectronApp ? '.drawio' : ''), null, null, null, null, null, null,
                        urlParams['local'] != '1');
                    Editor.useLocalStorage = prev;
                }
            }), true);
    });

    if (this.editor.isChromelessView()) {
        this.handleError({message: mxResources.get('noFileSelected')},
            mxResources.get('errorLoadingFile'), mxUtils.bind(this, function () {
                this.showSplash();
            }));
    } else if (!mxClient.IS_CHROMEAPP && (this.mode == null || force)) {
        var rowLimit = (serviceCount == 4) ? 2 : 3;
        console.log("2")
        var dlg = new StorageDialog(this, mxUtils.bind(this, function () {
            this.hideDialog();
            //
            //   showSecondDialog();
        }), rowLimit);

        this.showDialog(dlg.container, (rowLimit < 3) ? 200 : 300,
            ((serviceCount > 3) ? 320 : 210), true, false);
    } else if (urlParams['create'] == null) {
        console.log("3")
        // showSecondDialog();
    }
};

/**
 * 添加语言菜单
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.addLanguageMenu = function (elt, addLabel) {
    var img = null;
    var langMenu = this.menus.get('language');

    if (langMenu != null) {
        img = document.createElement('div');
        img.setAttribute('title', mxResources.get('language'));
        img.className = 'geIcon geSprite geSprite-globe';
        img.style.position = 'absolute';
        img.style.cursor = 'pointer';
        img.style.bottom = '20px';
        img.style.right = '20px';

        if (addLabel) {
            img.style.direction = 'rtl';
            img.style.textAlign = 'right';
            img.style.right = '24px';

            var label = document.createElement('span');
            label.style.display = 'inline-block';
            label.style.fontSize = '12px';
            label.style.margin = '5px 24px 0 0';
            label.style.color = 'gray';
            label.style.userSelect = 'none';

            mxUtils.write(label, mxResources.get('language'));
            img.appendChild(label);
        }

        mxEvent.addListener(img, 'click', mxUtils.bind(this, function (evt) {
            this.editor.graph.popupMenuHandler.hideMenu();
            var menu = new mxPopupMenu(this.menus.get('language').funct);
            menu.div.className += ' geMenubarMenu';
            menu.smartSeparators = true;
            menu.showDisabled = true;
            menu.autoExpand = true;

            // 隐藏时禁用自动展开和销毁菜单
            menu.hideMenu = mxUtils.bind(this, function () {
                mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
                menu.destroy();
            });

            var offset = mxUtils.getOffset(img);
            menu.popup(offset.x, offset.y + img.offsetHeight, null, evt);

            // 允许通过单击文档隐藏
            this.setCurrentMenu(menu);
        }));

        elt.appendChild(img);
    }

    return img;
};

/**
 * 将给定的文件句柄作为本地文件加载。加载文件系统条目
 */
App.prototype.loadFileSystemEntry = function (fileHandle, success, error) {
    error = (error != null) ? error : mxUtils.bind(this, function (e) {
        this.handleError(e);
    });

    try {
        fileHandle.getFile().then(mxUtils.bind(this, function (file) {
            var reader = new FileReader();

            reader.onload = mxUtils.bind(this, function (e) {
                try {
                    if (success != null) {
                        var data = e.target.result;

                        if (file.type == 'image/png') {
                            data = this.extractGraphModelFromPng(data);
                        }

                        success(new LocalFile(this, data, file.name, null, fileHandle, file));
                    } else {
                        this.openFileHandle(e.target.result, file.name, file, false, fileHandle);
                    }
                } catch (e) {
                    error(e);
                }
            });

            reader.onerror = error;

            if ((file.type.substring(0, 5) === 'image' ||
                file.type === 'application/pdf') &&
                file.type.substring(0, 9) !== 'image/svg') {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        }), error);
    } catch (e) {
        error(e);
    }
};

/**
 * 将给定的文件句柄作为本地文件加载。创建文件系统选项
 */
App.prototype.createFileSystemOptions = function (name) {
    var ext = [];
    var temp = null;

    if (name != null) {
        var idx = name.lastIndexOf('.');

        if (idx > 0) {
            temp = name.substring(idx + 1);
        }
    }

    for (var i = 0; i < this.editor.diagramFileTypes.length; i++) {
        var obj = {
            description: mxResources.get(this.editor.diagramFileTypes[i].description) +
                ((mxClient.IS_MAC) ? ' (.' + this.editor.diagramFileTypes[i].extension + ')' : ''),
            accept: {}
        };
        obj.accept[this.editor.diagramFileTypes[i].mimeType] = ['.' + this.editor.diagramFileTypes[i].extension];

        if (this.editor.diagramFileTypes[i].extension == temp) {
            ext.splice(0, 0, obj);
        } else {
            if (this.editor.diagramFileTypes[i].extension == temp) {
                ext.splice(0, 0, obj);
            } else {
                ext.push(obj);
            }
        }
    }

    // TODO: 指定默认文件名
    return {types: ext, fileName: name};
};

/**
 * 将给定的文件句柄作为本地文件加载。显示保存文件选择器
 */
App.prototype.showSaveFilePicker = function (success, error, opts) {
    error = (error != null) ? error : mxUtils.bind(this, function (e) {
        if (e.name != 'AbortError') {
            this.handleError(e);
        }
    });

    // opts = (opts != null) ? opts : this.createFileSystemOptions();
    opts = null;
    window.showSaveFilePicker(opts).then(mxUtils.bind(this, function (fileHandle) {
        if (fileHandle != null) {
            fileHandle.getFile().then(mxUtils.bind(this, function (desc) {
                success(fileHandle, desc);
            }), error);
        }
    }), error);
};

/**
 * 选择文件
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.pickFile = function (mode) {
    try {
        mode = (mode != null) ? mode : this.mode;

        // if (mode == App.MODE_GOOGLE) {
        //     // if (this.drive != null && typeof (google) != 'undefined' && typeof (google.picker) != 'undefined') {
        //     //     this.drive.pickFile();
        //     // } else {
        //     //     this.openLink('https://drive.google.com');
        //     // }
        // } else {
        var peer = this.getPeerForMode(mode);

        if (peer != null) {
            peer.pickFile();
        }
        // else if (mode == App.MODE_DEVICE && 'showOpenFilePicker' in window && !EditorUi.isElectronApp) {
        //     console.log("else if (mode == App.MODE_DEVIE && 'showOpenFilePicker' in window && !EditorUi.isElectronApp) {")
        //     // window.showOpenFilePicker().then(mxUtils.bind(this, function (fileHandles) {
        //     //     if (fileHandles != null && fileHandles.length > 0 &&
        //     //         this.spinner.spin(document.body, mxResources.get('loading'))) {
        //     //         this.loadFileSystemEntry(fileHandles[0]);
        //     //     }
        //     // }), mxUtils.bind(this, function (e) {
        //     //     if (e.name != 'AbortError') {
        //     //         this.handleError(e);
        //     //     }
        //     // }));
        // } else if (mode == App.MODE_DEVICE && Graph.fileSupport) {
        //     console.log("} else if (mode == App.MODE_DEICE && Graph.fileSupport) {")
        //     // if (this.openFileInputElt == null) {
        //     //     var input = document.createElement('input');
        //     //     input.setAttribute('type', 'file');
        //     //
        //     //     mxEvent.addListener(input, 'change', mxUtils.bind(this, function () {
        //     //         if (input.files != null) {
        //     //             this.openFiles(input.files);
        //     //
        //     //             // Resets input to force change event for
        //     //             // same file (type reset required for IE)
        //     //             input.type = '';
        //     //             input.type = 'file';
        //     //             input.value = '';
        //     //         }
        //     //     }));
        //     //
        //     //     input.style.display = 'none';
        //     //     document.body.appendChild(input);
        //     //     this.openFileInputElt = input;
        //     // }
        //     //
        //     // this.openFileInputElt.click();
        // }
        else {
            this.hideDialog();
            window.openNew = this.getCurrentFile() != null && !this.isDiagramEmpty();
            window.baseUrl = this.getUrl();
            window.openKey = 'open';

            window.listBrowserFiles = mxUtils.bind(this, function (success, error) {
                StorageFile.listFiles(this, 'F', success, error);
            });

            window.openBrowserFile = mxUtils.bind(this, function (title, success, error) {
                StorageFile.getFileContent(this, title, success, error);
            });

            window.deleteBrowserFile = mxUtils.bind(this, function (title, success, error) {
                StorageFile.deleteFile(this, title, success, error);
            });

            var prevValue = Editor.useLocalStorage;
            Editor.useLocalStorage = (mode == App.MODE_BROWSER);
            this.openFile();

            // Installs local handler for opened files in same window
            window.openFile.setConsumer(mxUtils.bind(this, function (xml, filename) {
                // Replaces PNG with XML extension
                var dot = !this.useCanvasForExport && filename.substring(filename.length - 4) == '.png';

                if (dot) {
                    filename = filename.substring(0, filename.length - 4) + '.drawio';
                }

                this.fileLoaded((mode == App.MODE_BROWSER) ?
                    new StorageFile(this, xml, filename) :
                    new LocalFile(this, xml, filename));
            }));

            // Extends dialog close to show splash screen
            var dlg = this.dialog;
            var dlgClose = dlg.close;

            this.dialog.close = mxUtils.bind(this, function (cancel) {
                Editor.useLocalStorage = prevValue;
                dlgClose.apply(dlg, arguments);

                if (this.getCurrentFile() == null) {
                    this.showSplash();
                }
            });
        }
        // }
    } catch (e) {
        this.handleError(e);
    }
};

/**
 * Translates this point by the given vector. 选择库
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.pickLibrary = function (mode) {
    mode = (mode != null) ? mode : this.mode;

    if (mode == App.MODE_GOOGLE || mode == App.MODE_DROPBOX || mode == App.MODE_ONEDRIVE ||
        mode == App.MODE_GITHUB || mode == App.MODE_GITLAB || mode == App.MODE_TRELLO) {
        var peer = (mode == App.MODE_GOOGLE) ? this.drive :
            ((mode == App.MODE_ONEDRIVE) ? this.oneDrive :
                ((mode == App.MODE_GITHUB) ? this.gitHub :
                    ((mode == App.MODE_GITLAB) ? this.gitLab :
                        ((mode == App.MODE_TRELLO) ? this.trello :
                            this.dropbox))));

        if (peer != null) {
            peer.pickLibrary(mxUtils.bind(this, function (id, optionalFile) {
                if (optionalFile != null) {
                    try {
                        this.loadLibrary(optionalFile);
                    } catch (e) {
                        this.handleError(e, mxResources.get('errorLoadingFile'));
                    }
                } else {
                    if (this.spinner.spin(document.body, mxResources.get('loading'))) {
                        peer.getLibrary(id, mxUtils.bind(this, function (file) {
                            this.spinner.stop();

                            try {
                                console.log("app.js:3219")
                                this.loadLibrary(file);
                            } catch (e) {
                                this.handleError(e, mxResources.get('errorLoadingFile'));
                            }
                        }), mxUtils.bind(this, function (resp) {
                            this.handleError(resp, (resp != null) ? mxResources.get('errorLoadingFile') : null);
                        }));
                    }
                }
            }));
        }
    } else if (mode == App.MODE_DEVICE && Graph.fileSupport) {
        console.log("&& Graph.fileSupport) {12")
        // if (this.libFileInputElt == null) {
        //     var input = document.createElement('input');
        //     input.setAttribute('type', 'file');
        //
        //     mxEvent.addListener(input, 'change', mxUtils.bind(this, function () {
        //         if (input.files != null) {
        //             for (var i = 0; i < input.files.length; i++) {
        //                 (mxUtils.bind(this, function (file) {
        //                     var reader = new FileReader();
        //
        //                     reader.onload = mxUtils.bind(this, function (e) {
        //                         try {
        //                             this.loadLibrary(new LocalLibrary(this, e.target.result, file.name));
        //                         } catch (e) {
        //                             this.handleError(e, mxResources.get('errorLoadingFile'));
        //                         }
        //                     });
        //
        //                     reader.readAsText(file);
        //                 }))(input.files[i]);
        //             }
        //
        //             // Resets input to force change event for same file (type reset required for IE)
        //             input.type = '';
        //             input.type = 'file';
        //             input.value = '';
        //         }
        //     }));
        //
        //     input.style.display = 'none';
        //     document.body.appendChild(input);
        //     this.libFileInputElt = input;
        // }
        //
        // this.libFileInputElt.click();
    } else {
        window.openNew = false;
        window.openKey = 'open';

        window.listBrowserFiles = mxUtils.bind(this, function (success, error) {
            StorageFile.listFiles(this, 'L', success, error);
        });

        window.openBrowserFile = mxUtils.bind(this, function (title, success, error) {
            StorageFile.getFileContent(this, title, success, error);
        });

        window.deleteBrowserFile = mxUtils.bind(this, function (title, success, error) {
            StorageFile.deleteFile(this, title, success, error);
        });

        var prevValue = Editor.useLocalStorage;
        Editor.useLocalStorage = mode == App.MODE_BROWSER;

        // Closes dialog after open
        window.openFile = new OpenFile(mxUtils.bind(this, function (cancel) {
            this.hideDialog(cancel);
        }));

        window.openFile.setConsumer(mxUtils.bind(this, function (xml, filename) {
            try {
                console.log("app.js:3294")
                this.loadLibrary((mode == App.MODE_BROWSER) ? new StorageLibrary(this, xml, filename) :
                    new LocalLibrary(this, xml, filename));
            } catch (e) {
                this.handleError(e, mxResources.get('errorLoadingFile'));
            }
        }));

        // Removes openFile if dialog is closed
        this.showDialog(new OpenDialog(this).container, (Editor.useLocalStorage) ? 640 : 360,
            (Editor.useLocalStorage) ? 480 : 220, true, true, function () {
                Editor.useLocalStorage = prevValue;
                window.openFile = null;
            });
    }
};

/**
 * 保存库
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.saveLibrary = function (name, images, file, mode, noSpin, noReload, fn) {
    try {
        //mode== browser
        // console.log(name, images, file, mode, noSpin, noReload, fn)
        mode = (mode != null) ? mode : this.mode;
        noSpin = (noSpin != null) ? noSpin : false;
        noReload = (noReload != null) ? noReload : false;
        var xml = this.createLibraryDataFromImages(images);
        // console.log(xml)

        var error = mxUtils.bind(this, function (resp) {
            this.spinner.stop();

            if (fn != null) {
                fn();
            }

            this.handleError(resp, (resp != null) ? mxResources.get('errorSavingFile') : null);
        });

        // 处理本地图书馆的特殊情况
        if (file == null && mode == App.MODE_DEVICE) {
            console.log("处理本地图书馆的特殊情况")
            file = new LocalLibrary(this, xml, name);
        }

        if (file == null) {

            this.pickFolder(mode, mxUtils.bind(this, function (folderId) {
                // if (mode == App.MODE_GOOGLE && this.drive != null && this.spinner.spin(document.body, mxResources.get('inserting'))) {
                //     this.drive.insertFile(name, xml, folderId, mxUtils.bind(this, function (newFile) {
                //         this.spinner.stop();
                //         this.hideDialog(true);
                //         this.libraryLoaded(newFile, images);
                //     }), error, this.drive.libraryMimeType);
                // } else if (mode == App.MODE_GITHUB && this.gitHub != null && this.spinner.spin(document.body, mxResources.get('inserting'))) {
                //     this.gitHub.insertLibrary(name, xml, mxUtils.bind(this, function (newFile) {
                //         this.spinner.stop();
                //         this.hideDialog(true);
                //         this.libraryLoaded(newFile, images);
                //     }), error, folderId);
                // } else if (mode == App.MODE_GITLAB && this.gitLab != null && this.spinner.spin(document.body, mxResources.get('inserting'))) {
                //     this.gitLab.insertLibrary(name, xml, mxUtils.bind(this, function (newFile) {
                //         this.spinner.stop();
                //         this.hideDialog(true);
                //         this.libraryLoaded(newFile, images);
                //     }), error, folderId);
                // } else if (mode == App.MODE_TRELLO && this.trello != null && this.spinner.spin(document.body, mxResources.get('inserting'))) {
                //     this.trello.insertLibrary(name, xml, mxUtils.bind(this, function (newFile) {
                //         this.spinner.stop();
                //         this.hideDialog(true);
                //         this.libraryLoaded(newFile, images);
                //     }), error, folderId);
                // } else if (mode == App.MODE_DROPBOX && this.dropbox != null && this.spinner.spin(document.body, mxResources.get('inserting'))) {
                //     this.dropbox.insertLibrary(name, xml, mxUtils.bind(this, function (newFile) {
                //         this.spinner.stop();
                //         this.hideDialog(true);
                //         this.libraryLoaded(newFile, images);
                //     }), error, folderId);
                // } else if (mode == App.MODE_ONEDRIVE && this.oneDrive != null && this.spinner.spin(document.body, mxResources.get('inserting'))) {
                //     this.oneDrive.insertLibrary(name, xml, mxUtils.bind(this, function (newFile) {
                //         this.spinner.stop();
                //         this.hideDialog(true);
                //         this.libraryLoaded(newFile, images);
                //     }), error, folderId);
                // } else
                // if (mode == App.MODE_BROWSER) {
                    var fn = mxUtils.bind(this, function () {
                        var file = new StorageLibrary(this, xml, name);

                        // Inserts data into local storage
                        file.saveFile(name, false, mxUtils.bind(this, function () {
                            this.hideDialog(true);
                            this.libraryLoaded(file, images);
                        }), error);
                    });

                    if (localStorage.getItem(name) == null) {
                        fn();
                    } else {
                        this.confirm(mxResources.get('replaceIt', [name]), fn);
                    }
                // } else {
                //     this.handleError({message: mxResources.get('serviceUnavailableOrBlocked')});
                // }
            }));
        } else if (noSpin || this.spinner.spin(document.body, mxResources.get('saving'))) {
            file.setData(xml);
            // console.log("保存之前->",file)
            var doSave = mxUtils.bind(this, function () {
                file.save(true, mxUtils.bind(this, function (resp) {
                    // console.log(file,images)
                    _this=this;
                    App.address_ajax.ajax('', "/draw/saveLibrary", "post", "json", {libraryData:JSON.stringify(images)}, function (res) {
                        _this.spinner.stop();
                        _this.hideDialog(true);
                        toastr.success("保存成功");
                        // file.data="<mxlibrary>[]</mxlibrary>";
                        // file.shadowData="<mxlibrary>[]</mxlibrary>";
                        // console.log("保存之后->",file)
                        if (!noReload) {

                            _this.libraryLoaded(file, images);
                        }
                        if (fn != null) {
                            fn();
                        }
                    })
                }), error);


            });

            if (name != file.getTitle()) {
                var oldHash = file.getHash();

                file.rename(name, mxUtils.bind(this, function (resp) {
                    // 更改存储设置中的哈希
                    if (file.constructor != LocalLibrary && oldHash != file.getHash()) {
                        mxSettings.removeCustomLibrary(oldHash);
                        mxSettings.addCustomLibrary(file.getHash());
                    }

                    // 库文件更改哈希的解决方法
                    // 旧库不能从
                    // 侧边栏使用 libraryLoaded 中更新的文件
                    this.removeLibrarySidebar(oldHash);

                    doSave();
                }), error)
            } else {
                doSave();
            }
        }
    } catch (e) {
        this.handleError(e);
    }
};

/**
 * 将标签菜单项添加到给定的菜单和父项。 保存文件
 */
App.prototype.saveFile = function (forceDialog, success) {
    // console.log("调用本地文件");   //4627
    var file = this.getCurrentFile();
    if (file != null) {
        // FIXME: 调用本地文件
        var done = mxUtils.bind(this, function () {
            if (EditorUi.enableDrafts) {
                file.removeDraft();
            }

            if (this.getCurrentFile() != file && !file.isModified()) {
                // 显示另存为对话框时可能的状态更新的解决方法
                // 是不显示设备文件的已保存状态
                if (file.getMode() != App.MODE_DEVICE) {
                    console.log("可能的状态更新的解决方法")
                    this.editor.setStatus(mxUtils.htmlEntities(mxResources.get('allChangesSaved')));
                } else {
                    this.editor.setStatus('');
                }
            }

            if (success != null) {
                success();
            }
        });

        if (!forceDialog && file.getTitle() != null && file.invalidFileHandle == null && this.mode != null) {
            this.save(file.getTitle(), done);
        } else if (file != null && file.constructor == LocalFile && file.fileHandle != null) {
            this.showSaveFilePicker(mxUtils.bind(this, function (fileHandle, desc) {
                file.invalidFileHandle = null;
                file.fileHandle = fileHandle;
                file.title = desc.name;
                file.desc = desc;
                this.save(desc.name, done);
            }), null, this.createFileSystemOptions(file.getTitle()));
        } else {
            var filename = (file.getTitle() != null) ? file.getTitle() : this.defaultFilename;
            // console.log("保存至设备") 4741
            file.fileHandle = 123;
            file.mode = App.MODE_DEVICE;
            this.setMode(App.MODE_DEVICE);
            this.save(filename, done);
        }
    }
};

/**
 * 加载模板
 *
 * @param {number} dx 平移的 X 坐标。
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.loadTemplate = function (url, onload, onerror, templateFilename, asLibrary) {
    var base64 = false;
    var realUrl = url;

    console.log("app.js:3621", url, onload, onerror, templateFilename, asLibrary)
    if (!this.editor.isCorsEnabledForUrl(realUrl)) {
        // 始终使用 base64 响应来检查文件类型的幻数
        var nocache = 't=' + new Date().getTime();
        realUrl = PROXY_URL + '?url=' + encodeURIComponent(url) + '&base64=1&' + nocache;
        base64 = true;
    }

    var filterFn = (templateFilename != null) ? templateFilename : url;

    this.editor.loadUrl(realUrl, mxUtils.bind(this, function (responseData) {
        try {
            var data = (!base64) ? responseData : ((window.atob && !mxClient.IS_IE && !mxClient.IS_IE11) ?
                atob(responseData) : Base64.decode(responseData));
            var isVisioFilename = /(\.v(dx|sdx?))($|\?)/i.test(filterFn) ||
                /(\.vs(x|sx?))($|\?)/i.test(filterFn);

            if (isVisioFilename || this.isVisioData(data)) {
                // 添加文件名以控制转换器代码
                if (!isVisioFilename) {
                    if (asLibrary) {
                        filterFn = this.isRemoteVisioData(data) ? 'raw.vss' : 'raw.vssx';
                    } else {
                        filterFn = this.isRemoteVisioData(data) ? 'raw.vsd' : 'raw.vsdx';
                    }
                }

                this.importVisio(this.base64ToBlob(responseData.substring(responseData.indexOf(',') + 1)), function (xml) {
                    onload(xml);
                }, onerror, filterFn);
            } else if (!this.isOffline() && new XMLHttpRequest().upload && this.isRemoteFileFormat(data, filterFn)) {
                // 通过服务器异步解析
                this.parseFile(new Blob([data], {type: 'application/octet-stream'}), mxUtils.bind(this, function (xhr) {
                    if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status <= 299 &&
                        xhr.responseText.substring(0, 13) == '<mxGraphModel') {
                        onload(xhr.responseText);
                    }
                }), url);
            } else if (this.isLucidChartData(data)) {
                this.convertLucidChart(data, mxUtils.bind(this, function (xml) {
                    onload(xml);
                }), mxUtils.bind(this, function (e) {
                    onerror(e);
                }));
            } else {
                if (/(\.png)($|\?)/i.test(filterFn) || this.isPngData(data)) {
                    data = this.extractGraphModelFromPng(responseData);
                }

                onload(data);
            }
        } catch (e) {
            onerror(e);
        }
    }), onerror, /(\.png)($|\?)/i.test(filterFn) || /(\.v(dx|sdx?))($|\?)/i.test(filterFn) ||
        /(\.vs(x|sx?))($|\?)/i.test(filterFn), null, null, base64);
};

/**
 * 获取对等模式
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.getPeerForMode = function (mode) {
    if (mode == App.MODE_GOOGLE) {
        return this.drive;
    } else if (mode == App.MODE_GITHUB) {
        return this.gitHub;
    } else if (mode == App.MODE_GITLAB) {
        return this.gitLab;
    } else if (mode == App.MODE_DROPBOX) {
        return this.dropbox;
    } else if (mode == App.MODE_ONEDRIVE) {
        return this.oneDrive;
    } else if (mode == App.MODE_TRELLO) {
        return this.trello;
    } else {
        return null;
    }
};

/**
 * 创建文件
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.createFile = function (title, data, libs, mode, done, replace, folderId, tempFile, clibs) {
    mode = (tempFile) ? null : ((mode != null) ? mode : this.mode);

    if (title != null && this.spinner.spin(document.body, mxResources.get('inserting'))) {
        data = (data != null) ? data : this.emptyDiagramXml;

        var complete = mxUtils.bind(this, function () {
            this.spinner.stop();
        });

        var error = mxUtils.bind(this, function (resp) {
            complete();

            if (resp == null && this.getCurrentFile() == null && this.dialog == null) {
                this.showSplash();
            } else if (resp != null) {
                this.handleError(resp);
            }
        });

        try {
            if (mode == App.MODE_GOOGLE && this.drive != null) {
                if (folderId == null && this.stateArg != null && this.stateArg.folderId != null) {
                    folderId = this.stateArg.folderId;
                }

                this.drive.insertFile(title, data, folderId, mxUtils.bind(this, function (file) {
                    complete();
                    this.fileCreated(file, libs, replace, done, clibs);
                }), error);
            } else if (mode == App.MODE_GITHUB && this.gitHub != null) {
                this.gitHub.insertFile(title, data, mxUtils.bind(this, function (file) {
                    complete();
                    this.fileCreated(file, libs, replace, done, clibs);
                }), error, false, folderId);
            } else if (mode == App.MODE_GITLAB && this.gitLab != null) {
                this.gitLab.insertFile(title, data, mxUtils.bind(this, function (file) {
                    complete();
                    this.fileCreated(file, libs, replace, done, clibs);
                }), error, false, folderId);
            } else if (mode == App.MODE_TRELLO && this.trello != null) {
                this.trello.insertFile(title, data, mxUtils.bind(this, function (file) {
                    complete();
                    this.fileCreated(file, libs, replace, done, clibs);
                }), error, false, folderId);
            } else if (mode == App.MODE_DROPBOX && this.dropbox != null) {
                this.dropbox.insertFile(title, data, mxUtils.bind(this, function (file) {
                    complete();
                    this.fileCreated(file, libs, replace, done, clibs);
                }), error);
            } else if (mode == App.MODE_ONEDRIVE && this.oneDrive != null) {
                this.oneDrive.insertFile(title, data, mxUtils.bind(this, function (file) {
                    complete();
                    this.fileCreated(file, libs, replace, done, clibs);
                }), error, false, folderId);
            } else if (mode == App.MODE_BROWSER) {
                StorageFile.insertFile(this, title, data, mxUtils.bind(this, function (file) {
                    complete();
                    this.fileCreated(file, libs, replace, done, clibs);
                }), error);
            } else if (!tempFile && mode == App.MODE_DEVICE && 'showSaveFilePicker' in window && !EditorUi.isElectronApp) {
                console.log("App.prototype.createFile")
                complete();

                this.showSaveFilePicker(mxUtils.bind(this, function (fileHandle, desc) {
                    var file = new LocalFile(this, data, desc.name, null, fileHandle, desc);

                    file.saveFile(desc.name, false, mxUtils.bind(this, function () {
                        this.fileCreated(file, libs, replace, done, clibs);
                    }), error, true);
                }), mxUtils.bind(this, function (e) {
                    if (e.name != 'AbortError') {
                        error(e);
                    }
                }), this.createFileSystemOptions(title));
            } else {
                complete();
                this.fileCreated(new LocalFile(this, data, title, mode == null), libs, replace, done, clibs);
            }
        } catch (e) {
            complete();
            this.handleError(e);
        }
    }
};

/**
 * 已创建文件
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.fileCreated = function (file, libs, replace, done, clibs) {
    var url = window.location.pathname;

    if (libs != null && libs.length > 0) {
        url += '?libs=' + libs;
    }

    if (clibs != null && clibs.length > 0) {
        url += '?clibs=' + clibs;
    }

    url = this.getUrl(url);

    // 始终为本地文件打开一个新选项卡，以免丢失更改
    if (file.getMode() != App.MODE_DEVICE) {
        url += '#' + file.getHash();
    }

    // 确保通过需要的 createFileData 生成与最终文件一致的输出
    // 再次保存文件，因为它需要新创建的文件 ID 用于在 HTML 中重定向
    if (this.spinner.spin(document.body, mxResources.get('inserting'))) {
        var data = file.getData();
        var dataNode = (data.length > 0) ? this.editor.extractGraphModel(
            mxUtils.parseXml(data).documentElement, true) : null;
        var redirect = window.location.protocol + '//' + window.location.hostname + url;
        var node = dataNode;
        var graph = null;

        // 处理 SVG 文件需要保存渲染图的特殊情况
        if (dataNode != null && /\.svg$/i.test(file.getTitle())) {
            graph = this.createTemporaryGraph(this.editor.graph.getStylesheet());
            document.body.appendChild(graph.container);
            node = this.decodeNodeIntoGraph(node, graph);
        }

        file.setData(this.createFileData(dataNode, graph, file, redirect));

        if (graph != null) {
            graph.container.parentNode.removeChild(graph.container);
        }

        var complete = mxUtils.bind(this, function () {
            this.spinner.stop();
        });

        var fn = mxUtils.bind(this, function () {
            complete();

            var currentFile = this.getCurrentFile();

            if (replace == null && currentFile != null) {
                replace = !currentFile.isModified() && currentFile.getMode() == null;
            }

            var fn3 = mxUtils.bind(this, function () {
                window.openFile = null;
                this.fileLoaded(file);

                if (replace) {
                    file.addAllSavedStatus();
                }

                if (libs != null) {
                    this.sidebar.showEntries(libs);
                }

                if (clibs != null) {
                    var temp = [];
                    var tokens = clibs.split(';');

                    for (var i = 0; i < tokens.length; i++) {
                        temp.push(decodeURIComponent(tokens[i]));
                    }

                    this.loadLibraries(temp);
                }
            });

            var fn2 = mxUtils.bind(this, function () {
                if (replace || currentFile == null || !currentFile.isModified()) {
                    fn3();
                } else {
                    this.confirm(mxResources.get('allChangesLost'), null, fn3,
                        mxResources.get('cancel'), mxResources.get('discardChanges'));
                }
            });

            if (done != null) {
                done();
            }

            // 在新窗口中打开文件
            if (replace != null && !replace) {
                // 在新窗口中打开本地文件
                if (file.constructor == LocalFile) {
                    window.openFile = new OpenFile(function () {
                        window.openFile = null;
                    });

                    window.openFile.setData(file.getData(), file.getTitle(), file.getMode() == null);
                }

                if (done != null) {
                    done();
                }

                window.openWindow(url, null, fn2);
            } else {
                fn2();
            }
        });

        // 为本地文件更新内存中的数据
        if (file.constructor == LocalFile) {
            fn();
        } else {
            file.saveFile(file.getTitle(), false, mxUtils.bind(this, function () {
                fn();
            }), mxUtils.bind(this, function (resp) {
                complete();
                this.handleError(resp);
            }));
        }
    }
};

/**
 * 文件加载
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.loadFile = function (id, sameWindow, file, success, force) {
    if (urlParams['openInSameWin'] == '1') {
        sameWindow = true;
    }

    this.hideDialog();

    var fn2 = mxUtils.bind(this, function () {
        if (id == null || id.length == 0) {
            this.editor.setStatus('');
            this.fileLoaded(null);
        } else if (this.spinner.spin(document.body, mxResources.get('loading'))) {
            // 处理来自 本地存储 的文件
            if (id.charAt(0) == 'L') {
                this.spinner.stop();

                if (!isLocalStorage) {
                    //服务不可用或被阻止
                    this.handleError({message: mxResources.get('serviceUnavailableOrBlocked')}, mxResources.get('errorLoadingFile'), mxUtils.bind(this, function () {
                        var tempFile = this.getCurrentFile();
                        window.location.hash = (tempFile != null) ? tempFile.getHash() : '';
                    }));
                } else {
                    var error = mxUtils.bind(this, function (e) {
                        this.handleError(e, mxResources.get('errorLoadingFile'), mxUtils.bind(this, function () {
                            var tempFile = this.getCurrentFile();
                            window.location.hash = (tempFile != null) ? tempFile.getHash() : '';
                        }));
                    });

                    id = decodeURIComponent(id.substring(1));

                    StorageFile.getFileContent(this, id, mxUtils.bind(this, function (data) {
                        if (data != null) {
                            this.fileLoaded(new StorageFile(this, data, id));

                            if (success != null) {
                                success();
                            }
                        } else {
                            error({message: mxResources.get('fileNotFound')});
                        }
                    }), error);
                }
            } else if (file != null) {
                // 文件已加载
                this.spinner.stop();
                this.fileLoaded(file);

                if (success != null) {
                    success();
                }
            } else if (id.charAt(0) == 'S') {
                this.spinner.stop();

                this.alert('[弃用] #S 不再支持, go to https://www.draw.io/?desc=' + id.substring(1).substring(0, 10) + '...', mxUtils.bind(this, function () {
                    window.location.href = 'https://www.draw.io/?desc=' + id.substring(1);
                }));
            } else if (id.charAt(0) == 'R') {
                // 编码为 URL 的原始文件
                this.spinner.stop();
                var data = decodeURIComponent(id.substring(1));

                if (data.charAt(0) != '<') {
                    data = Graph.decompress(data);
                }

                var tempFile = new LocalFile(this, data, (urlParams['title'] != null) ?
                    decodeURIComponent(urlParams['title']) : this.defaultFilename, true);
                tempFile.getHash = function () {
                    return id;
                };
                this.fileLoaded(tempFile);

                if (success != null) {
                    success();
                }
            } else if (id.charAt(0) == 'E') // 嵌入文件
            {
                //服务不可用或被阻止
                var currentFile = this.getCurrentFile();

                if (currentFile == null) {
                    this.handleError({message: mxResources.get('serviceUnavailableOrBlocked')}, mxResources.get('errorLoadingFile'));
                } else {
                    this.remoteInvoke('getDraftFileContent', null, null, mxUtils.bind(this, function (data, desc) {
                        this.spinner.stop();
                        this.fileLoaded(new EmbedFile(this, data, desc));

                        if (success != null) {
                            success();
                        }
                    }), mxUtils.bind(this, function () {
                        this.handleError({message: mxResources.get('serviceUnavailableOrBlocked')}, mxResources.get('errorLoadingFile'));
                    }));
                }
            } else if (id.charAt(0) == 'U') {
                var url = decodeURIComponent(id.substring(1));

                var doFallback = mxUtils.bind(this, function () {
                    // 非公开 Google Drive 文件的后备
                    if (url.substring(0, 31) == 'https://drive.google.com/uc?id=' &&
                        (this.drive != null || typeof window.DriveClient === 'function')) {
                        this.hideDialog();

                        var fallback = mxUtils.bind(this, function () {
                            this.spinner.stop();

                            if (this.drive != null) {
                                var tempId = url.substring(31, url.lastIndexOf('&ex'));

                                this.loadFile('G' + tempId, sameWindow, null, mxUtils.bind(this, function () {
                                    var currentFile = this.getCurrentFile();

                                    if (currentFile != null && this.editor.chromeless && !this.editor.editable) {
                                        currentFile.getHash = function () {
                                            return 'G' + tempId;
                                        };

                                        window.location.hash = '#' + currentFile.getHash();
                                    }

                                    if (success != null) {
                                        success();
                                    }
                                }));

                                return true;
                            } else {
                                return false;
                            }
                        });

                        if (!fallback() && this.spinner.spin(document.body, mxResources.get('loading'))) {
                            this.addListener('clientLoaded', fallback);
                        }

                        return true;
                    } else {
                        return false;
                    }
                });

                this.loadTemplate(url, mxUtils.bind(this, function (text) {
                    this.spinner.stop();

                    if (text != null && text.length > 0) {
                        var filename = this.defaultFilename;

                        // 尝试从具有有效扩展名的 URL 中查找名称
                        if (urlParams['title'] == null && urlParams['notitle'] != '1') {
                            var tmp = url;
                            var dot = url.lastIndexOf('.');
                            var slash = tmp.lastIndexOf('/');

                            if (dot > slash && slash > 0) {
                                tmp = tmp.substring(slash + 1, dot);
                                var ext = url.substring(dot);

                                if (!this.useCanvasForExport && ext == '.png') {
                                    ext = '.drawio';
                                }

                                if (ext === '.svg' || ext === '.xml' ||
                                    ext === '.html' || ext === '.png' ||
                                    ext === '.drawio') {
                                    filename = tmp + ext;
                                }
                            }
                        }

                        var tempFile = new LocalFile(this, text, (urlParams['title'] != null) ?
                            decodeURIComponent(urlParams['title']) : filename, true);
                        tempFile.getHash = function () {
                            return id;
                        };

                        if (this.fileLoaded(tempFile, true)) {
                            if (success != null) {
                                success();
                            }
                        } else if (!doFallback()) {
                            this.handleError({message: mxResources.get('fileNotFound')},
                                mxResources.get('errorLoadingFile'));
                        }
                    } else if (!doFallback()) {
                        this.handleError({message: mxResources.get('fileNotFound')},
                            mxResources.get('errorLoadingFile'));
                    }
                }), mxUtils.bind(this, function () {
                    if (!doFallback()) {
                        this.spinner.stop();
                        this.handleError({message: mxResources.get('fileNotFound')},
                            mxResources.get('errorLoadingFile'));
                    }
                }), (urlParams['template-filename'] != null) ?
                    decodeURIComponent(urlParams['template-filename']) : null);
            } else {
                // Google Drive 文件作为默认文件类型处理
                var peer = null;

                if (id.charAt(0) == 'G') {
                    peer = this.drive;
                } else if (id.charAt(0) == 'D') {
                    peer = this.dropbox;
                } else if (id.charAt(0) == 'W') {
                    peer = this.oneDrive;
                } else if (id.charAt(0) == 'H') {
                    peer = this.gitHub;
                } else if (id.charAt(0) == 'A') {
                    peer = this.gitLab;
                } else if (id.charAt(0) == 'T') {
                    peer = this.trello;
                }

                if (peer == null) {
                    this.handleError({message: mxResources.get('serviceUnavailableOrBlocked')}, mxResources.get('errorLoadingFile'), mxUtils.bind(this, function () {
                        var currentFile = this.getCurrentFile();
                        window.location.hash = (currentFile != null) ? currentFile.getHash() : '';
                    }));
                } else {
                    var peerChar = id.charAt(0);
                    id = decodeURIComponent(id.substring(1));

                    peer.getFile(id, mxUtils.bind(this, function (file) {
                        this.spinner.stop();
                        this.fileLoaded(file);
                        var currentFile = this.getCurrentFile();

                        if (currentFile == null) {
                            window.location.hash = '';
                            this.showSplash();
                        } else if (this.editor.chromeless && !this.editor.editable) {
                            // 即使在 chromeless 模式下为转换文件保留 ID，以便刷新工作
                            currentFile.getHash = function () {
                                return peerChar + id;
                            };

                            window.location.hash = '#' + currentFile.getHash();
                        } else if (file == currentFile && file.getMode() == null) {
                            // 如果打开的副本发生这种情况，则显示警告
                            // 例如。对于 IE 中的 .png 文件，因为它们不能被写入
                            var status = mxResources.get('copyCreated');
                            this.editor.setStatus('<div title="' + status + '" class="geStatusAlert" style="overflow:hidden;">' + status + '</div>');
                        }

                        if (success != null) {
                            success();
                        }
                    }), mxUtils.bind(this, function (resp) {
                        // 确保文件不会保存无效的 UI 模型并覆盖任何重要的内容
                        if (window.console != null && resp != null) {
                            console.log('error in loadFile:', id, resp);
                        }

                        this.handleError(resp, (resp != null) ? mxResources.get('errorLoadingFile') : null, mxUtils.bind(this, function () {
                            var currentFile = this.getCurrentFile();

                            if (currentFile == null) {
                                window.location.hash = '';
                                this.showSplash();
                            } else {
                                window.location.hash = '#' + currentFile.getHash();
                            }
                        }), null, null, '#' + peerChar + id);
                    }));
                }
            }
        }
    });

    var currentFile = this.getCurrentFile();

    var fn = mxUtils.bind(this, function () {
        if (force || currentFile == null || !currentFile.isModified()) {
            fn2();
        } else {
            this.confirm(mxResources.get('allChangesLost'), mxUtils.bind(this, function () {
                if (currentFile != null) {
                    window.location.hash = currentFile.getHash();
                }
            }), fn2, mxResources.get('cancel'), mxResources.get('discardChanges'));
        }
    });

    if (id == null || id.length == 0) {
        fn();
    } else if (currentFile != null && !sameWindow) {
        this.showDialog(new PopupDialog(this, this.getUrl() + '#' + id,
            null, fn).container, 320, 140, true, true);
    } else {
        fn();
    }
};

/**
 * 获取库存储提示
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.getLibraryStorageHint = function (file) {
    var tip = file.getTitle();

    if (file.constructor != LocalLibrary) {
        tip += '\n' + file.getHash();
    }

    // if (file.constructor == DriveLibrary) {
    //     tip += ' (' + mxResources.get('googleDrive') + ')';
    // } else if (file.constructor == GitHubLibrary) {
    //     tip += ' (' + mxResources.get('github') + ')';
    // } else if (file.constructor == TrelloLibrary) {
    //     tip += ' (' + mxResources.get('trello') + ')';
    // } else if (file.constructor == DropboxLibrary) {
    //     tip += ' (' + mxResources.get('dropbox') + ')';
    // } else if (file.constructor == OneDriveLibrary) {
    //     tip += ' (' + mxResources.get('oneDrive') + ')';
    // } else
        if (file.constructor == StorageLibrary) {
        tip += ' (' + mxResources.get('browser') + ')';
    } else if (file.constructor == LocalLibrary) {
        tip += ' (' + mxResources.get('device') + ')';
    }

    return tip;
};

/**
 * 根据选择更新操作状态。
 */
App.prototype.restoreLibraries = function () {
    this.loadLibraries(mxSettings.getCustomLibraries(), mxUtils.bind(this, function () {
        this.loadLibraries((urlParams['clibs'] || '').split(';'));
    }));
};

/**
 * 根据选择更新操作状态。加载库
 */
App.prototype.loadLibraries = function (libs, done) {
    if (this.sidebar != null) {
        if (this.pendingLibraries == null) {
            this.pendingLibraries = new Object();
        }

        // 下次忽略这个库
        var ignore = mxUtils.bind(this, function (id, keep) {
            if (!keep) {
                mxSettings.removeCustomLibrary(id);
            }

            delete this.pendingLibraries[id];
        });

        var waiting = 0;
        var files = [];

        // 按 libs 数组的顺序加载
        var checkDone = mxUtils.bind(this, function () {
            if (waiting == 0) {
                if (libs != null) {
                    for (var i = libs.length - 1; i >= 0; i--) {
                        if (files[i] != null) {
                            // console.log("app.js:4294==  init-7", files[i])
                            this.loadLibrary(files[i]);
                        }
                    }
                }

                if (done != null) {
                    done();
                }
            }
        });

        if (libs != null) {
            for (var i = 0; i < libs.length; i++) {
                var name = encodeURIComponent(decodeURIComponent(libs[i]));

                (mxUtils.bind(this, function (id, index) {
                    if (id != null && id.length > 0 && this.pendingLibraries[id] == null &&
                        this.sidebar.palettes[id] == null) {
                        // 等待所有库加载
                        waiting++;

                        var onload = mxUtils.bind(this, function (file) {
                            delete this.pendingLibraries[id];
                            files[index] = file;
                            waiting--;
                            checkDone();
                        });

                        var onerror = mxUtils.bind(this, function (keep) {
                            ignore(id, keep);
                            waiting--;
                            checkDone();
                        });

                        this.pendingLibraries[id] = true;
                        var service = id.substring(0, 1);

                        if (service == 'L') {
                            if (isLocalStorage || mxClient.IS_CHROMEAPP) {
                                // 使异步工作障碍
                                window.setTimeout(mxUtils.bind(this, function () {
                                    try {
                                        var name = decodeURIComponent(id.substring(1));

                                        StorageFile.getFileContent(this, name, mxUtils.bind(this, function (xml) {
                                            if (name == '.scratchpad' && xml == null) {
                                                xml = this.emptyLibraryXml;
                                            }

                                            if (xml != null) {
                                                onload(new StorageLibrary(this, xml, name));
                                            } else {
                                                onerror();
                                            }
                                        }), onerror);
                                    } catch (e) {
                                        onerror();
                                    }
                                }), 0);
                            }
                        } else if (service == 'U') {
                            var url = decodeURIComponent(id.substring(1));

                            if (!this.isOffline()) {
                                this.loadTemplate(url, mxUtils.bind(this, function (text) {
                                    if (text != null && text.length > 0) {
                                        // LATER: Convert mxfile to mxlibrary using code from libraryLoaded
                                        onload(new UrlLibrary(this, text, url));
                                    } else {
                                        onerror();
                                    }
                                }), function () {
                                    onerror();
                                }, null, true);
                            }
                        } else if (service == 'R') {
                            var libDesc = decodeURIComponent(id.substring(1));

                            try {
                                libDesc = JSON.parse(libDesc);
                                var libObj = {
                                    id: libDesc[0],
                                    title: libDesc[1],
                                    downloadUrl: libDesc[2]
                                }

                                this.remoteInvoke('getFileContent', [libObj.downloadUrl], null, mxUtils.bind(this, function (libContent) {
                                    try {
                                        onload(new RemoteLibrary(this, libContent, libObj));
                                    } catch (e) {
                                        onerror();
                                    }
                                }), function () {
                                    onerror();
                                });
                            } catch (e) {
                                onerror();
                            }
                        } else if (service == 'S' && this.loadDesktopLib != null) {
                            try {
                                this.loadDesktopLib(decodeURIComponent(id.substring(1)), function (desktopLib) {
                                    onload(desktopLib);
                                }, onerror);
                            } catch (e) {
                                onerror();
                            }
                        } else {
                            var peer = null;

                            if (service == 'G') {
                                if (this.drive != null && this.drive.user != null) {
                                    peer = this.drive;
                                }
                            } else if (service == 'H') {
                                if (this.gitHub != null && this.gitHub.getUser() != null) {
                                    peer = this.gitHub;
                                }
                            } else if (service == 'T') {
                                if (this.trello != null && this.trello.isAuthorized()) {
                                    peer = this.trello;
                                }
                            } else if (service == 'D') {
                                if (this.dropbox != null && this.dropbox.getUser() != null) {
                                    peer = this.dropbox;
                                }
                            } else if (service == 'W') {
                                if (this.oneDrive != null && this.oneDrive.getUser() != null) {
                                    peer = this.oneDrive;
                                }
                            }

                            if (peer != null) {
                                peer.getLibrary(decodeURIComponent(id.substring(1)), mxUtils.bind(this, function (file) {
                                    try {
                                        onload(file);
                                    } catch (e) {
                                        onerror();
                                    }
                                }), function (resp) {
                                    onerror();
                                });
                            } else {
                                onerror(true);
                            }
                        }
                    }
                }))(name, i);
            }

            checkDone();
        } else {
            checkDone();
        }
    }
};

/**
 * 更新按钮容器
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.updateButtonContainer = function () {

    if (this.buttonContainer != null) {
        var file = this.getCurrentFile();

        // 分享
        if (urlParams['embed'] != '1' &&
            !mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp &&
            !this.isOfflineApp() && file != null) {
            if (this.shareButton == null) {

                // 发布
                this.shareButton = document.createElement('div');
                this.shareButton.className = 'geBtn gePrimaryBtn';
                this.shareButton.style.display = 'inline-block';
                this.shareButton.style.borderRadius = '3px';
                this.shareButton.style.backgroundColor = 'rgb(38 138 255)';
                this.shareButton.style.borderColor = 'rgb(0 117 255)';
                this.shareButton.style.backgroundImage = 'none';
                this.shareButton.style.padding = '2px 10px 0 10px';
                this.shareButton.style.marginTop = '-19px';
                this.shareButton.style.height = '28px';
                this.shareButton.style.lineHeight = '28px';
                this.shareButton.style.minWidth = '0px';
                this.shareButton.style.cssFloat = 'right';
                this.shareButton.setAttribute('title', mxResources.get('issue'));

                if (uiTheme == 'dark') {
                    this.shareButton.style.color = 'black';
                } else {
                    this.shareButton.style.color = 'white';
                }

                mxUtils.write(this.shareButton, mxResources.get('issue'));

                mxEvent.addListener(this.shareButton, 'click', mxUtils.bind(this, function () {
                    console.log("点击发布")
                    this.actions.get('issue').funct();
                }));
                this.buttonContainer.appendChild(this.shareButton);


                // 协作
                this.shareButton = document.createElement('div');
                this.shareButton.className = 'geBtn gePrimaryBtn';
                this.shareButton.style.display = 'inline-block';
                this.shareButton.style.borderRadius = '3px';
                this.shareButton.style.backgroundColor = 'rgb(38 138 255)';
                this.shareButton.style.borderColor = 'rgb(0 117 255)';
                this.shareButton.style.backgroundImage = 'none';
                this.shareButton.style.padding = '2px 10px 0 10px';
                this.shareButton.style.marginTop = '-19px';
                this.shareButton.style.height = '28px';
                this.shareButton.style.lineHeight = '28px';
                this.shareButton.style.minWidth = '0px';
                this.shareButton.style.cssFloat = 'right';
                this.shareButton.style.color = 'white';
                this.shareButton.setAttribute('title', mxResources.get('coordinate'));

                if (uiTheme == 'dark') {
                    this.shareButton.style.color = 'black';
                } else {
                    this.shareButton.style.color = 'white';
                }

                mxUtils.write(this.shareButton, mxResources.get('coordinate'));

                mxEvent.addListener(this.shareButton, 'click', mxUtils.bind(this, function () {
                    console.log("点击协作")
                    this.actions.get('share').funct();
                }));

                this.buttonContainer.appendChild(this.shareButton);

                
                _this = this;
        
                $("#coopSureBut").click(function () {

                    //TODO
                    if ($("#coopName").val() == localStorage.getItem('mobile')) {
                        toastr.error("不可添加自己");
                        return;
                    }
                    var reg = /^\s*$/g;
                    if (reg.test($("#coopName").val())) {
                        return;
                    }
                    App.address_ajax.ajax('', "/file/addCooperate", "post", "json", {
                        md5: LocalFile.prototype.getGrawFid(),
                        phone: $("#coopName").val()
                    }, function (res) {
                        if (res.code == 200) {
                            $(".coopTeam").children("tbody").append("  <tr>\n" +
                                "            <td id='" + res.data + "'>U_" + $("#coopName").val().substr(7) + "</td>\n" +
                                "                            <td></td>\n" +
                                "          <td>协作者<span>&times;&nbsp;&nbsp;</span></td>\n" +
                                "</tr>")
                            $("#coopName").val("")
                            toastr.success(res.msg);
                        } else {
                            toastr.error(res.msg)
                        }
                    })
                })
                $('#tempSureBut').click(function () {
                    EditorUi.prototype.exportImage(1, false, true, false, true,
                        '0', true, false, null, false, 200, null, 'publish_template', _this, function (data_img) {
                           
                            var reg = /^\s*$/g;
                            if (reg.test($("#tempTitle").val())) {
                                toastr.error("标题不可为空");
                                return;
                            }
                            if (data_img == "" || data_img == null || data_img == "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+P///38ACfsD/QVDRcoAAAAASUVORK5CYII=") {
                                toastr.error("绘图不可为空");
                                return;
                            }
                            App.address_ajax.ajax('', "/file/publishTemplate", "post", "json", {
                                    name: localStorage.getItem("uname"),
                                    title: $("#tempTitle").val(),
                                    img: data_img,
                                    frontPath: $("#tempUrl").val(),
                                    summary: $("#tempSum").val(),
                                    fileMd5: LocalFile.prototype.getGrawFid()
                                },
                                function (res) {
                                    if (res.code == 200) {
                                        toastr.success(res.msg);
                                        $("#tempModal").modal("hide");
                                    } else {
                                        toastr.error(res.msg);
                                    }
                                })
                        });
                })
                $('body').on('click', '.coopTeam>tbody>tr span', function () {
                    let that = $(this).parents("tr");
                    App.address_ajax.ajax('', "/file/exitCooperate", "post", "json", {
                        fidMd5: LocalFile.prototype.getGrawFid(),
                        coopTeam: that.children("td")[0].id
                    }, function (res) {
                        if (res.code == 200) {
                            that.remove();
                            toastr.success(res.msg);
                        } else {
                            toastr.error(res.msg)
                        }
                    })
                })

                // 分享
                this.shareButton = document.createElement('div');
                this.shareButton.className = 'geBtn gePrimaryBtn';
                this.shareButton.style.display = 'inline-block';
                this.shareButton.style.borderRadius = '3px';
                this.shareButton.style.backgroundColor = 'rgb(38 138 255)';
                this.shareButton.style.borderColor = 'rgb(0 117 255)';
                this.shareButton.style.backgroundImage = 'none';
                this.shareButton.style.padding = '2px 10px 0 10px';
                this.shareButton.style.marginTop = '-19px';
                this.shareButton.style.height = '28px';
                this.shareButton.style.lineHeight = '28px';
                this.shareButton.style.minWidth = '0px';
                this.shareButton.style.cssFloat = 'right';
                this.shareButton.style.color = 'white';
                this.shareButton.setAttribute('title', mxResources.get('coordinate'));

                if (uiTheme == 'dark') {
                    this.shareButton.style.color = 'black';
                } else {
                    this.shareButton.style.color = 'white';
                }

                mxUtils.write(this.shareButton, mxResources.get('shareDrawing'));

                mxEvent.addListener(this.shareButton, 'click', mxUtils.bind(this, function () {
                    console.log("点击分享")
                    this.actions.get('shareDrawing').funct();
                }));

                this.buttonContainer.appendChild(this.shareButton);

                  // 新增图库
                this.addLibraryButton = document.createElement('div');
                this.addLibraryButton.className = 'geBtn gePrimaryBtn';
                this.addLibraryButton.style.display = 'inline-block';
                this.addLibraryButton.style.borderRadius = '3px';
                this.addLibraryButton.style.backgroundColor = 'rgb(38 138 255)';
                this.addLibraryButton.style.borderColor = 'rgb(0 117 255)';
                this.addLibraryButton.style.backgroundImage = 'none';
                this.addLibraryButton.style.padding = '2px 10px 0 10px';
                this.addLibraryButton.style.marginTop = '-19px';
                this.addLibraryButton.style.height = '28px';
                this.addLibraryButton.style.lineHeight = '28px';
                this.addLibraryButton.style.minWidth = '0px';
                this.addLibraryButton.style.cssFloat = 'right';
                this.addLibraryButton.style.color = 'white';
                this.addLibraryButton.setAttribute('title', mxResources.get('newLibrary'));

                if (uiTheme == 'dark') {
                    this.addLibraryButton.style.color = 'black';
                } else {
                    this.addLibraryButton.style.color = 'white';
                }

                mxUtils.write(this.addLibraryButton, mxResources.get('newLibrary'));

                mxEvent.addListener(this.addLibraryButton, 'click', mxUtils.bind(this, function () {
                    console.log("点击新增图库");
                    this.addLibrary();
                }));

                this.buttonContainer.appendChild(this.addLibraryButton);
            }
        } else if (this.shareButton != null) {
            this.shareButton.parentNode.removeChild(this.shareButton);
            this.shareButton = null;
        }
    }
};
// 实现新增图库的具体逻辑
App.prototype.addLibrary = function () {
    // 显示对话框
    $('.geDialog').hide();
    // 绑定取消按钮的点击事件
    $('#btnCancel').off('click').on('click', function () {
        $('.geDialog').hide();
    });

};
/**
 * 获取并显示通知
 * @param target
 */
App.prototype.fetchAndShowNotification = function (target) {
    target = target || 'online';
};
/**
 * 显示通知
 * @param notifs
 * @param lsReadFlag
 */
App.prototype.showNotification = function (notifs, lsReadFlag) {
    function shouldAnimate(newNotif) {
        var countEl = document.querySelector('.geNotification-count');
        countEl.innerHTML = newNotif;
        countEl.style.display = newNotif == 0 ? 'none' : '';
        var notifBell = document.querySelector('.geNotification-bell');
        notifBell.style.animation = newNotif == 0 ? 'none' : '';
        notifBell.className = 'geNotification-bell' + (newNotif == 0 ? ' geNotification-bellOff' : '');
        document.querySelector('.geBell-rad').style.animation = newNotif == 0 ? 'none' : '';
    }

    var markAllAsRead = mxUtils.bind(this, function () {
        this.notificationWin.style.display = 'none';
        var unread = this.notificationWin.querySelectorAll('.circle.active');

        for (var i = 0; i < unread.length; i++) {
            unread[i].className = 'circle';
        }

        if (notifs[0]) {
            localStorage.setItem(lsReadFlag, notifs[0].timestamp);
        }
    });

    if (this.notificationBtn == null) {
        this.notificationBtn = document.createElement('div');
        this.notificationBtn.className = 'geNotification-box';
        this.notificationBtn.innerHTML = '<span class="geNotification-count"></span>' +
            '<div class="geNotification-bell">' +
            '<span class="geBell-top"></span>' +
            '<span class="geBell-middle"></span>' +
            '<span class="geBell-bottom"></span>' +
            '<span class="geBell-rad"></span>' +
            '</div>';
        //添加为第一个孩子，使其成为最左边的
        this.buttonContainer.insertBefore(this.notificationBtn, this.buttonContainer.firstChild);

        this.notificationWin = document.createElement('div');
        this.notificationWin.className = 'geNotifPanel';
        this.notificationWin.style.display = 'none';
        document.body.appendChild(this.notificationWin);
        this.notificationWin.innerHTML = '<div class="header">' +
            '    <div class="menu-icon">' +
            '        <div class="dash-top"></div>' +
            '        <div class="dash-bottom"></div>' +
            '        <div class="circle"></div>' +
            '    </div>' +
            '    <span class="title">' + mxResources.get('notifications') + '</span>' +
            '    <span id="geNotifClose" class="closeBtn">x</span>' +
            '</div>' +
            '<div class="notifications clearfix">' +
            '	<div id="geNotifList"  style="position: relative"></div>' +
            '</div>';

        mxEvent.addListener(this.notificationBtn, 'click', mxUtils.bind(this, function () {
            if (this.notificationWin.style.display == 'none') {
                this.notificationWin.style.display = '';
                document.querySelector('.notifications').scrollTop = 0;
                var r = this.notificationBtn.getBoundingClientRect();
                this.notificationWin.style.top = (r.top + this.notificationBtn.clientHeight) + 'px';
                this.notificationWin.style.left = (r.right - this.notificationWin.clientWidth) + 'px';
                shouldAnimate(0); //打开通知后停止动画
            } else {
                markAllAsRead();
            }
        }));

        mxEvent.addListener(document.getElementById('geNotifClose'), 'click', markAllAsRead);
    }

    var newNotif = 0;
    var notifListEl = document.getElementById('geNotifList');

    if (notifs.length == 0) {
        notifListEl.innerHTML = '<div class="line"></div><div class="notification">' +
            mxUtils.htmlEntities(mxResources.get('none')) + '</div>';
    } else {
        notifListEl.innerHTML = '<div class="line"></div>';

        for (var i = 0; i < notifs.length; i++) {
            (function (editorUi, notif) {
                if (notif.isNew) {
                    newNotif++;
                }

                var notifEl = document.createElement('div');
                notifEl.className = 'notification';
                var ts = new Date(notif.timestamp);
                var str = editorUi.timeSince(ts);

                if (str == null) {
                    str = mxResources.get('lessThanAMinute');
                }

                notifEl.innerHTML = '<div class="circle' + (notif.isNew ? ' active' : '') + '"></div><span class="time">' +
                    mxUtils.htmlEntities(mxResources.get('timeAgo', [str], '{1} ago')) + '</span>' +
                    '<p>' + mxUtils.htmlEntities(notif.content) + '</p>';
                if (notif.link) {
                    mxEvent.addListener(notifEl, 'click', function () {
                        window.open(notif.link, 'notifWin');
                    });
                }

                notifListEl.appendChild(notifEl);
            })(this, notifs[i]);
        }
    }

    shouldAnimate(newNotif);
};

/**
 * 按给定向量平移此点。   保存文件设置
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
App.prototype.save = function (name, done) {
    // console.log("保存文件:App.prototype.save")
    var file = this.getCurrentFile();

    if (file != null && this.spinner.spin(document.body, mxResources.get('saving'))) {

        this.editor.setStatus('');

        if (this.editor.graph.isEditing()) {
            this.editor.graph.stopEditing();
        }

        var success = mxUtils.bind(this, function () {
            file.handleFileSuccess(true);

            if (done != null) {
                done();
            }
        });

        var error = mxUtils.bind(this, function (err) {
            if (file.isModified()) {
                Editor.addRetryToError(err, mxUtils.bind(this, function () {
                    this.save(name, done);
                }));
            }

            file.handleFileError(err, true);
        });

        try {
            // console.log("file.save=", name, file.getTitle())
            if (name == file.getTitle()) {
                // console.log("走保存")
                //保存
                file.save(true, success, error);
            } else {
                // console.log("不走另存为")
                //另存为
                file.saveAs(name, success, error)
            }
        } catch (err) {
            error(err);
        }
    }
};

/**
 * 如果模式不支持文件夹或不为空，则使用空调用回调
 * 如果为支持它的模式选择了有效的文件夹。无回调
 * 如果没有为支持它的模式选择文件夹，则会生成。
 * 选择文件夹
 */
App.prototype.pickFolder = function (mode, fn, enabled, direct, force) {
    enabled = (enabled != null) ? enabled : true;
    var resume = this.spinner.pause();

    if (enabled && mode == App.MODE_GOOGLE && this.drive != null) {
        // 显示保存对话框
        this.drive.pickFolder(mxUtils.bind(this, function (evt) {
            resume();

            if (evt.action == google.picker.Action.PICKED) {
                var folderId = null;

                if (evt.docs != null && evt.docs.length > 0 && evt.docs[0].type == 'folder') {
                    folderId = evt.docs[0].id;
                }

                fn(folderId);
            }
        }), force);
    } else if (enabled && mode == App.MODE_ONEDRIVE && this.oneDrive != null) {
        this.oneDrive.pickFolder(mxUtils.bind(this, function (files) {
            var folderId = null;
            resume();

            if (files != null && files.value != null && files.value.length > 0) {
                folderId = OneDriveFile.prototype.getIdOf(files.value[0]);
                fn(folderId);
            }
        }), direct);
    } else if (enabled && mode == App.MODE_GITHUB && this.gitHub != null) {
        this.gitHub.pickFolder(mxUtils.bind(this, function (folderPath) {
            resume();
            fn(folderPath);
        }));
    } else if (enabled && mode == App.MODE_GITLAB && this.gitLab != null) {
        this.gitLab.pickFolder(mxUtils.bind(this, function (folderPath) {
            resume();
            fn(folderPath);
        }));
    } else if (enabled && mode == App.MODE_TRELLO && this.trello != null) {
        this.trello.pickFolder(mxUtils.bind(this, function (cardId) {
            resume();
            fn(cardId);
        }));
    } else {
        EditorUi.prototype.pickFolder.apply(this, arguments);
    }
};

/**
 * 导出文件
 */
App.prototype.exportFile = function (data, filename, mimeType, base64Encoded, mode, folderId) {
    if (mode == App.MODE_DROPBOX) {
        if (this.dropbox != null && this.spinner.spin(document.body, mxResources.get('saving'))) {
            // LATER: Add folder picker
            this.dropbox.insertFile(filename, (base64Encoded) ? this.base64ToBlob(data, mimeType) :
                data, mxUtils.bind(this, function () {
                this.spinner.stop();
            }), mxUtils.bind(this, function (resp) {
                this.spinner.stop();
                this.handleError(resp);
            }));
        }
    } else if (mode == App.MODE_GOOGLE) {
        if (this.drive != null && this.spinner.spin(document.body, mxResources.get('saving'))) {
            this.drive.insertFile(filename, data, folderId, mxUtils.bind(this, function (resp) {
                // TODO: 为可点击状态消息添加带有 url 参数的回调
                // "文件导出。单击此处打开文件夹。"
//				this.editor.setStatus('<div class="geStatusMessage" style="cursor:pointer;">' +
//					mxResources.get('saved') + '</div>');
//
//				// Installs click handler for opening
//				if (this.statusContainer != null)
//				{
//					var links = this.statusContainer.getElementsByTagName('div');
//
//					if (links.length > 0)
//					{
//						mxEvent.addListener(links[0], 'click', mxUtils.bind(this, function()
//						{
//							if (resp != null && resp.id != null)
//							{
//								window.open('https://drive.google.com/open?id=' + resp.id);
//							}
//						}));
//					}
//				}

                this.spinner.stop();
            }), mxUtils.bind(this, function (resp) {
                this.spinner.stop();
                this.handleError(resp);
            }), mimeType, base64Encoded);
        }
    } else if (mode == App.MODE_ONEDRIVE) {
        if (this.oneDrive != null && this.spinner.spin(document.body, mxResources.get('saving'))) {
            // KNOWN: OneDrive does not show .svg extension
            this.oneDrive.insertFile(filename, (base64Encoded) ? this.base64ToBlob(data, mimeType) :
                data, mxUtils.bind(this, function () {
                this.spinner.stop();
            }), mxUtils.bind(this, function (resp) {
                this.spinner.stop();
                this.handleError(resp);
            }), false, folderId);
        }
    } else if (mode == App.MODE_GITHUB) {
        if (this.gitHub != null && this.spinner.spin(document.body, mxResources.get('saving'))) {
            // Must insert file as library to force the file to be written
            this.gitHub.insertFile(filename, data, mxUtils.bind(this, function () {
                this.spinner.stop();
            }), mxUtils.bind(this, function (resp) {
                this.spinner.stop();
                this.handleError(resp);
            }), true, folderId, base64Encoded);
        }
    } else if (mode == App.MODE_TRELLO) {
        if (this.trello != null && this.spinner.spin(document.body, mxResources.get('saving'))) {
            this.trello.insertFile(filename, (base64Encoded) ? this.base64ToBlob(data, mimeType) :
                data, mxUtils.bind(this, function () {
                this.spinner.stop();
            }), mxUtils.bind(this, function (resp) {
                this.spinner.stop();
                this.handleError(resp);
            }), false, folderId);
        }
    } else if (mode == App.MODE_BROWSER) {
        var fn = mxUtils.bind(this, function () {
            localStorage.setItem(filename, data);
        });

        if (localStorage.getItem(filename) == null) {
            fn();
        } else {
            this.confirm(mxResources.get('replaceIt', [filename]), fn);
        }
    }
};

/**
 * 描述符已更改
 */
App.prototype.descriptorChanged = function () {
    //获取当前文件
    var file = this.getCurrentFile();

    if (file != null) {
        if (this.fname != null) {
            this.fnameWrapper.style.display = 'block';
            this.fname.innerHTML = '';
            var filename = (file.getTitle() != null) ? file.getTitle() : this.defaultFilename;
            mxUtils.write(this.fname, filename);
            this.fname.setAttribute('title', filename + ' - ' + mxResources.get('rename'));
        }

        var graph = this.editor.graph;
        var editable = file.isEditable() && !file.invalidChecksum;

        if (graph.isEnabled() && !editable) {
            graph.reset();
        }

        graph.setEnabled(editable);

        // 忽略修订的标题和哈希
        if (urlParams['rev'] == null) {
            this.updateDocumentTitle();
            var newHash = file.getHash();

            if (newHash.length > 0) {
                window.location.hash = newHash;
            } else if (window.location.hash.length > 0) {
                window.location.hash = '';
            }
        }
    }

    this.updateUi();

    if (this.format != null && this.editor.graph.isSelectionEmpty()) {
        this.format.refresh();
    }
};

/**
 * 添加用于自动保存本地更改图表的侦听器。
 */
App.prototype.showAuthDialog = function (peer, showRememberOption, fn, closeFn) {
    var resume = this.spinner.pause();

    this.showDialog(new AuthDialog(this, peer, showRememberOption, mxUtils.bind(this, function (remember) {
        try {
            if (fn != null) {
                fn(remember, mxUtils.bind(this, function () {
                    this.hideDialog();
                    resume();
                }));
            }
        } catch (e) {
            this.editor.setStatus(mxUtils.htmlEntities(e.message));
        }
    })).container, 300, (showRememberOption) ? 180 : 140, true, true, mxUtils.bind(this, function (cancel) {
        if (closeFn != null) {
            closeFn(cancel);
        }

        if (cancel && this.getCurrentFile() == null && this.dialog == null) {
            this.showSplash();
        }
    }));
};

/**
 * 检查客户端是否被授权并调用下一步。可选的
 * readXml 参数用于导入。默认为假。可选的
 * readLibrary 参数用于读取库。默认为假。
 * 转换文件
 */
App.prototype.convertFile = function (url, filename, mimeType, extension, success, error, executeRequest, headers) {
    var name = filename;

    // SVG 文件扩展名有效并且需要用于图像导入
    if (!/\.svg$/i.test(name)) {
        name = name.substring(0, filename.lastIndexOf('.')) + extension;
    }

    var gitHubUrl = false;

    if (this.gitHub != null && url.substring(0, this.gitHub.baseUrl.length) == this.gitHub.baseUrl) {
        gitHubUrl = true;
    }

    // VSD(X) 和 VDX 文件错误二进制响应的解决方法
    if (/\.v(dx|sdx?)$/i.test(filename) && Graph.fileSupport && new XMLHttpRequest().upload &&
        typeof new XMLHttpRequest().responseType === 'string') {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);

        if (!gitHubUrl) {
            req.responseType = 'blob';
        }

        if (headers) {
            for (var key in headers) {
                req.setRequestHeader(key, headers[key]);
            }
        }

        req.onload = mxUtils.bind(this, function () {
            if (req.status >= 200 && req.status <= 299) {
                var blob = null;

                if (gitHubUrl) {
                    var file = JSON.parse(req.responseText);
                    blob = this.base64ToBlob(file.content, 'application/octet-stream');
                } else {
                    blob = new Blob([req.response], {type: 'application/octet-stream'});
                }

                this.importVisio(blob, mxUtils.bind(this, function (xml) {
                    success(new LocalFile(this, xml, name, true));
                }), error, filename)
            } else if (error != null) {
                error({message: mxResources.get('errorLoadingFile')});
            }
        });

        req.onerror = error;
        req.send();
    } else {
        var handleData = mxUtils.bind(this, function (data) {
            try {
                if (/\.pdf$/i.test(filename)) {
                    var temp = Editor.extractGraphModelFromPdf(data);

                    if (temp != null && temp.length > 0) {
                        success(new LocalFile(this, temp, name, true));
                    }
                } else if (/\.png$/i.test(filename)) {
                    var temp = this.extractGraphModelFromPng(data);

                    if (temp != null) {
                        success(new LocalFile(this, temp, name, true));
                    } else {
                        success(new LocalFile(this, data, filename, true));
                    }
                } else if (Graph.fileSupport && new XMLHttpRequest().upload && this.isRemoteFileFormat(data, url)) {
                    this.parseFile(new Blob([data], {type: 'application/octet-stream'}), mxUtils.bind(this, function (xhr) {
                        if (xhr.readyState == 4) {
                            if (xhr.status >= 200 && xhr.status <= 299) {
                                success(new LocalFile(this, xhr.responseText, name, true));
                            } else if (error != null) {
                                error({message: mxResources.get('errorLoadingFile')});
                            }
                        }
                    }), filename);
                } else {
                    success(new LocalFile(this, data, name, true));
                }
            } catch (e) {
                if (error != null) {
                    error(e);
                }
            }
        });

        var binary = /\.png$/i.test(filename) || /\.jpe?g$/i.test(filename) ||
            /\.pdf$/i.test(filename) || (mimeType != null &&
                mimeType.substring(0, 6) == 'image/');

        // 注意：不能通过 loadUrl 强制非二进制请求，所以需要分开
        // 对二进制数据内容进行两次解码的代码不起作用
        if (gitHubUrl) {
            mxUtils.get(url, mxUtils.bind(this, function (req) {
                if (req.getStatus() >= 200 && req.getStatus() <= 299) {
                    if (success != null) {
                        var file = JSON.parse(req.getText());
                        var data = file.content;

                        if (file.encoding === 'base64') {
                            if (/\.png$/i.test(filename)) {
                                data = 'data:image/png;base64,' + data;
                            } else if (/\.pdf$/i.test(filename)) {
                                data = 'data:application/pdf;base64,' + data;
                            } else {
                                // Workaround for character encoding issues in IE10/11
                                data = (window.atob && !mxClient.IS_IE && !mxClient.IS_IE11) ? atob(data) : Base64.decode(data);
                            }
                        }

                        handleData(data);
                    }
                } else if (error != null) {
                    error({code: App.ERROR_UNKNOWN});
                }
            }), function () {
                if (error != null) {
                    error({code: App.ERROR_UNKNOWN});
                }
            }, false, this.timeout, function () {
                if (error != null) {
                    error({code: App.ERROR_TIMEOUT, retry: fn});
                }
            }, headers);
        } else if (executeRequest != null) {
            executeRequest(url, handleData, error, binary);
        } else {
            this.editor.loadUrl(url, handleData, error, binary, null, null, null, headers);
        }
    }
};

/**
 * 添加侦听器以自动保存图以进行本地更改。
 */
App.prototype.updateHeader = function () {
    if (this.menubar != null) {
        this.appIcon = document.createElement('a');
        this.appIcon.style.display = 'block';
        this.appIcon.style.position = 'absolute';
        this.appIcon.style.width = '32px';
        this.appIcon.style.height = (this.menubarHeight - 31) + 'px';
        this.appIcon.style.margin = '16px 0px 8px 16px';
        this.appIcon.style.opacity = '0.85';
        this.appIcon.style.borderRadius = '3px';
        if (uiTheme != 'dark') {
            this.appIcon.style.backgroundColor = '#ffffff';
            var logo = 'url(\'' + IMAGE_PATH + '/rollback.png\')';
        } else {
            this.appIcon.style.backgroundColor = '#2a2a2a';
            var logo = 'url(\'' + IMAGE_PATH + '/rollback-writer.png\')';
        }

        mxEvent.disableContextMenu(this.appIcon);

        mxEvent.addListener(this.appIcon, 'click', mxUtils.bind(this, function () {
            window.location.replace(MyFile);
        }));

        // LATER: 在IE6中使用Alpha图像加载器
        // NOTE: 这使用了旧徽标的图表位，因为在这种情况下看起来更好
        //this.appIcon.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=' + IMAGE_PATH + '/logo-white.png,sizingMethod=\'scale\')';

        this.appIcon.style.backgroundImage = logo;
        this.appIcon.style.backgroundPosition = 'center center';
        this.appIcon.style.backgroundSize = '90% 90%';
        this.appIcon.style.backgroundRepeat = 'no-repeat';

        mxUtils.setPrefixedStyle(this.appIcon.style, 'transition', 'all 125ms linear');

        mxEvent.addListener(this.appIcon, 'mouseover', mxUtils.bind(this, function () {
            var file = this.getCurrentFile();

            if (file != null) {
                if (uiTheme != 'dark') {
                    this.appIcon.style.backgroundImage = 'url(' + IMAGE_PATH + '/J@FU_4WG25FH`GMZ2)DDF%H.png)';
                    this.appIcon.style.backgroundSize = '80% 80%';
                } else {
                    this.appIcon.style.backgroundImage = 'url(' + IMAGE_PATH + '/rollback-writer.png)';
                    this.appIcon.style.backgroundSize = '80% 80%';
                }

            }
        }));

        mxEvent.addListener(this.appIcon, 'mouseout', mxUtils.bind(this, function () {
            this.appIcon.style.backgroundImage = logo;
            this.appIcon.style.backgroundSize = '90% 90%';
        }));


        if (urlParams['embed'] != '1') {
            this.menubarContainer.appendChild(this.appIcon);
        }

        this.fnameWrapper = document.createElement('div');
        this.fnameWrapper.style.position = 'absolute';
        this.fnameWrapper.style.right = '453px';
        this.fnameWrapper.style.left = '60px';
        this.fnameWrapper.style.top = '9px';
        this.fnameWrapper.style.height = '26px';
        this.fnameWrapper.style.display = 'none';
        this.fnameWrapper.style.overflow = 'hidden';
        this.fnameWrapper.style.textOverflow = 'ellipsis';

        this.fname = document.createElement('a');
        this.fname.setAttribute('title', mxResources.get('rename'));
        this.fname.className = 'geItem';
        this.fname.style.padding = '2px 8px 2px 8px';
        this.fname.style.display = 'inline';
        this.fname.style.fontSize = '18px';
        this.fname.style.whiteSpace = 'nowrap';

        // Prevents focus
        mxEvent.addListener(this.fname, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
            mxUtils.bind(this, function (evt) {
                evt.preventDefault();
            }));

        mxEvent.addListener(this.fname, 'click', mxUtils.bind(this, function (evt) {
            var file = this.getCurrentFile();

            if (file != null && file.isRenamable()) {
                if (this.editor.graph.isEditing()) {
                    this.editor.graph.stopEditing();
                }

                this.actions.get('rename').funct();
            }

            mxEvent.consume(evt);
        }));

        this.fnameWrapper.appendChild(this.fname);

        if (urlParams['embed'] != '1') {
            this.menubarContainer.appendChild(this.fnameWrapper);

            this.menubar.container.style.position = 'absolute';
            this.menubar.container.style.paddingLeft = '59px';
            this.toolbar.container.style.paddingLeft = '16px';
            this.menubar.container.style.boxSizing = 'border-box';
            this.menubar.container.style.top = '34px';
        }

        /**
         * Adds format panel toggle.
         */
        this.toggleFormatElement = document.createElement('a');
        this.toggleFormatElement.setAttribute('title', mxResources.get('formatPanel') + ' (' + Editor.ctrlKey + '+Shift+P)');
        this.toggleFormatElement.style.position = 'absolute';
        this.toggleFormatElement.style.display = 'inline-block';
        this.toggleFormatElement.style.top = (uiTheme == 'atlas') ? '8px' : '6px';
        this.toggleFormatElement.style.right = (uiTheme != 'atlas' && urlParams['embed'] != '1') ? '30px' : '10px';
        this.toggleFormatElement.style.padding = '2px';
        this.toggleFormatElement.style.fontSize = '14px';
        this.toggleFormatElement.className = (uiTheme != 'atlas') ? 'geButton' : '';
        this.toggleFormatElement.style.width = '16px';
        this.toggleFormatElement.style.height = '16px';
        this.toggleFormatElement.style.backgroundPosition = '50% 50%';
        this.toggleFormatElement.style.backgroundRepeat = 'no-repeat';
        this.toggleFormatElement.style.backgroundSize = '100%';
        this.toolbarContainer.appendChild(this.toggleFormatElement);

        if (uiTheme == 'dark') {
            this.toggleFormatElement.style.filter = 'invert(100%)';
        }

        // Prevents focus
        mxEvent.addListener(this.toggleFormatElement, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
            mxUtils.bind(this, function (evt) {
                evt.preventDefault();
            }));

        mxEvent.addListener(this.toggleFormatElement, 'click', mxUtils.bind(this, function (evt) {
            this.actions.get('formatPanel').funct();
            mxEvent.consume(evt);
        }));

        var toggleFormatPanel = mxUtils.bind(this, function () {
            if (this.formatWidth > 0) {
                this.toggleFormatElement.style.backgroundImage = 'url(\'' + this.formatShowImage + '\')';
            } else {
                this.toggleFormatElement.style.backgroundImage = 'url(\'' + this.formatHideImage + '\')';
            }
        });

        this.addListener('formatWidthChanged', toggleFormatPanel);
        toggleFormatPanel();

        this.fullscreenElement = document.createElement('a');
        this.fullscreenElement.setAttribute('title', mxResources.get('fullscreen'));
        this.fullscreenElement.style.position = 'absolute';
        this.fullscreenElement.style.display = 'inline-block';
        this.fullscreenElement.style.top = (uiTheme == 'atlas') ? '8px' : '6px';
        this.fullscreenElement.style.right = (uiTheme != 'atlas' && urlParams['embed'] != '1') ? '50px' : '30px';
        this.fullscreenElement.style.padding = '2px';
        this.fullscreenElement.style.fontSize = '14px';
        this.fullscreenElement.className = (uiTheme != 'atlas') ? 'geButton' : '';
        this.fullscreenElement.style.width = '16px';
        this.fullscreenElement.style.height = '16px';
        this.fullscreenElement.style.backgroundPosition = '50% 50%';
        this.fullscreenElement.style.backgroundRepeat = 'no-repeat';
        this.fullscreenElement.style.backgroundImage = 'url(\'' + this.fullscreenImage + '\')';
        this.toolbarContainer.appendChild(this.fullscreenElement);

        // 妨碍注意力
        mxEvent.addListener(this.fullscreenElement, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
            mxUtils.bind(this, function (evt) {
                evt.preventDefault();
            }));

        // Atlas 主题中的一些样式更改
        if (uiTheme == 'atlas') {
            mxUtils.setOpacity(this.toggleFormatElement, 70);
            mxUtils.setOpacity(this.fullscreenElement, 70);
        }

        var initialPosition = this.hsplitPosition;

        if (uiTheme == 'dark') {
            this.fullscreenElement.style.filter = 'invert(100%)';
        }

        mxEvent.addListener(this.fullscreenElement, 'click', mxUtils.bind(this, function (evt) {
            var visible = this.fullscreenMode;

            if (uiTheme != 'atlas' && urlParams['embed'] != '1') {
                this.toggleCompactMode(visible);
            }

            if (!visible) {
                initialPosition = this.hsplitPosition;
            }

            this.hsplitPosition = (visible) ? initialPosition : 0;
            this.toggleFormatPanel(visible);
            this.fullscreenMode = !visible;
            mxEvent.consume(evt);
        }));

        /**
         * 添加紧凑的 UI 切换。
         */
        if (urlParams['embed'] != '1') {
            this.toggleElement = document.createElement('a');
            this.toggleElement.setAttribute('title', mxResources.get('collapseExpand'));
            this.toggleElement.className = 'geButton';
            this.toggleElement.style.position = 'absolute';
            this.toggleElement.style.display = 'inline-block';
            this.toggleElement.style.width = '16px';
            this.toggleElement.style.height = '16px';
            this.toggleElement.style.color = '#666';
            this.toggleElement.style.top = (uiTheme == 'atlas') ? '8px' : '6px';
            this.toggleElement.style.right = '10px';
            this.toggleElement.style.padding = '2px';
            this.toggleElement.style.fontSize = '14px';
            this.toggleElement.style.textDecoration = 'none';
            this.toggleElement.style.backgroundImage = 'url(\'' + this.chevronUpImage + '\')';

            this.toggleElement.style.backgroundPosition = '50% 50%';
            this.toggleElement.style.backgroundRepeat = 'no-repeat';

            if (uiTheme == 'dark') {
                this.toggleElement.style.filter = 'invert(100%)';
            }

            // 妨碍注意力
            mxEvent.addListener(this.toggleElement, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
                mxUtils.bind(this, function (evt) {
                    evt.preventDefault();
                }));

            // 切换紧凑模式
            mxEvent.addListener(this.toggleElement, 'click', mxUtils.bind(this, function (evt) {
                this.toggleCompactMode();
                mxEvent.consume(evt);
            }));

            if (uiTheme != 'atlas') {
                this.toolbarContainer.appendChild(this.toggleElement);
            }

            // Enable compact mode for small screens except for Firefox where the height is wrong
            if (!mxClient.IS_FF && screen.height <= 740 && typeof this.toggleElement.click !== 'undefined') {
                window.setTimeout(mxUtils.bind(this, function () {
                    this.toggleElement.click();
                }), 0);
            }
        }
    }
};

/**
 * 添加用于自动保存本地更改图表的侦听器。
 */
App.prototype.toggleCompactMode = function (visible) {
    visible = (visible != null) ? visible : this.compactMode;

    if (visible) {
        this.menubar.container.style.position = 'absolute';
        this.menubar.container.style.paddingLeft = '59px';
        this.menubar.container.style.paddingTop = '';
        this.menubar.container.style.paddingBottom = '';
        this.menubar.container.style.top = '34px';
        this.toolbar.container.style.paddingLeft = '16px';
        this.buttonContainer.style.visibility = 'visible';
        this.appIcon.style.display = 'block';
        this.fnameWrapper.style.display = 'block';
        this.fnameWrapper.style.visibility = 'visible';
        this.menubarHeight = App.prototype.menubarHeight;
        this.refresh();
        this.toggleElement.style.backgroundImage = 'url(\'' + this.chevronUpImage + '\')';
    } else {
        this.menubar.container.style.position = 'relative';
        this.menubar.container.style.paddingLeft = '4px';
        this.menubar.container.style.paddingTop = '0px';
        this.menubar.container.style.paddingBottom = '0px';
        this.menubar.container.style.top = '0px';
        this.toolbar.container.style.paddingLeft = '8px';
        this.buttonContainer.style.visibility = 'hidden';
        this.appIcon.style.display = 'none';
        this.fnameWrapper.style.display = 'none';
        this.fnameWrapper.style.visibility = 'hidden';
        this.menubarHeight = EditorUi.prototype.menubarHeight;
        this.refresh();
        this.toggleElement.style.backgroundImage = 'url(\'' + this.chevronDownImage + '\')';
    }

    this.compactMode = !visible;
};

/**
 * 添加用于自动保存本地更改图表的侦听器。
 */
App.prototype.updateUserElement = function () {
    if ((this.drive == null || this.drive.getUser() == null) &&
        (this.oneDrive == null || this.oneDrive.getUser() == null) &&
        (this.dropbox == null || this.dropbox.getUser() == null) &&
        (this.gitHub == null || this.gitHub.getUser() == null) &&
        (this.gitLab == null || this.gitLab.getUser() == null) &&
        (this.trello == null || !this.trello.isAuthorized())) //TODO Trello no user issue
    {
        if (this.userElement != null) {
            this.userElement.parentNode.removeChild(this.userElement);
            this.userElement = null;
        }
    } else {
        if (this.userElement == null) {
            this.userElement = document.createElement('a');
            this.userElement.className = 'geItem';
            this.userElement.style.position = 'absolute';
            this.userElement.style.fontSize = '8pt';
            this.userElement.style.top = (uiTheme == 'atlas') ? '8px' : '2px';
            this.userElement.style.right = '30px';
            this.userElement.style.margin = '4px';
            this.userElement.style.padding = '2px';
            this.userElement.style.paddingRight = '16px';
            this.userElement.style.verticalAlign = 'middle';
            this.userElement.style.backgroundImage = 'url(' + IMAGE_PATH + '/expanded.gif)';
            this.userElement.style.backgroundPosition = '100% 60%';
            this.userElement.style.backgroundRepeat = 'no-repeat';

            this.menubarContainer.appendChild(this.userElement);

            // Prevents focus
            mxEvent.addListener(this.userElement, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
                mxUtils.bind(this, function (evt) {
                    evt.preventDefault();
                }));

            mxEvent.addListener(this.userElement, 'click', mxUtils.bind(this, function (evt) {
                if (this.userPanel == null) {
                    var div = document.createElement('div');
                    div.className = 'geDialog';
                    div.style.position = 'absolute';
                    div.style.top = (this.userElement.clientTop + this.userElement.clientHeight + 6) + 'px';
                    div.style.right = '36px';
                    div.style.padding = '0px';
                    div.style.cursor = 'default';

                    this.userPanel = div;
                }

                if (this.userPanel.parentNode != null) {
                    this.userPanel.parentNode.removeChild(this.userPanel);
                } else {
                    var connected = false;
                    this.userPanel.innerHTML = '';

                    var img = document.createElement('img');

                    img.setAttribute('src', Dialog.prototype.closeImage);
                    img.setAttribute('title', mxResources.get('close'));
                    img.className = 'geDialogClose';
                    img.style.top = '8px';
                    img.style.right = '8px';

                    mxEvent.addListener(img, 'click', mxUtils.bind(this, function () {
                        if (this.userPanel.parentNode != null) {
                            this.userPanel.parentNode.removeChild(this.userPanel);
                        }
                    }));

                    this.userPanel.appendChild(img);

                    if (this.drive != null) {
                        var driveUsers = this.drive.getUsersList();

                        if (driveUsers.length > 0) {
                            // LATER：文件打开时无法更改用户，因为 close 不适用于 new
                            // 凭据并使用 fileLoaded(null) 关闭文件将显示启动对话框。
                            var closeFile = mxUtils.bind(this, function (callback, spinnerMsg) {
                                var file = this.getCurrentFile();

                                if (file != null && file.constructor == DriveFile) {
                                    this.spinner.spin(document.body, spinnerMsg);

//									file.close();
                                    this.fileLoaded(null);

                                    // LATER：使用回调等待缩略图更新
                                    window.setTimeout(mxUtils.bind(this, function () {
                                        this.spinner.stop();
                                        callback();
                                    }), 2000);
                                } else {
                                    callback();
                                }
                            });

                            var createUserRow = mxUtils.bind(this, function (user) {
                                var tr = document.createElement('tr');
                                tr.style.cssText = user.isCurrent ? '' : 'background-color: whitesmoke; cursor: pointer';
                                tr.setAttribute('title', 'User ID: ' + user.id);
                                tr.innerHTML = '<td valign="middle" style="height: 59px;width: 66px;' +
                                    (user.isCurrent ? '' : 'border-top: 1px solid rgb(224, 224, 224);') + '">' +
                                    '<img width="50" height="50" style="margin: 4px 8px 0 8px;border-radius:50%;" src="' +
                                    ((user.pictureUrl != null) ? user.pictureUrl : this.defaultUserPicture) + '"/>' +
                                    '</td><td valign="middle" style="white-space:nowrap;' +
                                    ((user.pictureUrl != null) ? 'padding-top:4px;' : '') +
                                    (user.isCurrent ? '' : 'border-top: 1px solid rgb(224, 224, 224);') +
                                    '">' + mxUtils.htmlEntities(user.displayName) + '<br>' +
                                    '<small style="color:gray;">' + mxUtils.htmlEntities(user.email) +
                                    '</small><div style="margin-top:4px;"><i>' +
                                    mxResources.get('googleDrive') + '</i></div>';

                                if (!user.isCurrent) {
                                    mxEvent.addListener(tr, 'click', mxUtils.bind(this, function (evt) {
                                        closeFile(mxUtils.bind(this, function () {
                                            this.stateArg = null;
                                            this.drive.setUser(user);

                                            this.drive.authorize(true, mxUtils.bind(this, function () {
                                                this.setMode(App.MODE_GOOGLE);
                                                this.hideDialog();
                                                this.showSplash();
                                            }), mxUtils.bind(this, function (resp) {
                                                this.handleError(resp);
                                            }), true); //Remember is true since add account imply keeping that account
                                        }), mxResources.get('closingFile') + '...');

                                        mxEvent.consume(evt);
                                    }));
                                }

                                return tr;
                            });

                            connected = true;

                            var driveUserTable = document.createElement('table');
                            driveUserTable.style.cssText = 'font-size:10pt;padding: 20px 0 0 0;min-width: 300px;border-spacing: 0;';

                            for (var i = 0; i < driveUsers.length; i++) {
                                driveUserTable.appendChild(createUserRow(driveUsers[i]));
                            }

                            this.userPanel.appendChild(driveUserTable);

                            var div = document.createElement('div');
                            div.style.textAlign = 'left';
                            div.style.padding = '8px';
                            div.style.whiteSpace = 'nowrap';
                            div.style.borderTop = '1px solid rgb(224, 224, 224)';

                            var btn = mxUtils.button(mxResources.get('signOut'), mxUtils.bind(this, function () {
                                this.confirm(mxResources.get('areYouSure'), mxUtils.bind(this, function () {
                                    closeFile(mxUtils.bind(this, function () {
                                        this.stateArg = null;
                                        this.drive.logout();
                                        this.setMode(App.MODE_GOOGLE);
                                        this.hideDialog();
                                        this.showSplash();
                                    }), mxResources.get('signOut'));
                                }));
                            }));
                            btn.className = 'geBtn';
                            btn.style.float = 'right';
                            div.appendChild(btn);

                            var btn = mxUtils.button(mxResources.get('addAccount'), mxUtils.bind(this, function () {
                                var authWin = this.drive.createAuthWin();
                                //FIXME This doean't work to set focus back to main window until closing the file is done
                                authWin.blur();
                                window.focus();

                                closeFile(mxUtils.bind(this, function () {
                                    this.stateArg = null;

                                    this.drive.authorize(false, mxUtils.bind(this, function () {
                                        this.setMode(App.MODE_GOOGLE);
                                        this.hideDialog();
                                        this.showSplash();
                                    }), mxUtils.bind(this, function (resp) {
                                        this.handleError(resp);
                                    }), true, authWin); //Remember is true since add account imply keeping that account
                                }), mxResources.get('closingFile') + '...');
                            }));
                            btn.className = 'geBtn';
                            btn.style.margin = '0px';
                            div.appendChild(btn);
                            this.userPanel.appendChild(div);
                        }
                    }

                    var addUser = mxUtils.bind(this, function (user, logo, logout, label) {
                        if (user != null) {
                            if (connected) {
                                this.userPanel.appendChild(document.createElement('hr'));
                            }

                            connected = true;
                            var userTable = document.createElement('table');
                            userTable.style.cssText = 'font-size:10pt;padding:' + (connected ? '10' : '20') + 'px 20px 10px 10px;';

                            userTable.innerHTML += '<tr><td valign="top">' +
                                ((logo != null) ? '<img style="margin-right:6px;" src="' + logo + '" width="40" height="40"/></td>' : '') +
                                '<td valign="middle" style="white-space:nowrap;">' + mxUtils.htmlEntities(user.displayName) +
                                ((user.email != null) ? '<br><small style="color:gray;">' + mxUtils.htmlEntities(user.email) + '</small>' : '') +
                                ((label != null) ? '<div style="margin-top:4px;"><i>' + mxUtils.htmlEntities(label) + '</i></div>' : '') +
                                '</td></tr>';

                            this.userPanel.appendChild(userTable);
                            var div = document.createElement('div');
                            div.style.textAlign = 'center';
                            div.style.paddingBottom = '12px';
                            div.style.whiteSpace = 'nowrap';

                            if (logout != null) {
                                var btn = mxUtils.button(mxResources.get('signOut'), logout);
                                btn.className = 'geBtn';
                                div.appendChild(btn);
                            }

                            this.userPanel.appendChild(div);
                        }
                    });

                    if (this.dropbox != null) {
                        addUser(this.dropbox.getUser(), IMAGE_PATH + '/dropbox-logo.svg', mxUtils.bind(this, function () {
                            var file = this.getCurrentFile();

                            if (file != null && file.constructor == DropboxFile) {
                                var doLogout = mxUtils.bind(this, function () {
                                    this.dropbox.logout();
                                    window.location.hash = '';
                                });

                                if (!file.isModified()) {
                                    doLogout();
                                } else {
                                    this.confirm(mxResources.get('allChangesLost'), null, doLogout,
                                        mxResources.get('cancel'), mxResources.get('discardChanges'));
                                }
                            } else {
                                this.dropbox.logout();
                            }
                        }), mxResources.get('dropbox'));
                    }

                    if (this.oneDrive != null) {
                        addUser(this.oneDrive.getUser(), IMAGE_PATH + '/onedrive-logo.svg', this.oneDrive.noLogout ? null : mxUtils.bind(this, function () {
                            var file = this.getCurrentFile();

                            if (file != null && file.constructor == OneDriveFile) {
                                var doLogout = mxUtils.bind(this, function () {
                                    this.oneDrive.logout();
                                    window.location.hash = '';
                                });

                                if (!file.isModified()) {
                                    doLogout();
                                } else {
                                    this.confirm(mxResources.get('allChangesLost'), null, doLogout,
                                        mxResources.get('cancel'), mxResources.get('discardChanges'));
                                }
                            } else {
                                this.oneDrive.logout();
                            }
                        }), mxResources.get('oneDrive'));
                    }

                    if (this.gitHub != null) {
                        addUser(this.gitHub.getUser(), IMAGE_PATH + '/github-logo.svg', mxUtils.bind(this, function () {
                            var file = this.getCurrentFile();

                            if (file != null && file.constructor == GitHubFile) {
                                var doLogout = mxUtils.bind(this, function () {
                                    this.gitHub.logout();
                                    window.location.hash = '';
                                });

                                if (!file.isModified()) {
                                    doLogout();
                                } else {
                                    this.confirm(mxResources.get('allChangesLost'), null, doLogout,
                                        mxResources.get('cancel'), mxResources.get('discardChanges'));
                                }
                            } else {
                                this.gitHub.logout();
                            }
                        }), mxResources.get('github'));
                    }

                    if (this.gitLab != null) {
                        addUser(this.gitLab.getUser(), IMAGE_PATH + '/gitlab-logo.svg', mxUtils.bind(this, function () {
                            var file = this.getCurrentFile();

                            if (file != null && file.constructor == GitLabFile) {
                                var doLogout = mxUtils.bind(this, function () {
                                    this.gitLab.logout();
                                    window.location.hash = '';
                                });

                                if (!file.isModified()) {
                                    doLogout();
                                } else {
                                    this.confirm(mxResources.get('allChangesLost'), null, doLogout,
                                        mxResources.get('cancel'), mxResources.get('discardChanges'));
                                }
                            } else {
                                this.gitLab.logout();
                            }
                        }), mxResources.get('gitlab'));
                    }

                    //TODO We have no user info from Trello, how we can create a user?
                    if (this.trello != null) {
                        addUser(this.trello.getUser(), IMAGE_PATH + '/trello-logo.svg', mxUtils.bind(this, function () {
                            var file = this.getCurrentFile();

                            if (file != null && file.constructor == TrelloFile) {
                                var doLogout = mxUtils.bind(this, function () {
                                    this.trello.logout();
                                    window.location.hash = '';
                                });

                                if (!file.isModified()) {
                                    doLogout();
                                } else {
                                    this.confirm(mxResources.get('allChangesLost'), null, doLogout,
                                        mxResources.get('cancel'), mxResources.get('discardChanges'));
                                }
                            } else {
                                this.trello.logout();
                            }
                        }), mxResources.get('trello'));
                    }

                    if (!connected) {
                        var div = document.createElement('div');
                        div.style.textAlign = 'center';
                        div.style.padding = '20px 20px 10px 10px';
                        div.innerHTML = mxResources.get('notConnected');

                        this.userPanel.appendChild(div);
                    }

                    var div = document.createElement('div');
                    div.style.textAlign = 'center';
                    div.style.padding = '12px';
                    div.style.background = 'whiteSmoke';
                    div.style.borderTop = '1px solid #e0e0e0';
                    div.style.whiteSpace = 'nowrap';

                    var btn = mxUtils.button(mxResources.get('close'), mxUtils.bind(this, function () {
                        if (!mxEvent.isConsumed(evt) && this.userPanel != null && this.userPanel.parentNode != null) {
                            this.userPanel.parentNode.removeChild(this.userPanel);
                        }
                    }));
                    btn.className = 'geBtn';
                    div.appendChild(btn);
                    this.userPanel.appendChild(div);

                    document.body.appendChild(this.userPanel);
                }

                mxEvent.consume(evt);
            }));

            mxEvent.addListener(document.body, 'click', mxUtils.bind(this, function (evt) {
                if (!mxEvent.isConsumed(evt) && this.userPanel != null && this.userPanel.parentNode != null) {
                    this.userPanel.parentNode.removeChild(this.userPanel);
                }
            }));
        }

        var user = null;

        if (this.drive != null && this.drive.getUser() != null) {
            user = this.drive.getUser();
        } else if (this.oneDrive != null && this.oneDrive.getUser() != null) {
            user = this.oneDrive.getUser();
        } else if (this.dropbox != null && this.dropbox.getUser() != null) {
            user = this.dropbox.getUser();
        } else if (this.gitHub != null && this.gitHub.getUser() != null) {
            user = this.gitHub.getUser();
        } else if (this.gitLab != null && this.gitLab.getUser() != null) {
            user = this.gitLab.getUser();
        }
        //TODO Trello no user issue

        if (user != null) {
            this.userElement.innerHTML = '';

            if (screen.width > 560) {
                mxUtils.write(this.userElement, user.displayName);
                this.userElement.style.display = 'block';
            }
        } else {
            this.userElement.style.display = 'none';
        }
    }
};

//TODO 使用此函数获取当前登录的用户
// App.prototype.getCurrentUser = function () {
//     var user = null;
//
//     if (this.drive != null && this.drive.getUser() != null) {
//         user = this.drive.getUser();
//     } else if (this.oneDrive != null && this.oneDrive.getUser() != null) {
//         user = this.oneDrive.getUser();
//     } else if (this.dropbox != null && this.dropbox.getUser() != null) {
//         user = this.dropbox.getUser();
//     } else if (this.gitHub != null && this.gitHub.getUser() != null) {
//         user = this.gitHub.getUser();
//     }
//     //TODO Trello no user issue
//
//     return user;
// }
/**
 * 覆盖取决于在缩小查看器中未定义的 mxSettings。
 */
var editorResetGraph = Editor.prototype.resetGraph;
Editor.prototype.resetGraph = function () {
    editorResetGraph.apply(this, arguments);

    // 使用持久值覆盖默认值
    this.graph.pageFormat = mxSettings.getPageFormat();
};
