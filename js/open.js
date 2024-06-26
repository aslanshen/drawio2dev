// 通过准备处理响应来处理表单提交
function handleSubmit()
{
	var form = window.openForm || document.getElementById('openForm');
	
	if (window.parent.openNew && window.parent.baseUrl != null)
	{
		window.parent.openFile.setConsumer(null);
		window.parent.open(window.parent.baseUrl);
	}
	
//注意：文件是通过JS注入方式加载到iframe中的，而iframe又将
//父窗口中的文件内容。新窗口询问其打开器是否有任何文件
//内容可用或等待内容变为可用。
	return true;
};

// 隐藏此对话框
function hideWindow(cancel)
{
	window.parent.openFile.cancel(cancel);
}

function fileChanged()
{
	var supportedText = document.getElementById('openSupported');
	var form = window.openForm || document.getElementById('openForm');
	var openButton = document.getElementById('openButton');
	
	if (form.upfile.value.length > 0)
	{
		openButton.removeAttribute('disabled');
	}
	else
	{
		openButton.setAttribute('disabled', 'disabled');
	}		
}

function main()
{
	if (window.parent != null && window.parent.Editor != null)
	{
		if (window.parent.Editor.useLocalStorage)
		{
			document.body.innerHTML = '';
			var div = document.createElement('div');
			div.style.fontFamily = 'Arial';

			window.parent.listBrowserFiles(function(filesInfo)
			{
				if (filesInfo.length == 0)
				{
					window.parent.mxUtils.write(div, window.parent.mxResources.get('noFiles'));
					div.style.color = (window.parent.uiTheme == 'dark') ? '#cccccc' : '';
					window.parent.mxUtils.br(div);
				}
				else
				{
					// 按文件名（标题）对数组排序
					filesInfo.sort(function (a, b)
					{
					    return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
					});
					
					var table = document.createElement('table');
					var hrow = document.createElement('tr');
					hrow.style.backgroundColor = (window.parent.uiTheme == 'dark') ? '#000' : '#D6D6D6';
					hrow.style.color = (window.parent.uiTheme == 'dark') ? '#cccccc' : '';
					hrow.style.height = '25px';
					hrow.style.textAlign = 'left';
					table.appendChild(hrow);
					var hName = document.createElement('th');
					window.parent.mxUtils.write(hName, window.parent.mxResources.get('name'));
					hrow.appendChild(hName);
					var hModified = document.createElement('th');
					hModified.style.width = '180px';
					window.parent.mxUtils.write(hModified, window.parent.mxResources.get('lastModified'));
					hrow.appendChild(hModified);
					var hSize = document.createElement('th');
					window.parent.mxUtils.write(hSize, window.parent.mxResources.get('size'));
					hSize.style.width = '70px';
					hrow.appendChild(hSize);
					var hCtrl = document.createElement('th');
					hCtrl.style.width = '23px';
					hrow.appendChild(hCtrl);
					table.style.fontSize = '12pt';
					table.style.width = '100%';

					for (var i = 0; i < filesInfo.length; i++)
					{
						var fileInfo = filesInfo[i];
						
						if (fileInfo.title.length > 0)
						{
							var row = document.createElement('tr');
							row.style.color = (window.parent.uiTheme == 'dark') ? '#cccccc' : '';
							table.appendChild(row);
							
							if (i & 1 == 1)
							{
								row.style.backgroundColor = (window.parent.uiTheme == 'dark') ? '#000' : '#E6E6E6';
							}
								
							var nameTd = document.createElement('td');
							row.appendChild(nameTd);
							var link = document.createElement('a');
							link.style.fontDecoration = 'none';
							window.parent.mxUtils.write(link, fileInfo.title);
							link.style.cursor = 'pointer';
							nameTd.appendChild(link);
							
							var modifiedTd = document.createElement('td');
							row.appendChild(modifiedTd);
							var str = window.parent.EditorUi.prototype.timeSince(new Date(fileInfo.lastModified));
							
							if (str == null)
							{
								str = window.parent.mxResources.get('lessThanAMinute');
							}
							
							window.parent.mxUtils.write(modifiedTd, window.parent.mxResources.get('timeAgo', [str]));
							
							var sizeTd = document.createElement('td');
							row.appendChild(sizeTd);
							window.parent.mxUtils.write(sizeTd, window.parent.EditorUi.prototype.formatFileSize(fileInfo.size));
							
							var ctrlTd = document.createElement('td');
							row.appendChild(ctrlTd);
							ctrlTd.style.textAlign = 'center';
							var img = document.createElement('span');
							img.className = 'geSprite geSprite-delete';
							img.style.cursor = 'pointer';
							img.style.display = 'inline-block';
							ctrlTd.appendChild(img);
							
							if (window.parent.uiTheme == 'dark')
							{
								img.style.filter = 'invert(100%)';
							}

							window.parent.mxEvent.addListener(img, 'click', (function(k)
							{
								return function()
								{
									if (window.parent.mxUtils.confirm(window.parent.mxResources.get('delete') + ' "' + k + '"?'))
									{
										window.parent.deleteBrowserFile(k, function()
										{
											window.location.reload();											
										});
									}
								};
							})(fileInfo.title));
		
							window.parent.mxEvent.addListener(link, 'click', (function(k)
							{
								return function()
								{
									if (window.parent.openNew && window.parent.baseUrl != null)
									{
										var of = window.parent.openFile;
										window.parent.openBrowserFile(k, function(data)
										{
											window.parent.openWindow(window.parent.baseUrl + '#L' + encodeURIComponent(k), function()
											{
												of.cancel(false);
											}, function()
											{
												of.setData(data, k);
											});									
										}, function()
										{
											//TODO add error
										});
									}
									else
									{
										window.parent.openBrowserFile(k, function(data)
										{
											window.parent.openFile.setData(data, k);
										}, function()
										{
											//TODO add error
										});
									}
								};
							})(fileInfo.title));
						}
					}
					
					div.appendChild(table);
				}
				
				var closeButton = window.parent.mxUtils.button(window.parent.mxResources.get('close'), function()
				{
					hideWindow(true);
				});
				
				closeButton.className = 'geBtn';
				closeButton.style.position = 'fixed';
				closeButton.style.bottom = '0px';
				closeButton.style.right = '0px';
				div.appendChild(closeButton);
				
				document.body.appendChild(div);
			});
		}
		else
		{
			var editLink = document.getElementById('editLink');
			var openButton = document.getElementById('openButton');
			openButton.value = window.parent.mxResources.get(window.parent.openKey || 'open');
			var closeButton = document.getElementById('closeButton');
			closeButton.value = window.parent.mxResources.get('close');
			var supportedText = document.getElementById('openSupported');
			supportedText.innerHTML = window.parent.mxResources.get('openSupported');
			var form = window.openForm || document.getElementById('openForm');
			form.setAttribute('action', window.parent.OPEN_URL);

			form.onsubmit = function()
			{
				return handleSubmit();
			};
			
			form.upfile.onchange = fileChanged;
			
			closeButton.onclick = function()
			{
				hideWindow(true);
			};
		}
	}
	else
	{
		document.body.innerHTML = 'Missing parent window';
	}
};

window.addEventListener('load', main);
