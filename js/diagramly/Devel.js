/*
 * Copyright (c) 2006-2020, JGraph Ltd
 * 
 * 这提供了间接确保 mxClient.js
 * 在加载下面的依赖类之前加载。这
 * 用于JS分开的开发模式
 * 文件和 mxClient.js 加载其他文件。
 */
mxscript(drawDevUrl + 'js/jquery-1.9.1.min.js');
mxscript(drawDevUrl + 'page/js/address.js');
mxscript(drawDevUrl + 'js/cryptojs/aes.min.js');
mxscript(drawDevUrl + 'js/spin/spin.min.js');
mxscript(drawDevUrl + 'js/deflate/pako.min.js');
mxscript(drawDevUrl + 'js/deflate/base64.js');
mxscript(drawDevUrl + 'js/jscolor/jscolor.js');
mxscript(drawDevUrl + 'js/sanitizer/sanitizer.min.js');
mxscript(drawDevUrl + 'js/croppie/croppie.min.js');
mxscript(drawDevUrl + 'js/rough/rough.min.js');

// 使用来自devhost的grapheditor
// 加载自定义右侧图标
mxscript(geBasePath +'/Editor.js');
mxscript(geBasePath +'/EditorUi.js');
// mxscript(geBasePath +'/Sidebar.js');
//js/diagramly/sidebar/Sidebar.js


mxscript(drawDevUrl+"js/diagramly/sidebar/Sidebar.js");
mxscript(drawDevUrl+"js/diagramly/sidebar/animalOrgans.js");
mxscript(drawDevUrl+"js/diagramly/sidebar/medicalEquipment.js");
mxscript(drawDevUrl+"js/diagramly/sidebar/plantOrgans.js");
mxscript(drawDevUrl+"js/diagramly/sidebar/processDiagram.js");
mxscript(drawDevUrl+"js/diagramly/sidebar/molecular.js");
mxscript(drawDevUrl+"js/diagramly/sidebar/prokaryotes.js");
mxscript(drawDevUrl+"js/diagramly/sidebar/protist.js");
mxscript(drawDevUrl+"js/diagramly/sidebar/virus.js");


mxscript(geBasePath +'/Graph.js');
mxscript(geBasePath +'/Format.js');
mxscript(geBasePath +'/Shapes.js');
mxscript(geBasePath +'/Actions.js');
mxscript(geBasePath +'/Menus.js');
mxscript(geBasePath +'/Toolbar.js');
mxscript(geBasePath +'/Dialogs.js');

// 加载主类
mxscript(drawDevUrl + 'js/diagramly/sidebar/Sidebar-main.js');

mxscript(drawDevUrl + 'js/diagramly/util/mxJsCanvas.js');
mxscript(drawDevUrl + 'js/diagramly/util/mxAsyncCanvas.js');

mxscript(drawDevUrl + 'js/diagramly/DrawioFile.js');
mxscript(drawDevUrl + 'js/diagramly/LocalFile.js');
mxscript(drawDevUrl + 'js/diagramly/LocalLibrary.js');
mxscript(drawDevUrl + 'js/diagramly/StorageFile.js');
mxscript(drawDevUrl + 'js/diagramly/StorageLibrary.js');
mxscript(drawDevUrl + 'js/diagramly/RemoteFile.js');
mxscript(drawDevUrl + 'js/diagramly/RemoteLibrary.js');
mxscript(drawDevUrl + 'js/diagramly/EmbedFile.js');
mxscript(drawDevUrl + 'js/diagramly/Dialogs.js');
mxscript(drawDevUrl + 'js/diagramly/Editor.js');
mxscript(drawDevUrl + 'js/diagramly/EditorUi.js');
mxscript(drawDevUrl + 'js/diagramly/DiffSync.js');
mxscript(drawDevUrl + 'js/diagramly/Settings.js');
mxscript(drawDevUrl + 'js/diagramly/DrawioFileSync.js');


// 排除在base.min.js中
mxscript(drawDevUrl + 'js/diagramly/DrawioClient.js');
mxscript(drawDevUrl + 'js/diagramly/DrawioUser.js');
mxscript(drawDevUrl + 'js/diagramly/UrlLibrary.js');
mxscript(drawDevUrl + 'js/diagramly/DriveFile.js');
mxscript(drawDevUrl + 'js/diagramly/DriveLibrary.js');
mxscript(drawDevUrl + 'js/diagramly/DriveClient.js');
mxscript(drawDevUrl + 'js/diagramly/DropboxFile.js');
mxscript(drawDevUrl + 'js/diagramly/DropboxLibrary.js');
mxscript(drawDevUrl + 'js/diagramly/DropboxClient.js');
mxscript(drawDevUrl + 'js/onedrive/mxODPicker.js');


mxscript(drawDevUrl + 'js/diagramly/App.js');
mxscript(drawDevUrl + 'js/diagramly/Menus.js');
mxscript(drawDevUrl + 'js/diagramly/Pages.js');
mxscript(drawDevUrl + 'js/diagramly/Trees.js');
mxscript(drawDevUrl + 'js/diagramly/Minimal.js');
mxscript(drawDevUrl + 'js/diagramly/DistanceGuides.js');
mxscript(drawDevUrl + 'js/diagramly/mxRuler.js');
mxscript(drawDevUrl + 'js/diagramly/mxFreehand.js');
mxscript(drawDevUrl + 'js/diagramly/DevTools.js');

// VSDX / VSSS支持
mxscript(drawDevUrl + 'js/diagramly/vsdx/VsdxExport.js');
mxscript(drawDevUrl + 'js/diagramly/vsdx/mxVsdxCanvas2D.js');
mxscript(drawDevUrl + 'js/diagramly/vsdx/bmpDecoder.js');
mxscript(drawDevUrl + 'js/diagramly/vsdx/importer.js');
mxscript(drawDevUrl + 'js/jszip/jszip.min.js');
mxscript(drawDevUrl + 'bootstrap/js/bootstrap.min.js');
mxscript(drawDevUrl + 'bootstrap/js/toastr.min.js');
mxscript(drawDevUrl + 'js/diagramly/globalSettings.js');
mxscript(drawDevUrl + 'bootstrap/js/sockjs.js');
mxscript(drawDevUrl + 'bootstrap/js/stomp.js');

// GraphMl导入
mxscript(drawDevUrl + 'js/diagramly/graphml/mxGraphMlCodec.js');

// 组织结构图布局
if (urlParams['orgChartDev'] == '1')
{
	mxscript(drawDevUrl + 'js/orgchart/bridge.min.js');
	mxscript(drawDevUrl + 'js/orgchart/bridge.collections.min.js');
	mxscript(drawDevUrl + 'js/orgchart/OrgChart.Layout.min.js');
	mxscript(drawDevUrl + 'js/orgchart/mxOrgChartLayout.js');
}
