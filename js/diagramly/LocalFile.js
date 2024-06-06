// $Id = LocalFile.js,v 1.12 2010-01-02 09 =45 =14 gaudenz Exp $
// Copyright (c) 2006-2014, JGraph Ltd
/**
 * 为可选的x和y坐标构造一个新点。如果不
 * 给出坐标，然后使用<x>和<y>的默认值。
 * @constructor
 * @class Implements a basic 2D point. Known subclassers = {@link mxRectangle}.
 * @param {number} x X-coordinate of the point.
 * @param {number} y Y-coordinate of the point.
 */
LocalFile = function (ui, data, title, temp, fileHandle, desc) {
    DrawioFile.call(this, ui, data);

    this.title = title;
    this.mode = (temp) ? null : App.MODE_DEVICE;
    this.fileHandle = fileHandle;
    this.desc = desc;
    this.draw_version = 0;
    this.draw_fId = "";
    this.draw_url = "";

};

//Extends mxEventSource
mxUtils.extend(LocalFile, DrawioFile);

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
LocalFile.prototype.isAutosave = function () {
    return this.fileHandle != null && !this.invalidFileHandle && DrawioFile.prototype.isAutosave.apply(this, arguments);
};

/**
 * Specifies if the autosave checkbox should be shown in the document
 * properties dialog. Default is false.
 */
LocalFile.prototype.isAutosaveOptional = function () {
    return this.fileHandle != null;
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
LocalFile.prototype.getMode = function () {
    return this.mode;
};

LocalFile.prototype.getGrawVersion = function () {
    return this.draw_version
};

LocalFile.prototype.setGrawVersion = function (draw_version) {
    this.draw_version = draw_version;
};

LocalFile.prototype.getGrawFid = function () {
    return this.graw_fId
};

LocalFile.prototype.setGrawFid = function (graw_fId) {
    this.graw_fId = graw_fId;
};

LocalFile.prototype.getGrawUrl = function () {
    return this.graw_url
};

LocalFile.prototype.setGrawUrl = function (graw_url) {
    this.graw_url = graw_url;
};

LocalFile.prototype.setTitle = function (title) {
    // console.log("title", title)
    this.title = title;
};

/**
 * 按给定向量平移此点。
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
LocalFile.prototype.getTitle = function () {
    return this.title;
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
LocalFile.prototype.isRenamable = function () {
    return true;
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
LocalFile.prototype.save = function (revision, success, error) {
    this.saveAs(this.title, success, error);
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
LocalFile.prototype.saveAs = function (title, success, error) {
    this.saveFile(title, false, success, error);
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
LocalFile.prototype.saveAs = function (title, success, error) {
    this.saveFile(title, false, success, error);
};

/**
 * Adds all listeners.
 */
LocalFile.prototype.getDescriptor = function () {
    return this.desc;
};

/**
 * Updates the descriptor of this file with the one from the given file.
 */
LocalFile.prototype.setDescriptor = function (desc) {
    this.desc = desc;
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
LocalFile.prototype.getLatestVersion = function (success, error) {
    if (this.fileHandle == null) {
        success(null);
    } else {
        this.ui.loadFileSystemEntry(this.fileHandle, success, error);
    }
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
LocalFile.prototype.saveFile = function (title, revision, success, error, useCurrentData) {
    // console.log("LocalFile.prototype.saveFile save-1")
    // if (title != this.title) {
    //     this.fileHandle = null;
    //     this.desc = null;
    // }

    this.title = title;

    // 更改文件名后更新数据
    if (!useCurrentData) {
        this.updateFileData();
    }

    var binary = this.ui.useCanvasForExport && /(\.png)$/i.test(this.getTitle());
    this.setShadowModified(false);
    var savedData = this.getData();
    // console.log("保存的数据->"+savedData)

    var done = mxUtils.bind(this, function () {
        this.setModified(this.getShadowModified());
        this.contentChanged();

        if (success != null) {
            success();
        }
    });

    var doSave = mxUtils.bind(this, function (data) {

        if (this.fileHandle != null) {

            //在保存期间设置阴影修改状态
            // if (!this.savingFile) {

            // console.log("1111111111111111111111 savefile")
            this.savingFileTime = new Date();
            this.savingFile = true;

            var errorWrapper = mxUtils.bind(this, function (e) {
                // this.savingFile = false;
                if (error != null) {
                    // 包装错误对象以提供保存状态选项
                    error({error: "保存失败,请刷新"});
                }
            });
            var lastDesc = this.desc;
            that = this;
            var _word = CryptoJS.enc.Utf8.parse(savedData),
                _key = CryptoJS.enc.Utf8.parse(KEY),
                _iv = CryptoJS.enc.Utf8.parse(IV);
            var encrypted = CryptoJS.AES.encrypt(_word, _key, {
                iv: _iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            // if (!(/(\.xml)$/i.test(title) || /(\.drawio)$/i.test(title) || /(\.svg)$/i.test(title) || /(\.html)$/i.test(title) || /(\.png)$/i.test(title))) {
            //     title = title + ".drawio";
            // }

            // console.log(that);
            // var editorUi = new EditorUi();
            //     editorUi.exportToCanvas(mxUtils.bind(this, function (canvas) {
            //         console.log("自制canvas=="+canvas.toDataURL())
            //
            //         }), null, new Object(), null,
            //     null, null, true,
            //     1, false, true,
            //         null, editorUi.editor.graph, "0",
            //     true, false, null, "diagram");
            that = this;
            // console.log("version", this.getGrawVersion())
            // if(typeof this.getGrawVersion()=="undefined"){
            //     console.error("出现错误")
            //     return;
            // }
            // 不更新修改后的标志

            App.address_ajax.ajax('', "/file/saveBvaFlie", "post", "json", {
                "fId": this.getGrawFid(),
                "filename": this.getGrawUrl(),
                "xml": encrypted.toString(),
                'version': this.getGrawVersion()
            }, function (data) {
                that.setGrawVersion(data.datas)
                if (data.resp_code == 200) {
                    that.fileSaved(savedData, lastDesc, done, errorWrapper);
                } else {
                    //弹框  非绘图文件
                    var r = confirm("保存失败,点击确定刷新页面");
                    if (r == true) {
                        window.location.reload();
                    } else {
                        alert("当前绘图状态已失效,请刷新");
                    }

                }
                return;
            })

        } else {

            if (this.ui.isOfflineApp() || this.ui.isLocalFileSave()) {
                // console.log("保存 TODO 多次修改 保存文件/下载")
                this.ui.doSaveLocalFile(data, title, (binary) ?
                    'image/png' : 'text/xml', binary);
            } else {
                if (data.length < MAX_REQUEST_SIZE) {
                    var dot = title.lastIndexOf('.');
                    var format = (dot > 0) ? title.substring(dot + 1) : 'xml';
                    // console.log("name==" + encodeURIComponent(title))
                    // console.log("xml==" + encodeURIComponent(data))
                    // 不更新修改后的标志
                    new mxXmlRequest(SAVE_URL, 'fId=' + this.getGrawFid() + '&format=' + format +
                        '&xml=' + encodeURIComponent(data) +
                        '&filename=' + encodeURIComponent(title) + '&version=' + this.getGrawVersion() +
                        ((binary) ? '&binary=1' : '')).simulate(document, '_blank');
                } else {
                    this.ui.handleError({message: mxResources.get('drawingTooLarge')}, mxResources.get('error'), mxUtils.bind(this, function () {
                        mxUtils.popup(data);
                    }));
                }
            }

            done();
        }
    });

    // console.log("binary==false", binary)

    if (binary) {
        var p = this.ui.getPngFileProperties(this.ui.fileNode);

        this.ui.getEmbeddedPng(mxUtils.bind(this, function (imageData) {
            doSave(imageData);
        }), error, (this.ui.getCurrentFile() != this) ?
            savedData : null, p.scale, p.border);
    } else {
        doSave(savedData);
    }
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
LocalFile.prototype.rename = function (title, success, error) {
    this.title = title;
    this.descriptorChanged();

    if (success != null) {
        success();
    }
};

/**
 * Returns the location as a new object.
 * @type mx.Point
 */
LocalFile.prototype.open = function () {
    this.ui.setFileData(this.getData());
    this.installListeners();
};
