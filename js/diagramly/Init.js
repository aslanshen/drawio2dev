/**
 * Copyright (c) 2006-2021, JGraph Ltd
 * Copyright (c) 2006-2021, draw.io AG
 */

// urlParams用于嵌入时为null
window.urlParams = window.urlParams || {};

// isLocalStorage控制对本地存储的访问
window.isLocalStorage = window.isLocalStorage || false;

// 在配置模式下禁用加载设置
window.mxLoadSettings = window.mxLoadSettings || urlParams['configure'] != '1';

// 检查SVG支持
window.isSvgBrowser = true;

// CUSTOM_PARAMETERS-用于保存和导出的URL
window.DRAWIO_BASE_URL = window.DRAWIO_BASE_URL || ((/.*\.draw\.io$/.test(window.location.hostname)) || (/.*\.diagrams\.net$/.test(window.location.hostname)) ?
	window.location.protocol + '//' + window.location.hostname : 'https://app.diagrams.net');
window.DRAWIO_LIGHTBOX_URL = window.DRAWIO_LIGHTBOX_URL || 'https://viewer.diagrams.net';
// window.EXPORT_URL = window.EXPORT_URL || 'https://convert.diagrams.net/node/export';
window.EXPORT_URL = "";
window.PLANT_URL = window.PLANT_URL || 'https://plant-aws.diagrams.net';
window.DRAW_MATH_URL = window.DRAW_MATH_URL || window.DRAWIO_BASE_URL + '/math';
window.VSD_CONVERT_URL = window.VSD_CONVERT_URL || 'https://convert.diagrams.net/VsdConverter/api/converter';
window.EMF_CONVERT_URL = window.EMF_CONVERT_URL || 'https://convert.diagrams.net/emf2png/convertEMF';
window.REALTIME_URL = window.REALTIME_URL || 'cache';
window.DRAWIO_GITLAB_URL = window.DRAWIO_GITLAB_URL || 'https://gitlab.com';
window.DRAWIO_GITLAB_ID = window.DRAWIO_GITLAB_ID || '5cdc018a32acddf6eba37592d9374945241e644b8368af847422d74c8709bc44';
window.SAVE_URL = window.SAVE_URL || 'save';
window.OPEN_URL = window.OPEN_URL || 'import';
window.PROXY_URL = window.PROXY_URL || 'proxy';
window.DRAWIO_VIEWER_URL = window.DRAWIO_VIEWER_URL || null;
window.NOTIFICATIONS_URL = window.NOTIFICATIONS_URL || 'https://www.draw.io/notifications';
window.MyFile = 'http://'+location.host+'/myFile.html';
// mxgraph配置
window.KEY='aefvgyjsgwmhskey';
window.IV='ihawefdefscde_Iv';
window.MXGRAPH_URL="http://"+location.host;
window.MXGRAPH_VIEW_URL=MXGRAPH_URL+"/draw.html";

// 路径和文件
window.SHAPES_PATH = window.SHAPES_PATH || 'shapes';
// 图内图像的路径
window.GRAPH_IMAGE_PATH = window.GRAPH_IMAGE_PATH || 'img';
window.ICONSEARCH_PATH = window.ICONSEARCH_PATH || (((navigator.userAgent != null && navigator.userAgent.indexOf('MSIE') >= 0) ||
	urlParams['dev']) && window.location.protocol != 'file:' ? 'iconSearch' : window.DRAWIO_BASE_URL + '/iconSearch');
window.TEMPLATE_PATH = window.TEMPLATE_PATH || 'templates';
window.NEW_DIAGRAM_CATS_PATH = window.NEW_DIAGRAM_CATS_PATH || 'newDiagramCats';
window.PLUGINS_BASE_PATH = window.PLUGINS_BASE_PATH || '';

// i18文件的目录和主i18n文件的基本名称
window.RESOURCES_PATH = window.RESOURCES_PATH || 'resources';
window.RESOURCE_BASE = window.RESOURCE_BASE || RESOURCES_PATH + '/dia';

// 通过变量指定全局配置
window.DRAWIO_CONFIG = window.DRAWIO_CONFIG || null;

//通过网址参数设置基本路径和用户界面语言，并配置
//支持的语言避免404s。所有核心语言的加载
//资源被禁用，因为所有必需的资源都在grapheditor中。
//属性。注意，在这个例子中，加载两个资源
//文件(特殊包和默认包)被禁用
//保存GET请求。这要求所有资源都存在于
//特殊捆绑。
window.mxLoadResources = window.mxLoadResources || false;


window.mxLanguage = window.mxLanguage || (function() 
{
	var lang = urlParams['lang'];

	// 已知问题：IE8中的古怪之处目前没有JSON对象
	if (lang == null && typeof(JSON) != 'undefined')
	{
		// 不能在此处使用mxSettings
		if (isLocalStorage) 
		{
			try
			{
				var value = localStorage.getItem('.drawio-config');
				
				if (value != null)
				{
					lang = JSON.parse(value).language || null;
				}
				
				if (!lang && window.mxIsElectron)
				{
					lang = require('electron').remote.app.getLocale();
					
					if (lang != null)
			    	{
			    		var dash = lang.indexOf('-');
			    		
			    		if (dash >= 0)
			    		{
			    			lang = lang.substring(0, dash);
			    		}
			    		
			    		lang = lang.toLowerCase();
			    	}
				}
			}
			catch (e)
			{
				// Cookie被禁用，尝试使用本地存储会导致
				// Chrome上的DOM错误最少
				isLocalStorage = false;
			}
		}
	}

	if(lang==null){
		lang="zh";
	}

	return lang;
})();

// 在此处添加新语言。首先将条目翻译为 [Automatic]
// 在Diagram.js的菜单定义中。
window.mxLanguageMap = window.mxLanguageMap ||
{
	'zh' : '简体中文'
};

if (typeof window.mxBasePath === 'undefined')
{
	window.mxBasePath = 'mxgraph';
	window.mxImageBasePath = 'mxgraph/images';
}

if (window.mxLanguages == null)
{
	window.mxLanguages = [];
	
	// 填充受支持的特殊语言包的列表
	for (var lang in mxLanguageMap)
	{
		// 空表示默认（即浏览器语言），“ zh”表示英语（不支持的语言的默认值）
		// 由于“ en”不使用扩展名，因此不能将其添加到支持的语言包数组中。
		if (lang != 'en')
		{
			window.mxLanguages.push(lang);
		}
	}
}

// 在查看器域上使用灯箱模式
if (window.location.hostname == DRAWIO_LIGHTBOX_URL.substring(DRAWIO_LIGHTBOX_URL.indexOf('//') + 2))
{
	urlParams['lightbox'] = '1';
}	

// 灯箱可启用无边距模式
if (urlParams['lightbox'] == '1')
{
	urlParams['chrome'] = '0';
}

/**
 * 在运行静态draw.io代码之前返回全局UI设置
 */
window.uiTheme = window.uiTheme || (function() 
{
	var ui = urlParams['ui'];

	// 已知问题：此时在 IE8 的怪癖中没有 JSON 对象
	if (ui == null && isLocalStorage && typeof JSON !== 'undefined' && urlParams['lightbox'] != '1')
	{
		try
		{
			var value = localStorage.getItem('.drawio-config');
			
			if (value != null)
			{
				ui = JSON.parse(value).ui || null;
			}
		}
		catch (e)
		{
			// cookie 被禁用，尝试使用本地存储将导致
// Chrome 上至少出现 DOM 错误
			isLocalStorage = false;
		}
	}
	
	// 在小屏幕上使用最小主题
	// try
	// {
	// 	if (ui == null)
	// 	{
	//         var iw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	//
	//         if (iw <= 768)
	//         {
	//         	ui = 'min';
	//         }
	// 	}
	// }
	// catch (e)
	// {
	// 	// ignore
	// }
	if(ui=='min'||ui=='atlas'){
		var value = localStorage.getItem('.drawio-config');
		if(value!=undefined&&value!=""&&value!=null){
			let jsons = JSON.parse(value);
			jsons["ui"]="kennedy";
			localStorage.setItem('.drawio-config',JSON.stringify(jsons));
		}
		ui='kennedy';

	}
	
	return ui;
})();

/**
 * Global function for loading local files via servlet
 */
function setCurrentXml(data, filename)
{
	if (window.parent != null && window.parent.openFile != null)
	{
		window.parent.openFile.setData(data, filename);
	}
};

/**
 * 通过本地存储覆盖启动 URL 参数
 */
(function() 
{
	// 已知问题：此时在 IE8 中没有 JSON 对象
	if (typeof JSON !== 'undefined')
	{
		// 不能在这里使用 mxSettings
		if (isLocalStorage) 
		{
			try
			{
				var value = localStorage.getItem('.drawio-config');
				var showSplash = true;
				
				if (value != null)
				{
					showSplash = JSON.parse(value).showStartScreen;
				}
				
				// 未定义意味着真
				if (showSplash == false)
				{
					urlParams['splash'] = '0';
				}
			}
			catch (e)
			{
				// ignore
			}
		}
	}
	
	// Customizes export URL
	var ex = urlParams['export'];

	if (ex != null)
	{
		ex = decodeURIComponent(ex);
		
		if (ex.substring(0, 7) != 'http://' &&  ex.substring(0, 8) != 'https://')
		{
			ex = 'http://' + ex;
		}
		
		EXPORT_URL = ex;
	}

	// Customizes gitlab URL
	var glUrl = urlParams['gitlab'];

	if (glUrl != null)
	{
		glUrl = decodeURIComponent(glUrl);
		
		if (glUrl.substring(0, 7) != 'http://' &&  glUrl.substring(0, 8) != 'https://')
		{
			glUrl = 'http://' + glUrl;
		}
		
		DRAWIO_GITLAB_URL = glUrl;
	}
	
	var glId = urlParams['gitlab-id'];

	if (glId != null)
	{
		DRAWIO_GITLAB_ID = glId;
	}

	// URL for logging
	window.DRAWIO_LOG_URL = window.DRAWIO_LOG_URL || '';

	//为 draw.io 域添加硬编码的日志域
	var host = window.location.host;
	
	if (host != 'test.draw.io')
	{
		var searchString = 'diagrams.net';
		var position = host.length - searchString.length;
		var lastIndex = host.lastIndexOf(searchString, position);
		
		if (lastIndex !== -1 && lastIndex === position)
		{
			window.DRAWIO_LOG_URL = 'https://log.diagrams.net';
		}
		else
		{
			// 用于图集集成
			var searchString = 'draw.io';
			var position = host.length - searchString.length;
			var lastIndex = host.lastIndexOf(searchString, position);
			
			if (lastIndex !== -1 && lastIndex === position)
			{
				window.DRAWIO_LOG_URL = 'https://log.draw.io';
			}
		}
	}
})();

// Enables offline mode
if (urlParams['offline'] == '1' || urlParams['demo'] == '1' || 
		urlParams['stealth'] == '1' || urlParams['local'] == '1' || urlParams['lockdown'] == '1')
{
	urlParams['picker'] = '0';
	urlParams['gapi'] = '0';
	urlParams['db'] = '0';
	urlParams['od'] = '0';
	urlParams['gh'] = '0';
	urlParams['gl'] = '0';
	urlParams['tr'] = '0';
}

// 默认禁用 Trello 客户端
if (urlParams['mode'] == 'trello')
{
	urlParams['tr'] = '1';
}

// 在嵌入域上使用嵌入模式
if (window.location.hostname == 'embed.diagrams.net')
{
	urlParams['embed'] = '1';
}	

// 在hash属性不可用的情况下的回退
if ((window.location.hash == null || window.location.hash.length <= 1) &&
	urlParams['open'] != null)
{
	window.location.hash = urlParams['open'];
}
