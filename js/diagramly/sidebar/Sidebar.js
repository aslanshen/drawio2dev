/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 *为给定的编辑器构造一个新的侧边栏。
 */
 function Sidebar(editorUi, container) {
	this.editorUi = editorUi;
	this.container = container;
	this.palettes = new Object();
	this.taglist = new Object();
	this.showTooltips = true;
	this.graph = editorUi.createTemporaryGraph(this.editorUi.editor.graph.getStylesheet());
	this.graph.cellRenderer.minSvgStrokeWidth = this.minThumbStrokeWidth;
	this.graph.cellRenderer.antiAlias = this.thumbAntiAlias;
	this.graph.container.style.visibility = 'hidden';
	this.graph.foldingEnabled = false;

	document.body.appendChild(this.graph.container);

	this.pointerUpHandler = mxUtils.bind(this, function () {
		this.showTooltips = true;
	});

	mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointerup' : 'mouseup', this.pointerUpHandler);

	this.pointerDownHandler = mxUtils.bind(this, function () {
		this.showTooltips = false;
		this.hideTooltip();
	});

	mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown', this.pointerDownHandler);

	this.pointerMoveHandler = mxUtils.bind(this, function (evt) {
		var src = mxEvent.getSource(evt);

		while (src != null) {
			if (src == this.currentElt) {
				return;
			}

			src = src.parentNode;
		}

		this.hideTooltip();
	});

	mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointermove' : 'mousemove', this.pointerMoveHandler);

	//处理鼠标离开窗口 
	this.pointerOutHandler = mxUtils.bind(this, function (evt) {
		if (evt.toElement == null && evt.relatedTarget == null) {
			this.hideTooltip();
		}
	});

	mxEvent.addListener(document, (mxClient.IS_POINTER) ? 'pointerout' : 'mouseout', this.pointerOutHandler);

	//滚动后启用工具提示 
	mxEvent.addListener(container, 'scroll', mxUtils.bind(this, function () {
		this.showTooltips = true;
		this.hideTooltip();
	}));

	this.init();
};

/**
 *将所有调色板添加到侧栏。
 */
Sidebar.prototype.init = function () {
	// stencils
	var dir = STENCIL_PATH;
	// 搜索
	this.addSearchPalette(true);

	//基本样式
	this.addGeneralPalette(false);
	
	this.addStencilPalette('arrows', mxResources.get('arrows'), dir + '/arrows.xml',
			';html=0;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2');
	// this.addUmlPalette(true);
	// this.addBpmnPalette(dir, true);


	//生物图
	this.addanimalOrgansPalette(false);
	this.addmedicalEquipmentPalette(false);
	this.addmolecularPalette(false);
	this.addplantOrgansPalette(false);
	this.addStencilPalette('flowchart', '流程图', dir + '/flowchart.xml',
		';html=0;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2');
	this.addprocessDiagramPalette(false);
	this.addprokaryotesPalette(false);
	this.addprotistPalette(false);
	this.addvirusPalette(false);
};

/**
 *设置默认字体大小。
 */
Sidebar.prototype.collapsedImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/collapsed.gif' : 'data:image/gif;base64,R0lGODlhDQANAIABAJmZmf///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozNUQyRTJFNjZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozNUQyRTJFNzZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFERjc3MEUxNkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFERjc3MEUyNkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEAQAAAQAsAAAAAA0ADQAAAhSMj6lrwAjcC1GyahV+dcZJgeIIFgA7';

/**
 *设置默认字体大小。
 */
Sidebar.prototype.expandedImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/expanded.gif' : 'data:image/gif;base64,R0lGODlhDQANAIABAJmZmf///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxREY3NzBERjZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxREY3NzBFMDZGNUYxMUU1QjZEOThCNDYxMDQ2MzNCQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFERjc3MERENkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFERjc3MERFNkY1RjExRTVCNkQ5OEI0NjEwNDYzM0JCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEAQAAAQAsAAAAAA0ADQAAAhGMj6nL3QAjVHIu6azbvPtWAAA7';

/**
 * 
 */
Sidebar.prototype.searchImage = (!mxClient.IS_SVG) ? IMAGE_PATH + '/search.png' : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAEaSURBVHjabNGxS5VxFIfxz71XaWuQUJCG/gCHhgTD9VpEETg4aMOlQRp0EoezObgcd220KQiXmpretTAHQRBdojlQEJyukPdt+b1ywfvAGc7wnHP4nlZd1yKijQW8xzNc4Su+ZOYfQ3T6/f4YNvEJYzjELXp4VVXVz263+7cR2niBxAFeZ2YPi3iHR/gYERPDwhpOsd6sz8x/mfkNG3iOlWFhFj8y89J9KvzGXER0GuEaD42mgwHqUtoljbcRsTBCeINpfM/MgZLKPpaxFxGbOCqDXmILN7hoJrTKH+axhxmcYRxP0MIDnOBDZv5q1XUNIuJxifJp+UNV7t7BFM6xeic0RMQ4Bpl5W/ol7GISx/eEUUTECrbx+f8A8xhiZht9zsgAAAAASUVORK5CYII=';

/**
 * 
 */
Sidebar.prototype.dragPreviewBorder = '1px dashed black';

/**
 *指定工具提示是否应可见。默认为true。
 */
Sidebar.prototype.enableTooltips = true;

/**
 *指定工具提示的延迟。默认值为16像素。
 */
Sidebar.prototype.tooltipBorder = 16;

/**
 *指定工具提示的延迟。默认值为300毫秒。
 */
Sidebar.prototype.tooltipDelay = 300;

/**
 *指定放置目标图标的延迟。默认值为200毫秒。
 */
Sidebar.prototype.dropTargetDelay = 200;

/**
 *指定齿轮图像的URL。
 */
Sidebar.prototype.gearImage = STENCIL_PATH + '/clipart/Gear_128x128.png';

/**
 *指定缩略图的宽度。
 */
Sidebar.prototype.thumbWidth = 42;

/**
 *指定缩略图的高度。
 */
Sidebar.prototype.thumbHeight = 42;

/**
 *指定缩略图的宽度。
 */
Sidebar.prototype.minThumbStrokeWidth = 1;

/**
 *指定缩略图的宽度。
 */
Sidebar.prototype.thumbAntiAlias = false;

/**
 *指定缩略图的填充。默认值为3。
 */
Sidebar.prototype.thumbPadding = (document.documentMode >= 5) ? 2 : 3;

/**
 *指定工具提示的延迟。默认值为2像素。
 */
Sidebar.prototype.thumbBorder = 2;

/*
 *实验性较小的侧边栏条目
 */
if (urlParams['sidebar-entries'] != 'large') {
	Sidebar.prototype.thumbPadding = (document.documentMode >= 5) ? 0 : 1;
	Sidebar.prototype.thumbBorder = 1;
	Sidebar.prototype.thumbWidth = 32;
	Sidebar.prototype.thumbHeight = 30;
	Sidebar.prototype.minThumbStrokeWidth = 1.3;
	Sidebar.prototype.thumbAntiAlias = true;
}

/**
 *指定侧边栏标题的大小。
 */
Sidebar.prototype.sidebarTitleSize = 9;

/**
 *指定是否应启用侧栏中的标题。
 */
Sidebar.prototype.sidebarTitles = false;

/**
 *指定是否应启用工具提示中的标题。
 */
Sidebar.prototype.tooltipTitles = true;

/**
 *指定是否应启用工具提示中的标题。
 */
Sidebar.prototype.maxTooltipWidth = 400;

/**
 *指定是否应启用工具提示中的标题。
 */
Sidebar.prototype.maxTooltipHeight = 400;

/**
 *指定是否应加载模具文件并将其添加到搜索索引中
 *当添加模板调色板时。如果为假，则模具文件
 显示调色板时，*被延迟加载。
 */
Sidebar.prototype.addStencilsToIndex = true;

/**
 *指定剪贴画图像的宽度。默认值为80。
 */
Sidebar.prototype.defaultImageWidth = 80;

/**
 *指定剪贴画图像的高度。默认值为80。
 */
Sidebar.prototype.defaultImageHeight = 80;

/**
 *将所有调色板添加到侧栏。
 */
Sidebar.prototype.getTooltipOffset = function () {
	return new mxPoint(0, 0);
};

/**
 *将所有调色板添加到侧栏。
 */
Sidebar.prototype.showTooltip = function (elt, cells, w, h, title, showLabel) {
	if (this.enableTooltips && this.showTooltips) {
		if (this.currentElt != elt) {
			if (this.thread != null) {
				window.clearTimeout(this.thread);
				this.thread = null;
			}

			var show = mxUtils.bind(this, function () {
				//延迟创建DOM节点和图实例
				if (this.tooltip == null) {
					this.tooltip = document.createElement('div');
					this.tooltip.className = 'geSidebarTooltip';
					this.tooltip.style.zIndex = mxPopupMenu.prototype.zIndex - 1;
					document.body.appendChild(this.tooltip);

					this.graph2 = new Graph(this.tooltip, null, null, this.editorUi.editor.graph.getStylesheet());
					this.graph2.resetViewOnRootChange = false;
					this.graph2.foldingEnabled = false;
					this.graph2.gridEnabled = false;
					this.graph2.autoScroll = false;
					this.graph2.setTooltips(false);
					this.graph2.setConnectable(false);
					this.graph2.setEnabled(false);

					if (!mxClient.IS_SVG) {
						this.graph2.view.canvas.style.position = 'relative';
					}
				}

				this.graph2.model.clear();
				this.graph2.view.setTranslate(this.tooltipBorder, this.tooltipBorder);

				if (w > this.maxTooltipWidth || h > this.maxTooltipHeight) {
					this.graph2.view.scale = Math.round(Math.min(this.maxTooltipWidth / w, this.maxTooltipHeight / h) * 100) / 100;
				}
				else {
					this.graph2.view.scale = 1;
				}

				this.tooltip.style.display = 'block';
				this.graph2.labelsVisible = (showLabel == null || showLabel);
				var fo = mxClient.NO_FO;
				mxClient.NO_FO = Editor.prototype.originalNoForeignObject;

				//应用当前样式进行预览
				var temp = this.graph2.cloneCells(cells);
				this.editorUi.insertHandler(temp, null, this.graph2.model);
				this.graph2.addCells(temp);

				mxClient.NO_FO = fo;

				var bounds = this.graph2.getGraphBounds();
				var width = bounds.width + 2 * this.tooltipBorder + 4;
				var height = bounds.height + 2 * this.tooltipBorder;

				if (mxClient.IS_QUIRKS) {
					height += 4;
					this.tooltip.style.overflow = 'hidden';
				}
				else {
					this.tooltip.style.overflow = 'visible';
				}

				this.tooltip.style.width = width + 'px';
				var w2 = width;

				//添加条目标题
				if (this.tooltipTitles && title != null && title.length > 0) {
					if (this.tooltipTitle == null) {
						this.tooltipTitle = document.createElement('div');
						this.tooltipTitle.style.borderTop = '1px solid gray';
						this.tooltipTitle.style.textAlign = 'center';
						this.tooltipTitle.style.width = '100%';
						this.tooltipTitle.style.overflow = 'hidden';
						this.tooltipTitle.style.position = 'absolute';
						this.tooltipTitle.style.paddingTop = '6px';
						this.tooltipTitle.style.bottom = '6px';

						this.tooltip.appendChild(this.tooltipTitle);
					}
					else {
						this.tooltipTitle.innerHTML = '';
					}

					this.tooltipTitle.style.display = '';
					mxUtils.write(this.tooltipTitle, title);

					//允许使用更宽的标签
					w2 = Math.min(this.maxTooltipWidth, Math.max(width, this.tooltipTitle.scrollWidth + 4));
					var ddy = this.tooltipTitle.offsetHeight + 10;
					height += ddy;

					if (mxClient.IS_SVG) {
						this.tooltipTitle.style.marginTop = (2 - ddy) + 'px';
					}
					else {
						height -= 6;
						this.tooltipTitle.style.top = (height - ddy) + 'px';
					}
				}
				else if (this.tooltipTitle != null && this.tooltipTitle.parentNode != null) {
					this.tooltipTitle.style.display = 'none';
				}

				//如果标签较宽则更新宽度
				if (w2 > width) {
					this.tooltip.style.width = w2 + 'px';
				}

				this.tooltip.style.height = height + 'px';
				var x0 = -Math.round(bounds.x - this.tooltipBorder) +
					((w2 > width) ? (w2 - width) / 2 : 0);
				var y0 = -Math.round(bounds.y - this.tooltipBorder);

				var b = document.body;
				var d = document.documentElement;
				var off = this.getTooltipOffset();
				var bottom = Math.max(b.clientHeight || 0, d.clientHeight);
				var left = this.container.clientWidth + this.editorUi.splitSize + 3 + this.editorUi.container.offsetLeft + off.x;
				var top = Math.min(bottom - height - 20 /*status bar*/, Math.max(0, (this.editorUi.container.offsetTop +
					this.container.offsetTop + elt.offsetTop - this.container.scrollTop - height / 2 + 16))) + off.y;

				if (mxClient.IS_SVG) {
					if (x0 != 0 || y0 != 0) {
						this.graph2.view.canvas.setAttribute('transform', 'translate(' + x0 + ',' + y0 + ')');
					}
					else {
						this.graph2.view.canvas.removeAttribute('transform');
					}
				}
				else {
					this.graph2.view.drawPane.style.left = x0 + 'px';
					this.graph2.view.drawPane.style.top = y0 + 'px';
				}

				//IE9中忽略位置CSS样式的解决方法
				//（更改为相对，不带下一行）
				this.tooltip.style.position = 'absolute';
				this.tooltip.style.left = left + 'px';
				this.tooltip.style.top = top + 'px';
			});

			if (this.tooltip != null && this.tooltip.style.display != 'none') {
				show();
			}
			else {
				this.thread = window.setTimeout(show, this.tooltipDelay);
			}

			this.currentElt = elt;
		}
	}
};

/**
 *隐藏当前工具提示。
 */
Sidebar.prototype.hideTooltip = function () {
	if (this.thread != null) {
		window.clearTimeout(this.thread);
		this.thread = null;
	}

	if (this.tooltip != null) {
		this.tooltip.style.display = 'none';
		this.currentElt = null;
	}
};

/**
 * Hides the current tooltip.
 */
Sidebar.prototype.addDataEntry = function (tags, width, height, title, data) {
	return this.addEntry(tags, mxUtils.bind(this, function () {
		return this.createVertexTemplateFromData(data, width, height, title);
	}));
};

/**
 *将给定条目添加到搜索索引中。
 */
Sidebar.prototype.addEntries = function (images) {
	for (var i = 0; i < images.length; i++) {
		(mxUtils.bind(this, function (img) {
			var data = img.data;
			var tags = (img.title != null) ? img.title : '';

			if (img.tags != null) {
				tags += ' ' + img.tags;
			}

			if (data != null && tags.length > 0) {
				this.addEntry(tags, mxUtils.bind(this, function () {
					data = this.editorUi.convertDataUri(data);
					var s = 'shape=image;verticalLabelPosition=bottom;verticalAlign=top;imageAspect=0;';

					if (img.aspect == 'fixed') {
						s += 'aspect=fixed;'
					}

					return this.createVertexTemplate(s + 'image=' +
						data, img.w, img.h, '', img.title || '', false, false, true)
				}));
			}
			else if (img.xml != null && tags.length > 0) {
				this.addEntry(tags, mxUtils.bind(this, function () {
					var cells = this.editorUi.stringToCells(Graph.decompress(img.xml));

					return this.createVertexTemplateFromCells(
						cells, img.w, img.h, img.title || '', true, false, true);
				}));
			}
		}))(images[i]);
	}
};

/**
 * Hides the current tooltip.
 */
Sidebar.prototype.setCurrentSearchEntryLibrary = function (id, lib) {
	this.currentSearchEntryLibrary = (id != null) ? { id: id, lib: lib } : null;
};

/**
 *隐藏当前工具提示。
 */
Sidebar.prototype.addEntry = function (tags, fn) {
	if (this.taglist != null && tags != null && tags.length > 0) {
		if (this.currentSearchEntryLibrary != null) {
			fn.parentLibraries = [this.currentSearchEntryLibrary];
		}

		//替换特殊字符 
		var tmp = tags.toLowerCase().replace(/[\/\,\(\)]/g, ' ').split(' ');
		var tagList = [];
		var hash = {};

		//查找唯一标签 
		for (var i = 0; i < tmp.length; i++) {
			if (hash[tmp[i]] == null) {
				hash[tmp[i]] = true;
				tagList.push(tmp[i]);
			}

			//添加带有删除的尾数的其他条目 
			var normalized = tmp[i].replace(/\.*\d*$/, '');

			if (normalized != tmp[i]) {
				if (hash[normalized] == null) {
					hash[normalized] = true;
					tagList.push(normalized);
				}
			}
		}


		for (var i = 0; i < tagList.length; i++) {
		
			this.addEntryForTag(tagList[i], fn);
		}
	}

	return fn;
};

/**
 *隐藏当前工具提示。
 */
Sidebar.prototype.addEntryForTag = function (tag, fn) {
	if (tag != null && tag.length > 1) {
		var entry = this.taglist[tag];

		if (typeof entry !== 'object') {
			entry = { entries: [] };
			this.taglist[tag] = entry;
		}

		entry.entries.push(fn);
	}
};

/**
 *添加形状搜索用户界面。
 */
Sidebar.prototype.searchEntries = function (searchTerms, count, page, success, error) {
	if (this.taglist != null && searchTerms != null) {
		var tmp = searchTerms.toLowerCase().split(' ');
		var dict = new mxDictionary();
		var max = (page + 1) * count;
		var results = [];
		var index = 0;

		for (var i = 0; i < tmp.length; i++) {
			if (tmp[i].length > 0) {
				var entry = this.taglist[tmp[i]];
				var tmpDict = new mxDictionary();

				if (entry != null) {
					var arr = entry.entries;
					results = [];

					for (var j = 0; j < arr.length; j++) {
						var entry = arr[j];

						// NOTE Array does not contain duplicates
						if ((index == 0) == (dict.get(entry) == null)) {
							tmpDict.put(entry, entry);
							results.push(entry);

							if (i == tmp.length - 1 && results.length == max) {
								success(results.slice(page * count, max), max, true, tmp);

								return;
							}
						}
					}
				}
				else {
					results = [];
				}

				dict = tmpDict;
				index++;
			}
		}

		var len = results.length;
		success(results.slice(page * count, (page + 1) * count), len, false, tmp);
	}
	else {
		success([], null, null, tmp);
	}
};

/**
 *添加形状搜索用户界面。
 */ 
Sidebar.prototype.filterTags = function (tags) {
	if (tags != null) {
		var arr = tags.split(' ');
		var result = [];
		var hash = {};

		// Ignores tags with leading numbers, strips trailing numbers
		for (var i = 0; i < arr.length; i++) {
			// Removes duplicates
			if (hash[arr[i]] == null) {
				hash[arr[i]] = '1';
				result.push(arr[i]);
			}
		}

		return result.join(' ');
	}

	return null;
};

/**
 *将常规调色板添加到侧栏。
 */
Sidebar.prototype.cloneCell = function (cell, value) {
	var clone = cell.clone();

	if (value != null) {
		clone.value = value;
	}

	return clone;
};

/**
 *添加形状搜索用户界面。
 */ 
Sidebar.prototype.showPopupMenuForEntry = function (elt, libs, evt) {
	//钩住子类
};

/**
 * Adds shape search UI.
 */
Sidebar.prototype.addSearchPalette = function (expand) {
	var elt = document.createElement('div');
	elt.style.visibility = 'hidden';
	this.container.appendChild(elt);

	var div = document.createElement('div');
	div.className = 'geSidebar';
	div.style.boxSizing = 'border-box';
	div.style.overflow = 'hidden';
	div.style.width = '100%';
	div.style.padding = '8px';
	div.style.paddingTop = '14px';
	div.style.paddingBottom = '0px';

	if (!expand) {
		div.style.display = 'none';
	}

	var inner = document.createElement('div');
	inner.style.whiteSpace = 'nowrap';
	inner.style.textOverflow = 'clip';
	inner.style.paddingBottom = '8px';
	inner.style.cursor = 'default';

	var input = document.createElement('input');
	input.setAttribute('placeholder', mxResources.get('searchShapes'));
	input.setAttribute('type', 'text');
	input.style.fontSize = '12px';
	input.style.overflow = 'hidden';
	input.style.boxSizing = 'border-box';
	input.style.border = 'solid 1px #000';
	input.style.borderRadius = '4px';
	input.style.width = '100%';
	input.style.outline = 'none';
	input.style.padding = '6px';
	input.style.paddingRight = '20px';
	inner.appendChild(input);

	var cross = document.createElement('img');
	cross.setAttribute('src', Sidebar.prototype.searchImage);
	cross.setAttribute('title', mxResources.get('search'));
	cross.style.position = 'relative';
	cross.style.left = '-18px';

	if (mxClient.IS_QUIRKS) {
		input.style.height = '28px';
		cross.style.top = '-4px';
	}
	else {
		cross.style.top = '1px';
	}

	// Needed to block event transparency in IE
	cross.style.background = 'url(\'' + this.editorUi.editor.transparentImage + '\')';

	var find;

	inner.appendChild(cross);
	div.appendChild(inner);

	var center = document.createElement('center');
	var button = mxUtils.button(mxResources.get('moreResults'), function () {
		find();
	});
	button.style.display = 'none';

	// Workaround for inherited line-height in quirks mode
	button.style.lineHeight = 'normal';
	button.style.fontSize = '12px';
	button.style.padding = '6px 12px 6px 12px';
	button.style.marginTop = '4px';
	button.style.marginBottom = '8px';
	center.style.paddingTop = '4px';
	center.style.paddingBottom = '4px';

	center.appendChild(button);
	div.appendChild(center);

	var searchTerm = '';
	var active = false;
	var complete = false;
	var page = 0;
	var hash = new Object();

	// Count is dynamically updated below
	var count = 12;

	var clearDiv = mxUtils.bind(this, function () {
		active = false;
		this.currentSearch = null;
		var child = div.firstChild;

		while (child != null) {
			var next = child.nextSibling;

			if (child != inner && child != center) {
				child.parentNode.removeChild(child);
			}

			child = next;
		}
	});

	mxEvent.addListener(cross, 'click', function () {
		if (cross.getAttribute('src') == Dialog.prototype.closeImage) {
			cross.setAttribute('src', Sidebar.prototype.searchImage);
			cross.setAttribute('title', mxResources.get('search'));
			button.style.display = 'none';
			input.value = '';
			searchTerm = '';
			clearDiv();
		}

		input.focus();
	});

	find = mxUtils.bind(this, function () {
		// Shows 4 rows (minimum 4 results)
		count = 4 * Math.max(1, Math.floor(this.container.clientWidth / (this.thumbWidth + 10)));
		this.hideTooltip();

		if (input.value != '') {
			if (center.parentNode != null) {
				if (searchTerm != input.value) {
					clearDiv();
					searchTerm = input.value;
					hash = new Object();
					complete = false;
					page = 0;
				}

				if (!active && !complete) {
					button.setAttribute('disabled', 'true');
					button.style.display = '';
					button.style.cursor = 'wait';
					button.innerHTML = mxResources.get('loading') + '...';
					active = true;

					// Ignores old results
					var current = new Object();
					this.currentSearch = current;

					this.searchEntries(searchTerm, count, page, mxUtils.bind(this, function (results, len, more, terms) {
						if (this.currentSearch == current) {
							results = (results != null) ? results : [];
							active = false;
							page++;
							this.insertSearchHint(div, searchTerm, count, page, results, len, more, terms);

							// Allows to repeat the search
							if (results.length == 0 && page == 1) {
								searchTerm = '';
							}

							if (center.parentNode != null) {
								center.parentNode.removeChild(center);
							}

							for (var i = 0; i < results.length; i++) {
								(mxUtils.bind(this, function (result) {
									try {
										var elt = result();

										// Avoids duplicates in results
										if (hash[elt.innerHTML] == null) {
											hash[elt.innerHTML] = (result.parentLibraries != null) ? result.parentLibraries.slice() : [];
											div.appendChild(elt);
										}
										else if (result.parentLibraries != null) {
											hash[elt.innerHTML] = hash[elt.innerHTML].concat(result.parentLibraries);
										}

										mxEvent.addGestureListeners(elt, null, null, mxUtils.bind(this, function (evt) {
											var libs = hash[elt.innerHTML];

											if (mxEvent.isPopupTrigger(evt)) {
												this.showPopupMenuForEntry(elt, libs, evt);
											}
										}));

										// Disables the built-in context menu
										mxEvent.disableContextMenu(elt);
									}
									catch (e) {
										// ignore
									}
								}))(results[i]);
							}

							if (more) {
								button.removeAttribute('disabled');
								button.innerHTML = mxResources.get('moreResults');
							}
							else {
								button.innerHTML = mxResources.get('reset');
								button.style.display = 'none';
								complete = true;
							}

							button.style.cursor = '';
							div.appendChild(center);
						}
					}), mxUtils.bind(this, function () {
						// TODO: Error handling
						button.style.cursor = '';
					}));
				}
			}
		}
		else {
			clearDiv();
			input.value = '';
			searchTerm = '';
			hash = new Object();
			button.style.display = 'none';
			complete = false;
			input.focus();
		}
	});

	mxEvent.addListener(input, 'keydown', mxUtils.bind(this, function (evt) {
		if (evt.keyCode == 13 /* Enter */) {
			find();
			mxEvent.consume(evt);
		}
	}));

	mxEvent.addListener(input, 'keyup', mxUtils.bind(this, function (evt) {
		if (input.value == '') {
			cross.setAttribute('src', Sidebar.prototype.searchImage);
			cross.setAttribute('title', mxResources.get('search'));
		}
		else {
			cross.setAttribute('src', Dialog.prototype.closeImage);
			cross.setAttribute('title', mxResources.get('reset'));
		}

		if (input.value == '') {
			complete = true;
			button.style.display = 'none';
		}
		else if (input.value != searchTerm) {
			button.style.display = 'none';
			complete = false;
		}
		else if (!active) {
			if (complete) {
				button.style.display = 'none';
			}
			else {
				button.style.display = '';
			}
		}
	}));

	// Workaround for blocked text selection in Editor
	mxEvent.addListener(input, 'mousedown', function (evt) {
		if (evt.stopPropagation) {
			evt.stopPropagation();
		}

		evt.cancelBubble = true;
	});

	// Workaround for blocked text selection in Editor
	mxEvent.addListener(input, 'selectstart', function (evt) {
		if (evt.stopPropagation) {
			evt.stopPropagation();
		}

		evt.cancelBubble = true;
	});

	var outer = document.createElement('div');
	outer.appendChild(div);
	this.container.appendChild(outer);

	// Keeps references to the DOM nodes
	this.palettes['search'] = [elt, outer];
};

/**
 *将常规调色板添加到侧栏。
 */
Sidebar.prototype.insertSearchHint = function (div, searchTerm, count, page, results, len, more, terms) {
	if (results.length == 0 && page == 1) {
		var err = document.createElement('div');
		err.className = 'geTitle';
		err.style.cssText = 'background-color:transparent;border-color:transparent;' +
			'color:gray;padding:6px 0px 0px 0px !important;margin:4px 8px 4px 8px;' +
			'text-align:center;cursor:default !important';

		mxUtils.write(err, mxResources.get('noResultsFor', [searchTerm]));
		div.appendChild(err);
	}
};

/**
 * 通用
 */
Sidebar.prototype.addGeneralPalette = function(expand){
	var lineTags = 'line lines connector connectors connection connections arrow arrows ';
	this.setCurrentSearchEntryLibrary("general", "general");
     
	var fns = [
		// style, width, height, value, title, showLabel, showTitle, tags   resizable=0;autosize=1;points=[];
		//
		this.createVertexTemplateEntry('text;html=0;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;rounded=0;',
			50, 30, '文本', '文本'),
		this.addEntry('link hyperlink', mxUtils.bind(this, function()
		{
			var cell = new mxCell('链接', new mxGeometry(0, 0, 60, 40), 'text;html=0;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;fontColor=#0000EE;fontStyle=4;');
			cell.vertex = true;
			this.graph.setLinkForCell(cell, '');

			return this.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, '链接');
		})),
		this.addEntry('timestamp date time text label', mxUtils.bind(this, function()
		{
			var cell = new mxCell('%date{yyyy-mm-dd HH:MM:ss}%', new mxGeometry(0, 0, 160, 20), 'text;html=0;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;overflow=hidden;');
			cell.vertex = true;
			this.graph.setAttributeForCell(cell, 'placeholders', '1');

			return this.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, '时间');
		})),



		this.createVertexTemplateEntry('rounded=0;html=0;', 120, 60, '', '矩形'),
		this.createVertexTemplateEntry('rounded=1;html=0;', 120, 60, '', '圆角矩形'),
		// Explicit strokecolor/fillcolor=none 是保持透明背景的解决方法，无论当前样式如何
		// text;html=0;resizable=0;autosize=1;align=center;verticalAlign=middle;points=[];fillColor=none;strokeColor=none;rounded=0;

		// this.createVertexTemplateEntry('text;html=0;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;overflow=hidden;rounded=0;', 190, 120,
		// 	'<h1>Heading</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
		// 	'Textbox', null, null, 'text textbox textarea'),
		this.createVertexTemplateEntry('ellipse;html=0;', 120, 80, '', '椭圆'),
		this.createVertexTemplateEntry('html=0;aspect=fixed;', 80, 80, '', '正方形'),
		this.createVertexTemplateEntry('ellipse;html=0;aspect=fixed;', 80, 80, '', '圆'),
		this.createVertexTemplateEntry('shape=process;html=0;backgroundOutline=1;', 120, 60, '', '过程'),
		this.createVertexTemplateEntry('rhombus;html=0;', 80, 80, '', '菱形'),
		this.createVertexTemplateEntry('shape=parallelogram;perimeter=parallelogramPerimeter;html=0;fixedSize=1;', 120, 60, '', '平行四边形'),
		this.createVertexTemplateEntry('shape=hexagon;perimeter=hexagonPerimeter2;html=0;fixedSize=1;', 120, 80, '', '六边形'),
		this.createVertexTemplateEntry('triangle;html=0;', 60, 80, '', '三角形'),
		this.createVertexTemplateEntry('shape=cylinder3;html=0;boundedLbl=1;backgroundOutline=1;size=15;', 60, 80, '', '数据库'),
		this.createVertexTemplateEntry('ellipse;shape=cloud;html=0;', 120, 80, '', '云网络'),
		this.createVertexTemplateEntry('shape=document;html=0;boundedLbl=1;', 120, 80, '', '文档'),
		this.createVertexTemplateEntry('shape=internalStorage;html=0;backgroundOutline=1;', 80, 80, '', '内部存储器'),
		this.createVertexTemplateEntry('shape=cube;html=0;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;', 120, 80, '', '立方体'),
		this.createVertexTemplateEntry('shape=step;perimeter=stepPerimeter;html=0;fixedSize=1;', 120, 80, '', '步'),
		this.createVertexTemplateEntry('shape=trapezoid;perimeter=trapezoidPerimeter;html=0;fixedSize=1;', 120, 60, '', '梯形'),
		this.createVertexTemplateEntry('shape=tape;html=0;', 120, 100, '', '条带'),
		this.createVertexTemplateEntry('shape=note;html=0;backgroundOutline=1;darkOpacity=0.05;', 80, 100, '', '笔记'),
		this.createVertexTemplateEntry('shape=card;html=0;', 80, 100, '', '卡片'),
		this.createVertexTemplateEntry('shape=callout;html=0;perimeter=calloutPerimeter;', 120, 80, '', '会话'),
		this.createVertexTemplateEntry('shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=0;outlineConnect=0;', 30, 60, '', '火柴人'),
		this.createVertexTemplateEntry('shape=dataStorage;html=0;fixedSize=1;', 100, 80, '', '数据存储'),
		this.addEntry('curve', mxUtils.bind(this, function()
		{
			var cell = new mxCell('', new mxGeometry(0, 0, 50, 50), 'curved=1;endArrow=classic;html=0;');
			cell.geometry.setTerminalPoint(new mxPoint(0, 50), true);
			cell.geometry.setTerminalPoint(new mxPoint(50, 0), false);
			cell.geometry.points = [new mxPoint(50, 50), new mxPoint(0, 0)];
			cell.geometry.relative = true;
			cell.edge = true;

			return this.createEdgeTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, '曲线');
		})),
		this.createEdgeTemplateEntry('shape=flexArrow;endArrow=classic;startArrow=classic;html=0;', 50, 50, '', '双向箭头'),
		this.createEdgeTemplateEntry('shape=flexArrow;endArrow=classic;html=0;', 50, 50, '', '箭头'),
		this.createEdgeTemplateEntry('endArrow=none;dashed=1;html=0;', 50, 50, '', '虚线(-)'),
		this.createEdgeTemplateEntry('endArrow=none;dashed=1;html=0;dashPattern=1 3;strokeWidth=2;', 50, 50, '', '虚线(●)'),
		this.createEdgeTemplateEntry('endArrow=none;html=0;', 50, 50, '', '线'),
		this.createEdgeTemplateEntry('endArrow=classic;startArrow=classic;html=0;', 50, 50, '', '双向连接器'),
		this.createEdgeTemplateEntry('endArrow=classic;html=0;', 50, 50, '', '定向连接器'),
		this.createEdgeTemplateEntry('shape=link;html=0;', 100, 0, '', '连杆'),
		this.addEntry(lineTags + 'edge title', mxUtils.bind(this, function()
		{
			var edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=classic;html=0;');
			edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			edge.geometry.setTerminalPoint(new mxPoint(100, 0), false);
			edge.geometry.relative = true;
			edge.edge = true;

			var cell0 = new mxCell('Label', new mxGeometry(0, 0, 0, 0), 'edgeLabel;resizable=0;html=0;align=center;verticalAlign=middle;');
			cell0.geometry.relative = true;
			cell0.setConnectable(false);
			cell0.vertex = true;
			edge.insert(cell0);

			return this.createEdgeTemplateFromCells([edge], 100, 0, '带标签的连接器');
		})),
		// this.addDataEntry('table', 180, 120, '表格1', '7VnLjpswFP0alq145DXLhqbvbpKRur4TO2DJ2MjcDEm+vjbYYZgkbdBoFCkgsfA9XIx9zrF9BV4UZ7uvCvL0tySUe6FPdl702QvDYBSGnrl8sq+R6cQCiWLEJjXAih2oBX2LbhmhRSsRpeTI8ja4lkLQNbYwUEqW7bSN5O235pDQE2C1Bn6K/mEE0xqdhdMG/0ZZkro3B5OH+k4GLtnOpEiByPIFFC28KFZSYt3KdjHlhjzHS/3clwt3jwNTVOA1D6yST/GPx/Uh9ZcqYstRufj5/UMwqrt5Br61M7ajxb2jQA88N02EJwPNU8y4Dn3dLFOGdJXD2twvtQM0ViAotEKaHK0MAhNU6TioYs4hL1jVWZ2RMk5+wV5u0b3GRXM7PKqQ7i5OPDjSqX1IZUZR7XVK2QgWzKwK6UuxnDRgTZIcn2141A1LZRdaxx1pXRpnzFOp2MHQ5fh9zWVRsoyD0JYD8gqay2qJGQhlblucbtA2nySizGygLAn+WT2IkvkjqIS6lA3jPJZcGgmFFMYEuWQCK9rGc31pImP/49gb65nFOg6aWF8mXWEsRYFKW8F0S6HAkhZXS/wP93YXfvRuuk+u113PDhnwpd61QCTXrCy7x0Gj1BlhuokvNe0bXm1LKSOEirfpMf6vHpOOctjOGpY69wYcqRKAeoVsBSlOND6O8w2yTwfZz8i+a4t09y6YDS647ILjYXv3NngYzv4bnv37tvA3KwWc3fu6Gzz0sxRwBA2y97kUcKIPLuh1KRBGQylw+1JgdvNSoMNHtjvcDepV0MNSoMNHwB7J3rdS4B4+CVbbPFWLZ1rv9sF7OuMOygMdNj926vTm91i0+As='),
		// this.addDataEntry('table', 180, 120, '表格1', '7Znfb9owEMf/mjx2IoEEeBxZ101i0lQmba8uNsSq44ucg0D/+p2JQ0ih3bKxdSuR8uC7nH/d92PrlHj9ON3cGJYln4AL5QU9vvH677wg8AdB4Nmnx7elZxg5x9JI7oJqx0w+COfsOe9KcpE3AhFAocyazjloLebY8DFjoGiGLUA1Z83YUhw5ZnOmjr1fJcek9I6CYe3/IOQyqWb2o3H5JmVVsNtJnjAOxYGrf+31YwOAZSvdxELZ5FV5Kfu9f+LtfmFGaPyZDnymb9bx1V32eQ3R9Jt//5GPrwZucWumVm7HbrW4rVJAC89sE9mddU0STBWZPjWLRKKYZWxu3xdEAPlyZAadkD2ySRlkUgvj+sxBKZblcjdYGZFIxadsCyuspqksG71K9ZT65y6aNG2aK80Fd1aOBu5FDArsdFws2ErZYdwuhUGxeTJ//l4VwllAKtBsKaSodfdHLl/JoeaVwsyxttz3reWghlOkjTp+S3VuLWCTBIx8sFlX+6w0JckLmSqmiVzGH7kmsDup1oWQuZYSC3TNO0CEtMq9S0LvpKzcQPaFmaWoQhZSqUoaDdqylIHUuEtbOKGHEhn33oReSDuLyfZrmx4bbjAGTSoTUXZYwXIsRI7nBeGZo9Iej8EfoyM4puM68saRNxruGrH3Nn6SF9ovSqZu6dJkenl4sN2htdcpq9U8IV47QICSvlC7GzCRnAttByVKHZd+8Dc0/PERj1pK6Aar89h6NKZQGM2Qzh7tPj/iYr/O30Cl36FyJlQ2TWFfPTmDjpzzkrMvF149OmFXvfzz1cu2icfLFTNRd8+0lTS80GJm2KFyJlQurZgZdeScl5zLKWbGXTHzvxQzo5cuZsITX1W7e+Z5SceXWcyEJz7xdqj8EioXVsyE3effM5PzCooZMus/imV4/V+2f/0d'),
		this.addDataEntry('table title', 180, 120, '表格2', '7VlNj5swEP01HLfCkJDkCrvdVtpK1Wal9urEDlg1NjKTr/31HcCEsCRN0qqKFCJxsB/jwfPejEcyjh+lm2dDs+SbZlw6nss2jv/oeB4ZeJ5TPC7bVsgosEBsBLNGDTAV79yCrkWXgvG8ZQhaSxBZG5xrpfgcWhg1Rq/bZgst21/NaMw7wHROZRf9IRgkFTr2Rg3+hYs4qb9Mgkn1JqW1sY0kTyjT6z3If3L8yGgN1SjdRFwW5NW8VOs+H3m725jhCs5ZwKbqeRU9zLLvKx28/CS/vrLJg/WyonJpA36jM4y92jFsaxpw81kxhPKtH+ZADVi1fBcB5B+oUNwgQMq5lDTLRWn+WFokQrIXutVLqB3Vs3CBq6f2a8VqKkWscDzH2AqXod0mN8A3R+MnO1YxHblOOZgtmqwb3cjYipHsaza0ILW5Eu/WNnTiwDJ6Abteh90/E/ta5EeYaCPeCzqlZW6f7HK+FqmkChOPsg9QqMtCKyDQmR1JvgA7nGkAndqJsRy4B/ViRmdv1MS8NlkIKSMtdSGx0qpIg0wLBSVrwxAf5DFyPw2dIUYW4Zw0c3wKcwORVjkYTJXCLac5rHkO5yp8PIe7stsDx7finsqCwf9KAv/8JMBQQVD5igcZVXFZaAmkcidRecTRRqIDilymuka+F7I8lRLBGFf/JIR3sv6CC4m3zhpCLvZGJR4gigJWxlKxvKPmbp9/L/Cg7wJv2nLcut7Du96VF68nggf3Nn71Nj66dhsf9abqg3628XHfBe5ZG5/c9e5XG6+vlO59/Ip9nJBrN3LSvfO61cIn7mEtbr7SL7h4u1GJe9bMSX9u2U4ofgPtHKfNb5HKvPm55D/9Bg=='),
		// this.addDataEntry('table title', 180, 150, '表格3', '7Zhdb5swFIZ/DbcTHyVrbiFdb7Kbptq9Cw5YMj7IPi1kv37HYJK1FDWbQoOmSUSyz4dt3id+L/CitGrvNavL75Bz6UV3XpRqAOxHVZtyKb3QF7kXbbww9Onnhd8mskGX9WumucJzGsK+4YXJZ95HHtmT5H3U4EG6qClZbYfYZaOkxIrOuglo2JQC+a5mmc039CYUM8g07sRPG4p8CmSgkAnFtWvKQEpWG9GttukqSiHzLTvAMw77DLNkL1qeP0BjXLeGZkuLGde6p8V37qw2zaQoFI0zEsHumLiX5Bp5OylUF3Iq3XOoOOoDlTQix9JV3PZi+iUXRTm0xS7ITB8ojr0n3WngpH8fQzTCMEmAjoyCyQeeIVPFOTDGWuca6kemC44uUIOwUt29kBpHVYWUKUiwyBQouxFC7ZKS74feJ0CEaiDjhDku2okSJ/SQTKn/JfZiepuU5sFpTo8t15iCMqjpj2LX4Mxgww2eCzB8H+DBSewwfcQzugDOmxHO4KI8lbLVJ55/jMp/gwpI2r2EhqalyHOuztU8+vDS3MykcTzS+Ec3DP2Faz24U1+bGNpQqGLbd65mgNG+BvH7BZgLzupf8LO34JblZ6tP9LOvI5yX5bkcP1tdzc9uJ/1s4VrP52cTMK7gZ+v/fja3n60/0c8Cf8QzWvYl++s7tL6aoQXBpKMtXOz5HG2CxvyORtPTR4Uu9+qbwy8='),
		// this.addDataEntry('crossfunctional cross-functional cross functional flowchart swimlane table', 400, 400, '表格3', '7ZhRb5swEMc/DY+bMCRt97jQpi+tVC2fwINbbMnYyD4C6aefjaHpBrTRlNCoTALJPp9t+P25O5kgTvL6XtOCPaoMRBDfBXGilULfyusEhAiikGdBfBtEUWjvIFqPjJJmNCyoBonHTIj8hB0VJXiL3dyYL+tSpsiVpM55LVSVMqrROxvci9bZMFq4JtKfzrRKGRfZA92rEjtr11tpVT1wCcYOhM5ViTKXry0G7RYb/uwWXDgDw9wCuSW2WTGOsClo6gYri8uvIGhheLN1s4KGtNSG7+AHGL+Os0JdUJm1nUJxiaDvdhZQt/EvJXHTvpTbjAq+lbadgnO1hhYSaIR6FHRjainfg8oB9d66VDxD5j0WoRcjZMC3DP8yUuMN25e5B91so5VuWMa4J+P3FJW2JtLXrOK5oNLJxZTmz/blqXhNp3mO5cpe9smS8OsyWNp5ie2TQ99ezl1joqRBTXmDAajBCgxejprHKBcNK7fvBPIz3hOSRCcQctET8olRA+8JmSopIW2j8GOD6Sji8TDxepT4C9yTE1+OEo/mQ5xcTYn8ahR5PB/k0c2UyK9HC8SbX/mnLBAnqAlD8XK+onDTE+/fw+TiQF9fTin4Nl/O0xYAEs6X9LR5n5Ae6S7xv1lr/yf+4cQ/pN75Ej/pH88/UZyQkRPzR6R+0j9Bz4f0xMm/f8adD+qzZn/bPfw5bMb++LH4Gw=='),




		this.createVertexTemplateEntry('html=0;shape=isoCube2;backgroundOutline=1;isoAngle=15;', 90, 100, '', '等距立方体'),


		this.createVertexTemplateEntry('shape=curlyBracket;html=0;rounded=1;', 20, 120, '', '花括号'),
		this.createVertexTemplateEntry('line;strokeWidth=2;html=0;', 160, 10, '', '水平线'),
		this.createVertexTemplateEntry('line;strokeWidth=2;direction=south;html=0;', 10, 160, '', '垂线'),
		this.createVertexTemplateEntry('shape=crossbar;html=0;rounded=1;', 120, 20, '', '横杆'),

		this.createVertexTemplateEntry('shape=partialRectangle;html=0;left=0;right=0;fillColor=none;', 120, 60, '', '部分矩形'),
		this.createVertexTemplateEntry('shape=partialRectangle;html=0;bottom=1;right=1;left=1;top=0;fillColor=none;routingCenterX=-0.5;', 120, 60, '', '部分矩形'),
		this.createEdgeTemplateEntry('edgeStyle=segmentEdgeStyle;endArrow=classic;html=0;', 50, 50, '', '手动线', null, lineTags + 'manual'),
		this.createEdgeTemplateEntry('shape=filledEdge;rounded=0;fixDash=1;endArrow=none;strokeWidth=10;fillColor=#ffffff;edgeStyle=orthogonalEdgeStyle;', 60, 40, '', '填充边缘'),

	];

	this.addPaletteFunctions("general", mxResources.get("general"), (expand != null) ? expand : true, fns);
	this.setCurrentSearchEntryLibrary();
};

Sidebar.prototype.addBasicPalette = function(expand)
	{
		var w = 100;
		var h = 100;
		var s = 'whiteSpace=wrap;html=1;shape=mxgraph.basic.';
		var s2 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;html=1;shape=mxgraph.basic.';
		var s3 = mxConstants.STYLE_VERTICAL_LABEL_POSITION + '=bottom;' + mxConstants.STYLE_VERTICAL_ALIGN + '=top;html=1;shape=';
		var gn = 'mxgraph.basic';
		var dt = '';
		this.setCurrentSearchEntryLibrary('basic');
		
		this.addPaletteFunctions('basic', mxResources.get('basic'), false,
		[
			this.createVertexTemplateEntry(s2 + 'rect;fillColor2=none;strokeWidth=1;size=20;indent=5;', w * 1.2, h * 0.6, '', 'Partial Rectangle'),
			this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;top=0;bottom=0;fillColor=none;', w * 1.2, h * 0.6, '', 'Partial Rectangle'),
			this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;right=0;top=0;bottom=0;fillColor=none;routingCenterX=-0.5;', w * 1.2, h * 0.6, '', 'Partial Rectangle'),
			this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;bottom=0;right=0;fillColor=none;', w * 1.2, h * 0.6, '', 'Partial Rectangle'),
			this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;top=0;left=0;fillColor=none;', w * 1.2, h * 0.6, '', 'Partial Rectangle'),
			this.createVertexTemplateEntry(s2 + 'polygon;polyCoords=[[0.25,0],[0.75,0],[1,0.25],[1,0.75],[0.75,1],[0.25,1],[0,0.75],[0,0.25]];polyline=0;', w, h, '', 'Polygon', null, null, this.getTagsForStencil(gn, 'polygon', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'polygon;polyCoords=[[0.25,0],[0.75,0],[1,0.25],[1,0.75],[0.75,1],[0.25,1],[0,0.75],[0,0.25]];polyline=1;fillColor=none;', w, h, '', 'Polyline', null, null, this.getTagsForStencil(gn, 'polyline', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=diag;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', 'Rectangle with diagonal fill'),
			this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=diagRev;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', 'Rectangle with reverse diagonal fill'),
			this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=vert;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', 'Rectangle with vertical fill'),
			this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=hor;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', 'Rectangle with horizontal fill'),
			this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=grid;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', 'Rectangle with grid fill'),
			this.createVertexTemplateEntry(s2 + 'patternFillRect;fillStyle=diagGrid;step=5;fillStrokeWidth=0.2;fillStrokeColor=#dddddd;', w * 1.2, h * 0.6, '', 'Rectangle with diagonal grid fill'),
			this.createVertexTemplateEntry(s2 + '4_point_star_2;dx=0.8;', w, h, '', '4 Point Star', null, null, this.getTagsForStencil(gn, '4_point_star', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + '6_point_star', w, h * 0.9, '', '6 Point Star', null, null, this.getTagsForStencil(gn, '6_point_star', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + '8_point_star', w, h, '', '8 Point Star', null, null, this.getTagsForStencil(gn, '8_point_star', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'banner', w, h * 0.5, '', 'Banner', null, null, this.getTagsForStencil(gn, 'banner', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'cloud_callout', w * 0.9, h * 0.6, '', 'Cloud Callout', null, null, this.getTagsForStencil(gn, 'cloud_callout', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'cloud_rect', w * 1.2, h * 0.9, '', 'Cloud Rectangle', null, null, this.getTagsForStencil(gn, 'cloud_rect', dt + ' rectangle').join(' ')),
			this.createVertexTemplateEntry(s2 + 'cone', w, h, '', 'Cone', null, null, this.getTagsForStencil(gn, 'cone', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'cone2;dx=0.5;dy=0.9;', w, h, '', 'Cone (adjustable)', null, null, this.getTagsForStencil(gn, 'cone', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'document', w, h, '', 'Document', null, null, this.getTagsForStencil(gn, 'document', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'donut;dx=25;', w, h, '', 'Donut', null, null, this.getTagsForStencil(gn, 'donut', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'drop', w * 0.7, h, '', 'Drop', null, null, this.getTagsForStencil(gn, 'drop', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'flash', w * 0.6, h, '', 'Flash', null, null, this.getTagsForStencil(gn, 'flash', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'half_circle', w, h * 0.5, '', 'Half Circle', null, null, this.getTagsForStencil(gn, 'half_circle', dt + ' semicircle').join(' ')),
			this.createVertexTemplateEntry(s2 + 'heart', w, h, '', 'Heart', null, null, this.getTagsForStencil(gn, 'heart', dt).join(' ')),
			this.createVertexTemplateEntry('html=1;shape=mxgraph.basic.isocube;isoAngle=15;', w, h, '', 'Isometric Cube', null, null, this.getTagsForStencil(gn, 'isometric cube', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'loud_callout', w, h * 0.6, '', 'Loud Callout', null, null, this.getTagsForStencil(gn, 'loud_callout', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'moon', w * 0.75, h, '', 'Moon', null, null, this.getTagsForStencil(gn, 'moon', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'no_symbol', w, h, '', 'No Symbol', null, null, this.getTagsForStencil(gn, 'no_symbol', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'octagon2;align=center;verticalAlign=middle;dx=15;', w, h, '', 'Octagon', null, null, this.getTagsForStencil(gn, 'octagon', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'orthogonal_triangle', w, h * 0.7, '', 'Orthogonal Triangle', null, null, this.getTagsForStencil(gn, 'orthogonal_triangle', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'acute_triangle;dx=0.5;', w, h * 0.7, '', 'Acute Triangle', null, null, this.getTagsForStencil(gn, 'acute_triangle', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'obtuse_triangle;dx=0.25;', w, h * 0.7, '', 'Obtuse Triangle', null, null, this.getTagsForStencil(gn, 'obtuse_triangle', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'oval_callout', w, h * 0.6, '', 'Oval Callout', null, null, this.getTagsForStencil(gn, 'oval_callout', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'pentagon', w, h * 0.9, '', 'Pentagon', null, null, this.getTagsForStencil(gn, 'pentagon', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'pointed_oval', w * 0.5, h, '', 'Pointed Oval', null, null, this.getTagsForStencil(gn, 'pointed oval', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'pyramid;dx1=0.4;dx2=0.6;dy1=0.9;dy2=0.8;', w, h, '', 'Pyramid', null, null, this.getTagsForStencil(gn, 'pyramid', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'diag_snip_rect;dx=6;whiteSpace=wrap;', w, h * 0.6, '', 'Diagonal Snip Rectangle', null, null, this.getTagsForStencil(gn, 'diag_snip_rect', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'diag_round_rect;dx=6;whiteSpace=wrap;', w, h * 0.6, '', 'Diagonal Rounded Rectangle', null, null, this.getTagsForStencil(gn, 'diag_round_rect', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'corner_round_rect;dx=6;whiteSpace=wrap;', w, h * 0.6, '', 'Corner Rounded Rectangle', null, null, this.getTagsForStencil(gn, 'corner_round_rect', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'three_corner_round_rect;dx=6;whiteSpace=wrap;', w, h * 0.6, '', 'Rounded Rectangle (three corners)', null, null, this.getTagsForStencil(gn, 'three_corner_round_rect', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'plaque;dx=6;whiteSpace=wrap;', w, h * 0.6, '', 'Plaque', null, null, this.getTagsForStencil(gn, 'plaque', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'frame;dx=10;whiteSpace=wrap;', w, h * 0.6, '', 'Frame', null, null, this.getTagsForStencil(gn, 'frame', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'rounded_frame;dx=10;whiteSpace=wrap;', w, h * 0.6, '', 'Rounded Frame', null, null, this.getTagsForStencil(gn, 'rounded_frame', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'plaque_frame;dx=10;whiteSpace=wrap;', w, h * 0.6, '', 'Plaque Frame', null, null, this.getTagsForStencil(gn, 'plaque_frame', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'frame_corner;dx=10;whiteSpace=wrap;', w, h * 0.6, '', 'Frame Corner', null, null, this.getTagsForStencil(gn, 'frame_corner', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'diag_stripe;dx=10;', w, h * 0.6, '', 'Diagonal Stripe', null, null, this.getTagsForStencil(gn, 'diag_stripe', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'rectCallout;dx=30;dy=15;boundedLbl=1;', w, h * 0.6, '', 'Rectangular Callout', null, null, this.getTagsForStencil(gn, 'rectangular_callout', dt).join(' ')),
			this.createVertexTemplateEntry(s + 'roundRectCallout;dx=30;dy=15;size=5;boundedLbl=1;', w, h * 0.6, '', 'Rounded Rectangular Callout', null, null, this.getTagsForStencil(gn, 'rectangular_callout', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'layered_rect;dx=10;outlineConnect=0;whiteSpace=wrap;', w, h * 0.6, '', 'Layered Rectangle', null, null, this.getTagsForStencil(gn, 'layered_rect', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'smiley', w, h, '', 'Smiley', null, null, this.getTagsForStencil(gn, 'smiley', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'star', w, h * 0.95, '', 'Star', null, null, this.getTagsForStencil(gn, 'star', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'sun', w, h, '', 'Sun', null, null, this.getTagsForStencil(gn, 'sun', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'tick', w * 0.85, h, '', 'Tick', null, null, this.getTagsForStencil(gn, 'tick', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'wave2;dy=0.3;', w, h * 0.6, '', 'Wave', null, null, this.getTagsForStencil(gn, 'wave', dt).join(' ')),
			this.createVertexTemplateEntry('labelPosition=center;verticalLabelPosition=middle;align=center;html=1;shape=mxgraph.basic.button;dx=10;whiteSpace=wrap;', w, h * 0.6, 'Button', 'Button', null, null, this.getTagsForStencil(gn, 'button', dt).join(' ')),
			this.createVertexTemplateEntry('labelPosition=center;verticalLabelPosition=middle;align=center;html=1;shape=mxgraph.basic.shaded_button;dx=10;fillColor=#E6E6E6;strokeColor=none;whiteSpace=wrap;', w, h * 0.6, 'Button', 'Button (shaded)', null, null, this.getTagsForStencil(gn, 'button', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'x', w, h, '', 'X', null, null, this.getTagsForStencil(gn, 'x', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'pie;startAngle=0.2;endAngle=0.9;', w, h, '', 'Pie', null, null, this.getTagsForStencil(gn, 'pie', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'arc;startAngle=0.3;endAngle=0.1;', w, h, '', 'Arc', null, null, this.getTagsForStencil(gn, 'arc', dt).join(' ')),
			this.createVertexTemplateEntry(s2 + 'partConcEllipse;startAngle=0.25;endAngle=0.1;arcWidth=0.5;', w, h, '', 'Partial Concentric Ellipse', null, null, this.getTagsForStencil(gn, 'partConcEllipse', dt).join(' ')),
		 	this.createVertexTemplateEntry('shape=message;html=1;html=1;outlineConnect=0;labelPosition=center;verticalLabelPosition=bottom;align=center;verticalAlign=top;', 60, 40, '', 'Message', null, null, 'message mail'),
 		 	this.createVertexTemplateEntry('shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;lid=0;', 60, 80, '', 'Cylinder Stack', null, null, 'cylinder data database stack tube')
		]);
		
		this.setCurrentSearchEntryLibrary();
};

//XML 获取图形
Sidebar.prototype.addStencilPalette = function(id, title, stencilFile, style, ignore, onInit, scale, tags, customFns, groupId)
{
	scale = (scale != null) ? scale : 1;

	if (this.addStencilsToIndex)
	{
		// LATER: Handle asynchronous loading dependency
		var fns = [];

		if (customFns != null)
		{
			for (var i = 0; i < customFns.length; i++)
			{
				fns.push(customFns[i]);
			}
		}

		mxStencilRegistry.loadStencilSet(stencilFile, mxUtils.bind(this, function(packageName, stencilName, displayName, w, h)
		{
			if (ignore == null || mxUtils.indexOf(ignore, stencilName) < 0)
			{
				var tmp = this.getTagsForStencil(packageName, stencilName);
				var tmpTags = (tags != null) ? tags[stencilName] : null;

				if (tmpTags != null)
				{
					tmp.push(tmpTags);
				}
				console.log("packageName + stencilName.toLowerCase() + style",packageName + stencilName.toLowerCase() + style)
				fns.push(this.createVertexTemplateEntry('shape=' + packageName + stencilName.toLowerCase() + style,
					Math.round(w * scale), Math.round(h * scale), '', stencilName.replace(/_/g, ' '), null, null,
					this.filterTags(tmp.join(' '))));
			}
		}), true, true);

		this.addPaletteFunctions(id, title, false, fns);
	}
	else
	{
		this.addPalette(id, title, false, mxUtils.bind(this, function(content)
		{
			if (style == null)
			{
				style = '';
			}

			if (onInit != null)
			{
				onInit.call(this, content);
			}

			if (customFns != null)
			{
				for (var i = 0; i < customFns.length; i++)
				{
					customFns[i](content);
				}
			}

			mxStencilRegistry.loadStencilSet(stencilFile, mxUtils.bind(this, function(packageName, stencilName, displayName, w, h)
			{
				if (ignore == null || mxUtils.indexOf(ignore, stencilName) < 0)
				{
					content.appendChild(this.createVertexTemplate('shape=' + packageName + stencilName.toLowerCase() + style,
						Math.round(w * scale), Math.round(h * scale), '', stencilName.replace(/_/g, ' '), true));
				}
			}), true);
		}));
	}
};

Sidebar.prototype.addUmlPalette = function(expand)
{
	// Avoids having to bind all functions to "this"
	var sb = this;

	// Reusable cells
	var field = new mxCell('+ field: type', new mxGeometry(0, 0, 100, 26), 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;');
	field.vertex = true;

	var divider = new mxCell('', new mxGeometry(0, 0, 40, 8), 'line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
	divider.vertex = true;

	// Default tags
	var dt = 'uml static class ';
	this.setCurrentSearchEntryLibrary('uml');

	var fns = [
		this.createVertexTemplateEntry('html=0;', 110, 50, 'Object', 'Object', null, null, dt + 'object instance'),
		this.createVertexTemplateEntry('html=0;', 110, 50, '&laquo;interface&raquo;<br><b>Name</b>', 'Interface', null, null, dt + 'interface object instance annotated annotation'),
		this.addEntry(dt + 'object instance', function()
		{
			var cell = new mxCell('Classname', new mxGeometry(0, 0, 160, 90),
				'swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;');
			cell.vertex = true;
			cell.insert(field.clone());
			cell.insert(divider.clone());
			cell.insert(sb.cloneCell(field, '+ method(type): type'));

			return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Class');
		}),
		this.addEntry(dt + 'section subsection', function()
		{
			var cell = new mxCell('Classname', new mxGeometry(0, 0, 140, 110),
				'swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=26;fillColor=none;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;');
			cell.vertex = true;
			cell.insert(field.clone());
			cell.insert(field.clone());
			cell.insert(field.clone());

			return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Class 2');
		}),
		this.addEntry(dt + 'item member method function variable field attribute label', function()
		{
			return sb.createVertexTemplateFromCells([sb.cloneCell(field, '+ item: attribute')], field.geometry.width, field.geometry.height, 'Item 1');
		}),
		this.addEntry(dt + 'item member method function variable field attribute label', function()
		{
			var cell = new mxCell('item: attribute', new mxGeometry(0, 0, 120, field.geometry.height), 'label;fontStyle=0;strokeColor=none;fillColor=none;align=left;verticalAlign=top;overflow=hidden;' +
				'spacingLeft=28;spacingRight=4;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;imageWidth=16;imageHeight=16;image=' + sb.gearImage);
			cell.vertex = true;

			return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Item 2');
		}),
		this.addEntry(dt + 'divider hline line separator', function()
		{
			return sb.createVertexTemplateFromCells([divider.clone()], divider.geometry.width, divider.geometry.height, 'Divider');
		}),
		this.addEntry(dt + 'spacer space gap separator', function()
		{
			var cell = new mxCell('', new mxGeometry(0, 0, 20, 14), 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=4;spacingRight=4;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
			cell.vertex = true;

			return sb.createVertexTemplateFromCells([cell.clone()], cell.geometry.width, cell.geometry.height, 'Spacer');
		}),
		this.createVertexTemplateEntry('text;align=center;fontStyle=1;verticalAlign=middle;spacingLeft=3;spacingRight=3;strokeColor=none;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;',
			80, 26, 'Title', 'Title', null, null, dt + 'title label'),
		this.addEntry(dt + 'component', function()
		{
			var cell = new mxCell('&laquo;Annotation&raquo;<br/><b>Component</b>', new mxGeometry(0, 0, 180, 90), 'html=0;dropTarget=0;');
			cell.vertex = true;

			var symbol = new mxCell('', new mxGeometry(1, 0, 20, 20), 'shape=module;jettyWidth=8;jettyHeight=4;');
			symbol.vertex = true;
			symbol.geometry.relative = true;
			symbol.geometry.offset = new mxPoint(-27, 7);
			cell.insert(symbol);

			return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Component');
		}),
		this.addEntry(dt + 'component', function()
		{
			var cell = new mxCell('<p style="margin:0px;margin-top:6px;text-align:center;"><b>Component</b></p>' +
				'<hr/><p style="margin:0px;margin-left:8px;">+ Attribute1: Type<br/>+ Attribute2: Type</p>', new mxGeometry(0, 0, 180, 90),
				'align=left;overflow=fill;html=0;dropTarget=0;');
			cell.vertex = true;

			var symbol = new mxCell('', new mxGeometry(1, 0, 20, 20), 'shape=component;jettyWidth=8;jettyHeight=4;');
			symbol.vertex = true;
			symbol.geometry.relative = true;
			symbol.geometry.offset = new mxPoint(-24, 4);
			cell.insert(symbol);

			return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Component with Attributes');
		}),
		this.createVertexTemplateEntry('verticalAlign=top;align=left;spacingTop=8;spacingLeft=2;spacingRight=12;shape=cube;size=10;direction=south;fontStyle=4;html=0;',
			180, 120, 'Block', 'Block', null, null, dt + 'block'),
		this.createVertexTemplateEntry('shape=module;align=left;spacingLeft=20;align=center;verticalAlign=top;', 100, 50, 'Module', 'Module', null, null, dt + 'module component'),
		this.createVertexTemplateEntry('shape=folder;fontStyle=1;spacingTop=10;tabWidth=40;tabHeight=14;tabPosition=left;html=0;', 70, 50,
			'package', 'Package', null, null, dt + 'package'),
		this.createVertexTemplateEntry('verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=0;',
			160, 90, '<p style="margin:0px;margin-top:4px;text-align:center;text-decoration:underline;"><b>Object:Type</b></p><hr/>' +
			'<p style="margin:0px;margin-left:8px;">field1 = value1<br/>field2 = value2<br>field3 = value3</p>', 'Object',
			null, null, dt + 'object instance'),
		this.createVertexTemplateEntry('verticalAlign=top;align=left;overflow=fill;html=0;',180, 90,
			'<div style="box-sizing:border-box;width:100%;background:#e4e4e4;padding:2px;">Tablename</div>' +
			'<table style="width:100%;font-size:1em;" cellpadding="2" cellspacing="0">' +
			'<tr><td>PK</td><td>uniqueId</td></tr><tr><td>FK1</td><td>' +
			'foreignKey</td></tr><tr><td></td><td>fieldname</td></tr></table>', 'Entity', null, null, 'er entity table'),
		this.addEntry(dt + 'object instance', function()
		{
			var cell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' +
				'<b>Class</b></p>' +
				'<hr size="1"/><div style="height:2px;"></div>', new mxGeometry(0, 0, 140, 60),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=0;');
			cell.vertex = true;

			return sb.createVertexTemplateFromCells([cell.clone()], cell.geometry.width, cell.geometry.height, 'Class 3');
		}),
		this.addEntry(dt + 'object instance', function()
		{
			var cell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' +
				'<b>Class</b></p>' +
				'<hr size="1"/><div style="height:2px;"></div><hr size="1"/><div style="height:2px;"></div>', new mxGeometry(0, 0, 140, 60),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=0;');
			cell.vertex = true;

			return sb.createVertexTemplateFromCells([cell.clone()], cell.geometry.width, cell.geometry.height, 'Class 4');
		}),
		this.addEntry(dt + 'object instance', function()
		{
			var cell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' +
				'<b>Class</b></p>' +
				'<hr size="1"/><p style="margin:0px;margin-left:4px;">+ field: Type</p><hr size="1"/>' +
				'<p style="margin:0px;margin-left:4px;">+ method(): Type</p>', new mxGeometry(0, 0, 160, 90),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=0;');
			cell.vertex = true;

			return sb.createVertexTemplateFromCells([cell.clone()], cell.geometry.width, cell.geometry.height, 'Class 5');
		}),
		this.addEntry(dt + 'object instance', function()
		{
			var cell = new mxCell('<p style="margin:0px;margin-top:4px;text-align:center;">' +
				'<i>&lt;&lt;Interface&gt;&gt;</i><br/><b>Interface</b></p>' +
				'<hr size="1"/><p style="margin:0px;margin-left:4px;">+ field1: Type<br/>' +
				'+ field2: Type</p>' +
				'<hr size="1"/><p style="margin:0px;margin-left:4px;">' +
				'+ method1(Type): Type<br/>' +
				'+ method2(Type, Type): Type</p>', new mxGeometry(0, 0, 190, 140),
				'verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=0;');
			cell.vertex = true;

			return sb.createVertexTemplateFromCells([cell.clone()], cell.geometry.width, cell.geometry.height, 'Interface 2');
		}),
		this.createVertexTemplateEntry('shape=providedRequiredInterface;html=0;verticalLabelPosition=bottom;', 20, 20, '', 'Provided/Required Interface', null, null, 'uml provided required interface lollipop notation'),
		this.createVertexTemplateEntry('shape=requiredInterface;html=0;verticalLabelPosition=bottom;', 10, 20, '', 'Required Interface', null, null, 'uml required interface lollipop notation'),
		this.addEntry('uml lollipop notation provided required interface', function()
		{
			return sb.createVertexTemplateFromData('zVTBrptADPyavVYEkt4b0uQd3pMq5dD2uAUD27dgZJwE8vX1spsQlETtpVWRIjFjex3PmFVJWvc70m31hjlYlXxWSUqI7N/qPgVrVRyZXCUbFceR/FS8fRJdjNGo1QQN/0lB7AuO2h7AM57oeLCBIDw0Obj8SCVrJK6wxEbbV8RWyIWQP4F52Juzq9AHRqEqrm2IQpN/IsKTwAYb8MzWWBuO9B0hL2E2BGsqIQyxvJ9rzApD7QBrYBokhcBqNsf5UbrzsLzmXUu/oJET42jwGat5QYcHyiDkTDLKy03TiRrFfSx08m+FrrQtUkOZvZdbFKThmwMfVhf4fQ43/W3uZriiPPT+KKhjwnf4anKuQv//wsg+NPJ7/9d9Xf7eVykwbeeMOFWGYd/qzEVO8tHP/Suw4a2ujXV/+gXsEdhkOgSC8os44BQt0tggicZHeG1N2QiXibhAV48epRayEDd8MT7Ct06TUaXVWq027tCuhcx5VZjebeeaoDNn/WMcb/p+j0AM/dNr6InLl4Lgzylsk6OCgRWYsuI592gNZh5OhgmcblPv7+1l+ws=',
				40, 10, 'Lollipop Notation');
		}),
		this.createVertexTemplateEntry('shape=umlBoundary;html=0;', 100, 80, 'Boundary Object', 'Boundary Object', null, null, 'uml boundary object'),
		this.createVertexTemplateEntry('ellipse;shape=umlEntity;html=0;', 80, 80, 'Entity Object', 'Entity Object', null, null, 'uml entity object'),
		this.createVertexTemplateEntry('ellipse;shape=umlControl;html=0;', 70, 80, 'Control Object', 'Control Object', null, null, 'uml control object'),
		this.createVertexTemplateEntry('shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=0;', 30, 60, 'Actor', 'Actor', false, null, 'uml actor'),
		this.createVertexTemplateEntry('ellipse;html=0;', 140, 70, 'Use Case', 'Use Case', null, null, 'uml use case usecase'),
		this.addEntry('uml activity state start', function()
		{
			var cell = new mxCell('', new mxGeometry(0, 0, 30, 30),
				'ellipse;html=0;shape=startState;fillColor=#000000;strokeColor=#ff0000;');
			cell.vertex = true;

			var edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=0;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
			edge.geometry.setTerminalPoint(new mxPoint(15, 90), false);
			edge.geometry.relative = true;
			edge.edge = true;

			cell.insertEdge(edge, true);

			return sb.createVertexTemplateFromCells([cell, edge], 30, 90, 'Start');
		}),
		this.addEntry('uml activity state', function()
		{
			var cell = new mxCell('Activity', new mxGeometry(0, 0, 120, 40),
				'rounded=1;html=0;arcSize=40;fontColor=#000000;fillColor=#ffffc0;strokeColor=#ff0000;');
			cell.vertex = true;

			var edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=0;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
			edge.geometry.setTerminalPoint(new mxPoint(60, 100), false);
			edge.geometry.relative = true;
			edge.edge = true;

			cell.insertEdge(edge, true);

			return sb.createVertexTemplateFromCells([cell, edge], 120, 100, 'Activity');
		}),
		this.addEntry('uml activity composite state', function()
		{
			var cell = new mxCell('Composite State', new mxGeometry(0, 0, 160, 60),
				'swimlane;html=0;fontStyle=1;align=center;verticalAlign=middle;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=0;resizeLast=1;container=0;fontColor=#000000;collapsible=0;rounded=1;arcSize=30;strokeColor=#ff0000;fillColor=#ffffc0;swimlaneFillColor=#ffffc0;dropTarget=0;');
			cell.vertex = true;

			var cell1 = new mxCell('Subtitle', new mxGeometry(0, 0, 200, 26), 'text;html=0;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;fontColor=#000000;');
			cell1.vertex = true;
			cell.insert(cell1);

			var edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=0;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
			edge.geometry.setTerminalPoint(new mxPoint(80, 120), false);
			edge.geometry.relative = true;
			edge.edge = true;

			cell.insertEdge(edge, true);

			return sb.createVertexTemplateFromCells([cell, edge], 160, 120, 'Composite State');
		}),
		this.addEntry('uml activity condition', function()
		{
			var cell = new mxCell('Condition', new mxGeometry(0, 0, 80, 40), 'rhombus;html=0;fillColor=#ffffc0;strokeColor=#ff0000;');
			cell.vertex = true;

			var edge1 = new mxCell('no', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=0;align=left;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
			edge1.geometry.setTerminalPoint(new mxPoint(180, 20), false);
			edge1.geometry.relative = true;
			edge1.geometry.x = -1;
			edge1.edge = true;

			cell.insertEdge(edge1, true);

			var edge2 = new mxCell('yes', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=0;align=left;verticalAlign=top;endArrow=open;endSize=8;strokeColor=#ff0000;');
			edge2.geometry.setTerminalPoint(new mxPoint(40, 100), false);
			edge2.geometry.relative = true;
			edge2.geometry.x = -1;
			edge2.edge = true;

			cell.insertEdge(edge2, true);

			return sb.createVertexTemplateFromCells([cell, edge1, edge2], 180, 100, 'Condition');
		}),
		this.addEntry('uml activity fork join', function()
		{
			var cell = new mxCell('', new mxGeometry(0, 0, 200, 10), 'shape=line;html=0;strokeWidth=6;strokeColor=#ff0000;');
			cell.vertex = true;

			var edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=0;verticalAlign=bottom;endArrow=open;endSize=8;strokeColor=#ff0000;');
			edge.geometry.setTerminalPoint(new mxPoint(100, 80), false);
			edge.geometry.relative = true;
			edge.edge = true;

			cell.insertEdge(edge, true);

			return sb.createVertexTemplateFromCells([cell, edge], 200, 80, 'Fork/Join');
		}),
		this.createVertexTemplateEntry('ellipse;html=0;shape=endState;fillColor=#000000;strokeColor=#ff0000;', 30, 30, '', 'End', null, null, 'uml activity state end'),
		this.createVertexTemplateEntry('shape=umlLifeline;perimeter=lifelinePerimeter;html=0;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;', 100, 300, ':Object', 'Lifeline', null, null, 'uml sequence participant lifeline'),
		this.createVertexTemplateEntry('shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;html=0;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;outlineConnect=0;',
			20, 300, '', 'Actor Lifeline', null, null, 'uml sequence participant lifeline actor'),
		this.createVertexTemplateEntry('shape=umlLifeline;participant=umlBoundary;perimeter=lifelinePerimeter;html=0;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;outlineConnect=0;',
			50, 300, '', 'Boundary Lifeline', null, null, 'uml sequence participant lifeline boundary'),
		this.createVertexTemplateEntry('shape=umlLifeline;participant=umlEntity;perimeter=lifelinePerimeter;html=0;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;outlineConnect=0;',
			40, 300, '', 'Entity Lifeline', null, null, 'uml sequence participant lifeline entity'),
		this.createVertexTemplateEntry('shape=umlLifeline;participant=umlControl;perimeter=lifelinePerimeter;html=0;container=1;collapsible=0;recursiveResize=0;verticalAlign=top;spacingTop=36;outlineConnect=0;',
			40, 300, '', 'Control Lifeline', null, null, 'uml sequence participant lifeline control'),
		this.createVertexTemplateEntry('shape=umlFrame;html=0;', 300, 200, 'frame', 'Frame', null, null, 'uml sequence frame'),
		this.createVertexTemplateEntry('shape=umlDestroy;html=0;strokeWidth=3;', 30, 30, '', 'Destruction', null, null, 'uml sequence destruction destroy'),
		this.addEntry('uml sequence invoke invocation call activation', function()
		{
			var cell = new mxCell('', new mxGeometry(0, 0, 10, 80), 'html=0;points=[];perimeter=orthogonalPerimeter;');
			cell.vertex = true;

			var edge = new mxCell('dispatch', new mxGeometry(0, 0, 0, 0), 'html=0;verticalAlign=bottom;startArrow=oval;endArrow=block;startSize=8;');
			edge.geometry.setTerminalPoint(new mxPoint(-60, 0), true);
			edge.geometry.relative = true;
			edge.edge = true;

			cell.insertEdge(edge, false);

			return sb.createVertexTemplateFromCells([cell, edge], 10, 80, 'Found Message');
		}),
		this.addEntry('uml sequence invoke call delegation synchronous invocation activation', function()
		{
			var cell = new mxCell('', new mxGeometry(0, 0, 10, 80), 'html=0;points=[];perimeter=orthogonalPerimeter;');
			cell.vertex = true;

			var edge1 = new mxCell('dispatch', new mxGeometry(0, 0, 0, 0), 'html=0;verticalAlign=bottom;endArrow=block;entryX=0;entryY=0;');
			edge1.geometry.setTerminalPoint(new mxPoint(-70, 0), true);
			edge1.geometry.relative = true;
			edge1.edge = true;

			cell.insertEdge(edge1, false);

			var edge2 = new mxCell('return', new mxGeometry(0, 0, 0, 0), 'html=0;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;exitX=0;exitY=0.95;');
			edge2.geometry.setTerminalPoint(new mxPoint(-70, 76), false);
			edge2.geometry.relative = true;
			edge2.edge = true;

			cell.insertEdge(edge2, true);

			return sb.createVertexTemplateFromCells([cell, edge1, edge2], 10, 80, 'Synchronous Invocation');
		}),
		this.addEntry('uml sequence self call recursion delegation activation', function()
		{
			var cell = new mxCell('', new mxGeometry(0, 20, 10, 40), 'html=0;points=[];perimeter=orthogonalPerimeter;');
			cell.vertex = true;

			var edge = new mxCell('self call', new mxGeometry(0, 0, 0, 0), 'edgeStyle=orthogonalEdgeStyle;html=0;align=left;spacingLeft=2;endArrow=block;rounded=0;entryX=1;entryY=0;');
			edge.geometry.setTerminalPoint(new mxPoint(5, 0), true);
			edge.geometry.points = [new mxPoint(30, 0)];
			edge.geometry.relative = true;
			edge.edge = true;

			cell.insertEdge(edge, false);

			return sb.createVertexTemplateFromCells([cell, edge], 10, 60, 'Self Call');
		}),
		this.addEntry('uml sequence invoke call delegation callback activation', function()
		{
			// TODO: Check if more entries should be converted to compressed XML
			return sb.createVertexTemplateFromData('xZRNT8MwDIZ/Ta6oaymD47rBTkiTuMAxW6wmIm0q19s6fj1OE3V0Y2iCA4dK8euP2I+riGxedUuUjX52CqzIHkU2R+conKpuDtaKNDFKZAuRpgl/In264J303qSRCDVdk5CGhJ20WwhKEFo62ChoqritxURkReNMTa2X80LkC68AmgoIkEWHpF3pamlXR7WIFwASdBeb7KXY4RIc5+KBQ/ZGkY4RYY5Egyl1zLqLmmyDXQ6Zx4n5EIf+HkB2BmAjrV3LzftPIPw4hgNn1pQ1a2tH5Cp2QK1miG7vNeu4iJe4pdeY2BtvbCQDGlAljMCQxBJotJ8rWCFYSWY3LvUdmZi68rvkkLiU6QnL1m1xAzHoBOdw61WEb88II9AW67/ydQ2wq1Cy1aAGvOrFfPh6997qDA3g+dxzv3nIL6MPU/8T+kMw8+m4QPgdfrEJNo8PSQj/+s58Ag==',
				10, 60, 'Callback');
		}),
		this.createVertexTemplateEntry('html=0;points=[];perimeter=orthogonalPerimeter;', 10, 80, '', 'Activation', null, null, 'uml sequence activation'),

		this.createEdgeTemplateEntry('html=0;verticalAlign=bottom;startArrow=oval;startFill=1;endArrow=block;startSize=8;', 60, 0, 'dispatch', 'Found Message 1', null, 'uml sequence message call invoke dispatch'),
		this.createEdgeTemplateEntry('html=0;verticalAlign=bottom;startArrow=circle;startFill=1;endArrow=open;startSize=6;endSize=8;', 80, 0, 'dispatch', 'Found Message 2', null, 'uml sequence message call invoke dispatch'),
		this.createEdgeTemplateEntry('html=0;verticalAlign=bottom;endArrow=block;', 80, 0, 'dispatch', 'Message', null, 'uml sequence message call invoke dispatch'),
		this.addEntry('uml sequence return message', function()
		{
			var edge = new mxCell('return', new mxGeometry(0, 0, 0, 0), 'html=0;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;');
			edge.geometry.setTerminalPoint(new mxPoint(80, 0), true);
			edge.geometry.setTerminalPoint(new mxPoint(0, 0), false);
			edge.geometry.relative = true;
			edge.edge = true;

			return sb.createEdgeTemplateFromCells([edge], 80, 0, 'Return');
		}),
		this.addEntry('uml relation', function()
		{
			var edge = new mxCell('name', new mxGeometry(0, 0, 0, 0), 'endArrow=block;endFill=1;html=0;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=top;');
			edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
			edge.geometry.relative = true;
			edge.geometry.x = -1;
			edge.edge = true;

			var cell = new mxCell('1', new mxGeometry(-1, 0, 0, 0), 'edgeLabel;resizable=0;html=0;align=left;verticalAlign=bottom;');
			cell.geometry.relative = true;
			cell.setConnectable(false);
			cell.vertex = true;
			edge.insert(cell);

			return sb.createEdgeTemplateFromCells([edge], 160, 0, 'Relation 1');
		}),
		this.addEntry('uml association', function()
		{
			var edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'endArrow=none;html=0;edgeStyle=orthogonalEdgeStyle;');
			edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
			edge.geometry.relative = true;
			edge.edge = true;

			var cell1 = new mxCell('parent', new mxGeometry(-1, 0, 0, 0), 'edgeLabel;resizable=0;html=0;align=left;verticalAlign=bottom;');
			cell1.geometry.relative = true;
			cell1.setConnectable(false);
			cell1.vertex = true;
			edge.insert(cell1);

			var cell2 = new mxCell('child', new mxGeometry(1, 0, 0, 0), 'edgeLabel;resizable=0;html=0;align=right;verticalAlign=bottom;');
			cell2.geometry.relative = true;
			cell2.setConnectable(false);
			cell2.vertex = true;
			edge.insert(cell2);

			return sb.createEdgeTemplateFromCells([edge], 160, 0, 'Association 1');
		}),
		this.addEntry('uml aggregation', function()
		{
			var edge = new mxCell('1', new mxGeometry(0, 0, 0, 0), 'endArrow=open;html=0;endSize=12;startArrow=diamondThin;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;');
			edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
			edge.geometry.relative = true;
			edge.geometry.x = -1;
			edge.geometry.y = 3;
			edge.edge = true;

			return sb.createEdgeTemplateFromCells([edge], 160, 0, 'Aggregation 1');
		}),
		this.addEntry('uml composition', function()
		{
			var edge = new mxCell('1', new mxGeometry(0, 0, 0, 0), 'endArrow=open;html=0;endSize=12;startArrow=diamondThin;startSize=14;startFill=1;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;');
			edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
			edge.geometry.relative = true;
			edge.geometry.x = -1;
			edge.geometry.y = 3;
			edge.edge = true;

			return sb.createEdgeTemplateFromCells([edge], 160, 0, 'Composition 1');
		}),
		this.addEntry('uml relation', function()
		{
			var edge = new mxCell('Relation', new mxGeometry(0, 0, 0, 0), 'endArrow=open;html=0;endSize=12;startArrow=diamondThin;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;');
			edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
			edge.geometry.setTerminalPoint(new mxPoint(160, 0), false);
			edge.geometry.relative = true;
			edge.edge = true;

			var cell1 = new mxCell('0..n', new mxGeometry(-1, 0, 0, 0), 'edgeLabel;resizable=0;html=0;align=left;verticalAlign=top;');
			cell1.geometry.relative = true;
			cell1.setConnectable(false);
			cell1.vertex = true;
			edge.insert(cell1);

			var cell2 = new mxCell('1', new mxGeometry(1, 0, 0, 0), 'edgeLabel;resizable=0;html=0;align=right;verticalAlign=top;');
			cell2.geometry.relative = true;
			cell2.setConnectable(false);
			cell2.vertex = true;
			edge.insert(cell2);

			return sb.createEdgeTemplateFromCells([edge], 160, 0, 'Relation 2');
		}),
		this.createEdgeTemplateEntry('endArrow=open;endSize=12;dashed=1;html=0;', 160, 0, 'Use', 'Dependency', null, 'uml dependency use'),
		this.createEdgeTemplateEntry('endArrow=block;endSize=16;endFill=0;html=0;', 160, 0, 'Extends', 'Generalization', null, 'uml generalization extend'),
		this.createEdgeTemplateEntry('endArrow=block;startArrow=block;endFill=1;startFill=1;html=0;', 160, 0, '', 'Association 2', null, 'uml association'),
		this.createEdgeTemplateEntry('endArrow=open;startArrow=circlePlus;endFill=0;startFill=0;endSize=8;html=0;', 160, 0, '', 'Inner Class', null, 'uml inner class'),
		this.createEdgeTemplateEntry('endArrow=open;startArrow=cross;endFill=0;startFill=0;endSize=8;startSize=10;html=0;', 160, 0, '', 'Terminate', null, 'uml terminate'),
		this.createEdgeTemplateEntry('endArrow=block;dashed=1;endFill=0;endSize=12;html=0;', 160, 0, '', 'Implementation', null, 'uml realization implementation'),
		this.createEdgeTemplateEntry('endArrow=diamondThin;endFill=0;endSize=24;html=0;', 160, 0, '', 'Aggregation 2', null, 'uml aggregation'),
		this.createEdgeTemplateEntry('endArrow=diamondThin;endFill=1;endSize=24;html=0;', 160, 0, '', 'Composition 2', null, 'uml composition'),
		this.createEdgeTemplateEntry('endArrow=open;endFill=1;endSize=12;html=0;', 160, 0, '', 'Association 3', null, 'uml association')
	];

	this.addPaletteFunctions('uml', mxResources.get('uml'), expand || false, fns);
	this.setCurrentSearchEntryLibrary();
};

Sidebar.prototype.addBpmnPalette = function(dir, expand)
{
	// Avoids having to bind all functions to "this"
	var sb = this;
	this.setCurrentSearchEntryLibrary('bpmn');

	var fns =
		[
			this.createVertexTemplateEntry('shape=ext;rounded=1;html=0;', 120, 80, 'Task', 'Process', null, null, 'bpmn task process'),
			this.createVertexTemplateEntry('shape=ext;rounded=1;html=0;double=1;', 120, 80, 'Transaction', 'Transaction', null, null, 'bpmn transaction'),
			this.createVertexTemplateEntry('shape=ext;rounded=1;html=0;dashed=1;dashPattern=1 4;', 120, 80, 'Event\nSub-Process', 'Event Sub-Process', null, null, 'bpmn event subprocess sub process sub-process'),
			this.createVertexTemplateEntry('shape=ext;rounded=1;html=0;strokeWidth=3;', 120, 80, 'Call Activity', 'Call Activity', null, null, 'bpmn call activity'),
			this.addEntry('bpmn subprocess sub process sub-process', function()
			{
				var cell = new mxCell('Sub-Process', new mxGeometry(0, 0, 120, 80), 'html=0;rounded=1;dropTarget=0;');
				cell.vertex = true;

				var cell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=0;shape=plus;outlineConnect=0;');
				cell1.vertex = true;
				cell1.geometry.relative = true;
				cell1.geometry.offset = new mxPoint(-7, -14);
				cell.insert(cell1);

				return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Sub-Process');
			}),
			this.addEntry(this.getTagsForStencil('mxgraph.bpmn', 'loop', 'subprocess sub process sub-process looped').join(' '), function()
			{
				var cell = new mxCell('Looped\nSub-Process', new mxGeometry(0, 0, 120, 80), 'html=0;rounded=1;dropTarget=0;');
				cell.vertex = true;

				var cell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=0;shape=mxgraph.bpmn.loop;outlineConnect=0;');
				cell1.vertex = true;
				cell1.geometry.relative = true;
				cell1.geometry.offset = new mxPoint(-15, -14);
				cell.insert(cell1);

				var cell2 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=0;shape=plus;');
				cell2.vertex = true;
				cell2.geometry.relative = true;
				cell2.geometry.offset = new mxPoint(1, -14);
				cell.insert(cell2);

				return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Looped Sub-Process');
			}),
			this.addEntry('bpmn receive task', function()
			{
				var cell = new mxCell('Receive', new mxGeometry(0, 0, 120, 80), 'html=0;rounded=1;dropTarget=0;');
				cell.vertex = true;

				var cell1 = new mxCell('', new mxGeometry(0, 0, 20, 14), 'html=0;shape=message;outlineConnect=0;');
				cell1.vertex = true;
				cell1.geometry.relative = true;
				cell1.geometry.offset = new mxPoint(7, 7);
				cell.insert(cell1);

				return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Receive Task');
			}),
			this.addEntry(this.getTagsForStencil('mxgraph.bpmn', 'user_task').join(' '), function()
			{
				var cell = new mxCell('User', new mxGeometry(0, 0, 120, 80), 'html=0;rounded=1;dropTarget=0;');
				cell.vertex = true;

				var cell1 = new mxCell('', new mxGeometry(0, 0, 14, 14), 'html=0;shape=mxgraph.bpmn.user_task;outlineConnect=0;');
				cell1.vertex = true;
				cell1.geometry.relative = true;
				cell1.geometry.offset = new mxPoint(7, 7);
				cell.insert(cell1);

				var cell2 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=0;shape=plus;outlineConnect=0;');
				cell2.vertex = true;
				cell2.geometry.relative = true;
				cell2.geometry.offset = new mxPoint(-7, -14);
				cell.insert(cell2);

				return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'User Task');
			}),
			this.addEntry(this.getTagsForStencil('mxgraph.bpmn', 'timer_start', 'attached').join(' '), function()
			{
				var cell = new mxCell('Process', new mxGeometry(0, 0, 120, 80), 'html=0;rounded=1;dropTarget=0;');
				cell.vertex = true;

				var cell1 = new mxCell('', new mxGeometry(1, 1, 30, 30), 'shape=mxgraph.bpmn.timer_start;perimeter=ellipsePerimeter;html=0;verticalLabelPosition=bottom;verticalAlign=top;outlineConnect=0;');
				cell1.vertex = true;
				cell1.geometry.relative = true;
				cell1.geometry.offset = new mxPoint(-40, -15);
				cell.insert(cell1);

				return sb.createVertexTemplateFromCells([cell], 120, 95, 'Attached Timer Event 1');
			}),
			this.addEntry(this.getTagsForStencil('mxgraph.bpmn', 'timer_start', 'attached').join(' '), function()
			{
				var cell = new mxCell('Process', new mxGeometry(0, 0, 120, 80), 'html=0;rounded=1;dropTarget=0;');
				cell.vertex = true;

				var cell1 = new mxCell('', new mxGeometry(1, 0, 30, 30), 'shape=mxgraph.bpmn.timer_start;perimeter=ellipsePerimeter;html=0;labelPosition=right;align=left;outlineConnect=0;');
				cell1.vertex = true;
				cell1.geometry.relative = true;
				cell1.geometry.offset = new mxPoint(-15, 10);
				cell.insert(cell1);

				return sb.createVertexTemplateFromCells([cell], 135, 80, 'Attached Timer Event 2');
			}),
			this.createVertexTemplateEntry('swimlane;html=0;horizontal=0;startSize=20;', 320, 240, 'Pool', 'Pool', null, null, 'bpmn pool'),
			this.createVertexTemplateEntry('swimlane;html=0;horizontal=0;swimlaneLine=0;', 300, 120, 'Lane', 'Lane', null, null, 'bpmn lane'),
			this.createVertexTemplateEntry('shape=hexagon;html=0;perimeter=hexagonPerimeter;rounded=0;', 60, 50, '', 'Conversation', null, null, 'bpmn conversation'),
			this.createVertexTemplateEntry('shape=hexagon;html=0;perimeter=hexagonPerimeter;strokeWidth=4;rounded=0;', 60, 50, '', 'Call Conversation', null, null, 'bpmn call conversation'),
			this.addEntry('bpmn subconversation sub conversation sub-conversation', function()
			{
				var cell = new mxCell('', new mxGeometry(0, 0, 60, 50), 'shape=hexagon;html=0;perimeter=hexagonPerimeter;rounded=0;dropTarget=0;');
				cell.vertex = true;

				var cell1 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=0;shape=plus;');
				cell1.vertex = true;
				cell1.geometry.relative = true;
				cell1.geometry.offset = new mxPoint(-7, -14);
				cell.insert(cell1);

				return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Sub-Conversation');
			}),
			this.addEntry('bpmn data object', function()
			{
				var cell = new mxCell('', new mxGeometry(0, 0, 40, 60), 'shape=note;size=16;html=0;dropTarget=0;');
				cell.vertex = true;

				var cell1 = new mxCell('', new mxGeometry(0, 0, 14, 14), 'html=0;shape=singleArrow;arrowWidth=0.4;arrowSize=0.4;outlineConnect=0;');
				cell1.vertex = true;
				cell1.geometry.relative = true;
				cell1.geometry.offset = new mxPoint(2, 2);
				cell.insert(cell1);

				var cell2 = new mxCell('', new mxGeometry(0.5, 1, 14, 14), 'html=0;shape=parallelMarker;outlineConnect=0;');
				cell2.vertex = true;
				cell2.geometry.relative = true;
				cell2.geometry.offset = new mxPoint(-7, -14);
				cell.insert(cell2);

				return sb.createVertexTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Data Object');
			}),
			this.createVertexTemplateEntry('shape=datastore;html=0;', 60, 60, '', 'Data Store', null, null, 'bpmn data store'),
			this.createVertexTemplateEntry('shape=plus;html=0;outlineConnect=0;', 14, 14, '', 'Sub-Process Marker', null, null, 'bpmn subprocess sub process sub-process marker'),
			this.createVertexTemplateEntry('shape=mxgraph.bpmn.loop;html=0;outlineConnect=0;', 14, 14, '', 'Loop Marker', null, null, 'bpmn loop marker'),
			this.createVertexTemplateEntry('shape=parallelMarker;html=0;outlineConnect=0;', 14, 14, '', 'Parallel MI Marker', null, null, 'bpmn parallel mi marker'),
			this.createVertexTemplateEntry('shape=parallelMarker;direction=south;html=0;outlineConnect=0;', 14, 14, '', 'Sequential MI Marker', null, null, 'bpmn sequential mi marker'),
			this.createVertexTemplateEntry('shape=mxgraph.bpmn.ad_hoc;fillColor=#000000;html=0;outlineConnect=0;', 14, 14, '', 'Ad Hoc Marker', null, null, 'bpmn ad hoc marker'),
			this.createVertexTemplateEntry('shape=mxgraph.bpmn.compensation;html=0;outlineConnect=0;', 14, 14, '', 'Compensation Marker', null, null, 'bpmn compensation marker'),
			this.createVertexTemplateEntry('shape=message;html=0;outlineConnect=0;fillColor=#000000;strokeColor=#ffffff;strokeWidth=2;', 40, 30, '', 'Send Task', null, null, 'bpmn send task'),
			this.createVertexTemplateEntry('shape=message;html=0;outlineConnect=0;', 40, 30, '', 'Receive Task', null, null, 'bpmn receive task'),
			this.createVertexTemplateEntry('shape=mxgraph.bpmn.user_task;html=0;outlineConnect=0;', 14, 14, '', 'User Task', null, null, this.getTagsForStencil('mxgraph.bpmn', 'user_task').join(' ')),
			this.createVertexTemplateEntry('shape=mxgraph.bpmn.manual_task;html=0;outlineConnect=0;', 14, 14, '', 'Manual Task', null, null, this.getTagsForStencil('mxgraph.bpmn', 'user_task').join(' ')),
			this.createVertexTemplateEntry('shape=mxgraph.bpmn.business_rule_task;html=0;outlineConnect=0;', 14, 14, '', 'Business Rule Task', null, null, this.getTagsForStencil('mxgraph.bpmn', 'business_rule_task').join(' ')),
			this.createVertexTemplateEntry('shape=mxgraph.bpmn.service_task;html=0;outlineConnect=0;', 14, 14, '', 'Service Task', null, null, this.getTagsForStencil('mxgraph.bpmn', 'service_task').join(' ')),
			this.createVertexTemplateEntry('shape=mxgraph.bpmn.script_task;html=0;outlineConnect=0;', 14, 14, '', 'Script Task', null, null, this.getTagsForStencil('mxgraph.bpmn', 'script_task').join(' ')),
			this.createVertexTemplateEntry('html=0;shape=mxgraph.flowchart.annotation_2;align=left;labelPosition=right;', 50, 100, '', 'Annotation', null, null, this.getTagsForStencil('bpmn', 'annotation_1', 'bpmn business process model ').join(' ')),
			this.addDataEntry('crossfunctional cross-functional cross functional flowchart swimlane table', 400, 400, 'Cross-Functional Flowchart', '7ZhRb5swEMc/DY+bMCRt97jQpi+tVC2fwINbbMnYyD4C6aefjaHpBrTRlNCoTALJPp9t+P25O5kgTvL6XtOCPaoMRBDfBXGilULfyusEhAiikGdBfBtEUWjvIFqPjJJmNCyoBonHTIj8hB0VJXiL3dyYL+tSpsiVpM55LVSVMqrROxvci9bZMFq4JtKfzrRKGRfZA92rEjtr11tpVT1wCcYOhM5ViTKXry0G7RYb/uwWXDgDw9wCuSW2WTGOsClo6gYri8uvIGhheLN1s4KGtNSG7+AHGL+Os0JdUJm1nUJxiaDvdhZQt/EvJXHTvpTbjAq+lbadgnO1hhYSaIR6FHRjainfg8oB9d66VDxD5j0WoRcjZMC3DP8yUuMN25e5B91so5VuWMa4J+P3FJW2JtLXrOK5oNLJxZTmz/blqXhNp3mO5cpe9smS8OsyWNp5ie2TQ99ezl1joqRBTXmDAajBCgxejprHKBcNK7fvBPIz3hOSRCcQctET8olRA+8JmSopIW2j8GOD6Sji8TDxepT4C9yTE1+OEo/mQ5xcTYn8ahR5PB/k0c2UyK9HC8SbX/mnLBAnqAlD8XK+onDTE+/fw+TiQF9fTin4Nl/O0xYAEs6X9LR5n5Ae6S7xv1lr/yf+4cQ/pN75Ej/pH88/UZyQkRPzR6R+0j9Bz4f0xMm/f8adD+qzZn/bPfw5bMb++LH4Gw=='),
			this.addDataEntry('container swimlane pool horizontal', 480, 380, 'Horizontal Pool 1',
				'zZRLbsIwEIZP4709TlHXhJYNSEicwCIjbNWJkWNKwumZxA6IlrRUaisWlmb+eX8LM5mXzdyrnV66Ai2TL0zm3rkQrbLJ0VoG3BRMzhgAp8fgdSQq+ijfKY9VuKcAYsG7snuMyso5G8U6tDaJ9cGUVlXkTXUoacuZIHOjjS0WqnX7blYd1OZt8KYea3PE1bCI+CAtVUMq7/o5b46uCmroSn18WFMm+XCdse5GpLq0OPqAzejxvZQun6MrMfiWUg6mCDpmZM8RENdotjqVyUFUdRS259oLSzISztto5Se0i44gcHEn3i9A/IQB3GbQpmi69DskAn4BSTaGBB4Jicj+k8nTGBP5SExg8odMyL38eH3s6kM8AQ=='),
			this.addDataEntry('container swimlane pool horizontal', 480, 360, 'Horizontal Pool 2',
				'zZTBbsIwDIafJvfU6dDOlI0LSEg8QUQtEi1tUBJGy9PPbcJQWTsxaZs4VLJ//07sT1WYKKpm6eRBrW2JhokXJgpnbYhR1RRoDAOuSyYWDIDTx+B1opr1VX6QDutwTwPEhndpjhiVjbUmij60Jon+pCsja8rmKlQ05SKjcKe0KVeytcfuLh/k7u2SzR16fcbNZZDsRlrLhlTenWedPts6SJMEOseFLTkph6Fj212RbGlwdAGbyeV7KW2+RFthcC1ZTroMKjry5wiIK9R7ldrELInSR2H/2XtlSUHCOY5WfEG76ggCz+7E+w2InzCAcQapIf0fAySzESQZ/AKSfAoJPCKS9mbzf0H0NIVIPDAiyP8QEaXX97CvDZ7LDw=='),
			this.createVertexTemplateEntry('swimlane;startSize=20;horizontal=0;', 320, 120, 'Lane', 'Horizontal Swimlane', null, null, 'swimlane lane pool'),
			this.addDataEntry('container swimlane pool horizontal', 360, 480, 'Vertical Pool 1',
				'xZRBbsIwEEVP4709ThFrQssGJKSewCIjbNXGyDEl4fSdxKa0NJFQVTULSzP/e+T5b2EmS9esgjrqja/QMvnMZBm8j6lyTYnWMuCmYnLJADgdBi8jruhdflQBD/GRAUgD78qeMClb720S69jaLNZn46w6ULfQ0dGWS0HlThtbrVXrT91bdVS7t2u3CFibC26vi4g7aaMaUjmpNBbiKxnUQyfkjTBEbEZT9VKOtELvMIaWrpxNFXW6IWcpOddo9jqPFfMsqjoJ+8/ZGyQqMqdhZvIHs3WHBrh4kNvvIsNw5Da7OdgXAgKGCMz+gEAxRgCmINDcxZ2CyNMYETkhESj+jwi1t1+r9759ah8='),
			this.addDataEntry('container swimlane pool vertical', 380, 480, 'Vertical Pool 2',
				'xZTPbsIwDMafJvf86dDOlI0LSEg8QUQtEi1pUBJGy9PPbdJ1G1TqhXGoZH/219g/RSGitM3ay5PaugoMEW9ElN65mCLblGAM4VRXRKwI5xQ/wt8nqqyv0pP0UMc5Bp4Mn9KcISk750wSQ2xNFsNFWyNrzJYqWpxyxTA8KG2qjWzduTsrRHn4GLKlh6CvsBsGYX+krWxQpaiizcc9FjDnnaCc11dXR2lyxyjsuyPy3/Lg4CM0k8v3Ut58Dc5C9C22XHQVVeoQrwkQVaCPKtuKQZQhCcdv78gSg4zzPlpxg3bTEeSUzcR7Q2bWyvz+ytmQr8NPAow/ikAxRYA/kQAr/hPByxQC8cxLsHggAkzH56uv/XrdvgA='),
			this.createVertexTemplateEntry('swimlane;startSize=20;', 120, 320, 'Lane', 'Vertical Swimlane', null, null, 'swimlane lane pool'),
			this.createVertexTemplateEntry('rounded=1;arcSize=10;dashed=1;strokeColor=#000000;fillColor=none;gradientColor=none;dashPattern=8 3 1 3;strokeWidth=2;',
				200, 200, '', 'Group', null, null, this.getTagsForStencil('bpmn', 'group', 'bpmn business process model ').join(' ')),
			this.createEdgeTemplateEntry('endArrow=block;endFill=1;endSize=6;html=0;', 100, 0, '', 'Sequence Flow', null, 'bpmn sequence flow'),
			this.createEdgeTemplateEntry('startArrow=dash;startSize=8;endArrow=block;endFill=1;endSize=6;html=0;', 100, 0, '', 'Default Flow', null, 'bpmn default flow'),
			this.createEdgeTemplateEntry('startArrow=diamondThin;startFill=0;startSize=14;endArrow=block;endFill=1;endSize=6;html=0;', 100, 0, '', 'Conditional Flow', null, 'bpmn conditional flow'),
			this.createEdgeTemplateEntry('startArrow=oval;startFill=0;startSize=7;endArrow=block;endFill=0;endSize=10;dashed=1;html=0;', 100, 0, '', 'Message Flow 1', null, 'bpmn message flow'),
			this.addEntry('bpmn message flow', function()
			{
				var edge = new mxCell('', new mxGeometry(0, 0, 0, 0), 'startArrow=oval;startFill=0;startSize=7;endArrow=block;endFill=0;endSize=10;dashed=1;html=0;');
				edge.geometry.setTerminalPoint(new mxPoint(0, 0), true);
				edge.geometry.setTerminalPoint(new mxPoint(100, 0), false);
				edge.geometry.relative = true;
				edge.edge = true;

				var cell = new mxCell('', new mxGeometry(0, 0, 20, 14), 'shape=message;html=0;outlineConnect=0;');
				cell.geometry.relative = true;
				cell.vertex = true;
				cell.geometry.offset = new mxPoint(-10, -7);
				edge.insert(cell);

				return sb.createEdgeTemplateFromCells([edge], 100, 0, 'Message Flow 2');
			}),
			this.createEdgeTemplateEntry('shape=link;html=0;', 100, 0, '', 'Link', null, 'bpmn link')
		];

	this.addPaletteFunctions('bpmn', 'BPMN ' + mxResources.get('general'), false, fns);
	this.setCurrentSearchEntryLibrary();
};
  
Sidebar.prototype.addanimalOrgansPalette = function (expand) {

	this.setCurrentSearchEntryLibrary('animalOrgans', 'animalOrgans');
	var fns = [
		this.createVertexTemplateEntry('shape=m167a5c122b430d594da8eae961f803f;strokeColor=#333;fillColor=#ddd', 58, 69,null, '2个血红细胞'),
		this.createVertexTemplateEntry('shape=m3309b453dcd87155beed2f34f7bfce6;strokeColor=#333;fillColor=#ddd', 60, 45,null, '3个血红细胞'),
		this.createVertexTemplateEntry('shape=m96c983d4290901e4060ffe25e7c0eb3;strokeColor=#333;fillColor=#ddd', 59, 59,null, 'DNA'),
		this.createVertexTemplateEntry('shape=m6814e9418c50f60af8f396808c45f0e;strokeColor=#333;fillColor=#ddd', 111, 151,null, 'DNA-1'),
		this.createVertexTemplateEntry('shape=m41b9d4b2fd5f3c4d4bc3a1bbfe1fdb5;strokeColor=#333;fillColor=#ddd', 44, 55,null, 'DNA-2'),
		this.createVertexTemplateEntry('shape=m8d6b309ad1b7d568890f078b2ddec5c;strokeColor=#333;fillColor=#ddd', 171, 36,null, 'DNA-3'),
		this.createVertexTemplateEntry('shape=m66bce95fc4de436933e66d94fb85cd7;strokeColor=#333;fillColor=#ddd', 38, 48,null, 'DNA-4'),
		this.createVertexTemplateEntry('shape=m8fdd6372af84e7051e9b15b670b2241;strokeColor=#333;fillColor=#ddd', 38, 49,null, 'DNA-5'),
		this.createVertexTemplateEntry('shape=mfc2d66edb8750a29f927cb7e682b570;strokeColor=#333;fillColor=#ddd', 40, 53,null, 'DNA-6'),
		this.createVertexTemplateEntry('shape=maf0b038a52f5045fe719681ff7fadef;strokeColor=#333;fillColor=#ddd', 36, 45,null, 'DNA双螺旋'),
		this.createVertexTemplateEntry('shape=m066df2be7e6fa4a45a33c116425d4b6;strokeColor=#333;fillColor=#ddd', 54, 54,null, 'DNA-斜'),
		this.createVertexTemplateEntry('shape=m0d0179a76fd45d515374a132b8c6a5d;strokeColor=#333;fillColor=#ddd', 70, 50,null, '膀胱'),
		this.createVertexTemplateEntry('shape=mbf53f44d2557f0565a251921bdc1a89;strokeColor=#333;fillColor=#ddd', 36, 52,null, '鼻'),
		this.createVertexTemplateEntry('shape=medd77dd2815db5716724a144836e77a;strokeColor=#333;fillColor=#ddd', 38, 58,null, '肠胃-面性'),
		this.createVertexTemplateEntry('shape=m9af93e55ddbf3258e147851b24fb1d4;strokeColor=#333;fillColor=#ddd', 37, 58,null, '肠胃-线性'),
		this.createVertexTemplateEntry('shape=mfcd326e60937533a627e43270b83fa5;strokeColor=#333;fillColor=#ddd', 61, 56,null, '大肠'),
		this.createVertexTemplateEntry('shape=m6972de841e2a89beb113c0e95069b08;strokeColor=#333;fillColor=#ddd', 55, 55,null, '大肠-面性'),
		this.createVertexTemplateEntry('shape=mc37db42eb15f0b64c05e56e7a9c1a08;strokeColor=#333;fillColor=#ddd', 62, 62,null, '大肠-线性'),
		this.createVertexTemplateEntry('shape=m019b1add16866f76dc9f2ed6feff23e;strokeColor=#333;fillColor=#ddd', 45, 51,null, '大脑皮层'),
		this.createVertexTemplateEntry('shape=m331817df08584ac680507f3b8dccd69;strokeColor=#333;fillColor=#ddd', 73, 73,null, '动物细胞'),
		this.createVertexTemplateEntry('shape=m2507462c9a26d733b3828b0fd0bc642;strokeColor=#333;fillColor=#ddd', 36, 64,null, '耳朵'),
		this.createVertexTemplateEntry('shape=m07b117d604dfcfa432afd331a7723d7;strokeColor=#333;fillColor=#ddd', 60, 60,null, '发根-面性'),
		this.createVertexTemplateEntry('shape=m33500ae9b6065004aa151930a0cfc8e;strokeColor=#333;fillColor=#ddd', 61, 60,null, '发根-线性'),
		this.createVertexTemplateEntry('shape=m365ff1b5e3655cc2140517dd31242c3;strokeColor=#333;fillColor=#ddd', 54, 57,null, '肺'),
		this.createVertexTemplateEntry('shape=m991e34c5110790dcf097947669dcf43;strokeColor=#333;fillColor=#ddd', 39, 39,null, '肺-抽象-面性'),
		this.createVertexTemplateEntry('shape=m4ad5e90390e9c4016098e1b4f907091;strokeColor=#333;fillColor=#ddd', 39, 36,null, '肺-抽象-线性'),
		this.createVertexTemplateEntry('shape=m024ed4cbadf16847bade071a01680ed;strokeColor=#333;fillColor=#ddd', 45, 38,null, '肺-简约-面性'),
		this.createVertexTemplateEntry('shape=mbe465ec1cce64d6dcec80b735e50f1a;strokeColor=#333;fillColor=#ddd', 53, 47,null, '肺-简约-线性'),
		this.createVertexTemplateEntry('shape=m7dbddc3af02bdf7b9caddfa0422f7ef;strokeColor=#333;fillColor=#ddd', 44, 40,null, '肺-面性'),
		this.createVertexTemplateEntry('shape=m218caffdc7c6e55ccf0c075f16faa70;strokeColor=#333;fillColor=#ddd', 43, 40,null, '肺-线性'),
		this.createVertexTemplateEntry('shape=m02cdf76ff4fa1612146d1f59fe7fd72;strokeColor=#333;fillColor=#ddd', 65, 56,null, '分裂'),
		this.createVertexTemplateEntry('shape=m8729c6577808ec0b5cacf1e6b6a4422;strokeColor=#333;fillColor=#ddd', 59, 36,null, '肝'),
		this.createVertexTemplateEntry('shape=m6ba6722e61e3401346a7fc9d3fd2f59;strokeColor=#333;fillColor=#ddd', 39, 36,null, '肝-粗-面性'),
		this.createVertexTemplateEntry('shape=m2f2728f3aecf541fcc0e4af18247f80;strokeColor=#333;fillColor=#ddd', 44, 40,null, '肝-粗-线性'),
		this.createVertexTemplateEntry('shape=ma2304435643f8f75f38e7dd5bb54ce6;strokeColor=#333;fillColor=#ddd', 39, 39,null, '肝-面性'),
		this.createVertexTemplateEntry('shape=maf9302ed248d38c18aeea4d15c095e3;strokeColor=#333;fillColor=#ddd', 36, 36,null, '肝-线性'),
		this.createVertexTemplateEntry('shape=m3fe87734e10aa9fccd33d2959b232c8;strokeColor=#333;fillColor=#ddd', 34, 14,null, '高尔基体'),
		this.createVertexTemplateEntry('shape=m632c587e1d403eb615f81083f749b8f;strokeColor=#333;fillColor=#ddd', 41, 59,null, '关节-面性'),
		this.createVertexTemplateEntry('shape=mdd9b4ba93d0bb95a7ec9ffd163f17b1;strokeColor=#333;fillColor=#ddd', 43, 60,null, '关节-线性'),
		this.createVertexTemplateEntry('shape=mbe6318776043c40bc80ec59e356b31f;strokeColor=#333;fillColor=#ddd', 62, 62,null, '横状血管+红细胞'),
		this.createVertexTemplateEntry('shape=m1d7381f130d96c9d48601440f23fcf8;strokeColor=#333;fillColor=#ddd', 12, 9,null, '红细胞'),
		this.createVertexTemplateEntry('shape=m87c12926ff1d03cae59559ef1dcfb0e;strokeColor=#333;fillColor=#ddd', 45, 62,null, '脊柱'),
		this.createVertexTemplateEntry('shape=m2d3a09562be49d34420fea8f70ffc86;strokeColor=#333;fillColor=#ddd', 31, 59,null, '脊椎-粗-面性'),
		this.createVertexTemplateEntry('shape=m3232d1a9ce9decc7ffa6c8217cae546;strokeColor=#333;fillColor=#ddd', 32, 61,null, '脊椎-粗-线性'),
		this.createVertexTemplateEntry('shape=m026c3c21b350458f683ee4cb508c094;strokeColor=#333;fillColor=#ddd', 42, 58,null, '脊椎-面性'),
		this.createVertexTemplateEntry('shape=m71624b4cb07f037b28331e3b9fd657f;strokeColor=#333;fillColor=#ddd', 43, 58,null, '脊椎-线性'),
		this.createVertexTemplateEntry('shape=m858cfec6fff9d1b2a0241b6617d9d39;strokeColor=#333;fillColor=#ddd', 45, 44,null, '精子'),
		this.createVertexTemplateEntry('shape=m4de8032b73b644a0c846b72b53430ec;strokeColor=#333;fillColor=#ddd', 51, 49,null, '老鼠-面性'),
		this.createVertexTemplateEntry('shape=m0add1e3593f2a76f792ef7f1f5f3086;strokeColor=#333;fillColor=#ddd', 56, 58,null, '老鼠-线性'),
		this.createVertexTemplateEntry('shape=mb95ca882faa12d2731c784ecab79403;strokeColor=#333;fillColor=#ddd', 63, 46,null, '卵巢'),
		this.createVertexTemplateEntry('shape=m502370f61c49b8198626565e56a9de2;strokeColor=#333;fillColor=#ddd', 57, 57,null, '毛发'),
		this.createVertexTemplateEntry('shape=m3ddbbb5007efb835daf27b23844c3f7;strokeColor=#333;fillColor=#ddd', 51, 54,null, '脑部-抽象-面性'),
		this.createVertexTemplateEntry('shape=m7ff3888b6e74c5347a94b960e8fd86c;strokeColor=#333;fillColor=#ddd', 54, 54,null, '脑部-抽象-线性'),
		this.createVertexTemplateEntry('shape=m933365da29fae51d22656932e61ec57;strokeColor=#333;fillColor=#ddd', 49, 53,null, '脑部-面性'),
		this.createVertexTemplateEntry('shape=mfb2205962f8d3c42e6d899229d481df;strokeColor=#333;fillColor=#ddd', 50, 54,null, '脑部-线性'),
		this.createVertexTemplateEntry('shape=m815b0f00996b37e234532577bf34063;strokeColor=#333;fillColor=#ddd', 62, 56,null, '脑干'),
		this.createVertexTemplateEntry('shape=mf0021eefdc3d29bb4316629cf957adf;strokeColor=#333;fillColor=#ddd', 51, 57,null, '脑干-面性'),
		this.createVertexTemplateEntry('shape=m252857241c7796d5e184c3dabf3e12e;strokeColor=#333;fillColor=#ddd', 51, 55,null, '脑干-线性'),
		this.createVertexTemplateEntry('shape=m4db2464b7a932e691d60c4dd77ee790;strokeColor=#333;fillColor=#ddd', 173, 106,null, '皮肤结构-面性'),
		this.createVertexTemplateEntry('shape=m5975c3ca06d3a8a9fde568229e14797;strokeColor=#333;fillColor=#ddd', 128, 79,null, '皮肤结构-线性'),
		this.createVertexTemplateEntry('shape=md967bf0ddbd4be5795045f4c8e4c0ab;strokeColor=#333;fillColor=#ddd', 38, 59,null, '舌头'),
		this.createVertexTemplateEntry('shape=m384085058e7da0fd7ee250588878b1d;strokeColor=#333;fillColor=#ddd', 50, 50,null, '神经'),
		this.createVertexTemplateEntry('shape=m8f955fee7bad20c01cf206461e6c88c;strokeColor=#333;fillColor=#ddd', 56, 52,null, '神经细胞体-抽象'),
		this.createVertexTemplateEntry('shape=m189c0f714e8a0f1852af3fe4921cd08;strokeColor=#333;fillColor=#ddd', 66, 68,null, '神经细胞体-简约'),
		this.createVertexTemplateEntry('shape=m7b009d6e2e77076bc589eb29ff41cc8;strokeColor=#333;fillColor=#ddd', 53, 54,null, '神经细胞体-面性'),
		this.createVertexTemplateEntry('shape=m623b28e422f7fc643acbd2c7286172a;strokeColor=#333;fillColor=#ddd', 52, 53,null, '神经细胞体-线性'),
		this.createVertexTemplateEntry('shape=mf0e34e027b2c1b9e62f9ac38e35cfb1;strokeColor=#333;fillColor=#ddd', 73, 72,null, '神经元'),
		this.createVertexTemplateEntry('shape=m8f13f3637ce6ea6214fda6b044b0ce9;strokeColor=#333;fillColor=#ddd', 53, 53,null, '神经元结构'),
		this.createVertexTemplateEntry('shape=m373b211c66b2a9bce04ee8c2fef34e4;strokeColor=#333;fillColor=#ddd', 55, 53,null, '神经元结构-1'),
		this.createVertexTemplateEntry('shape=m4274df5fa07e3f0803ea51e621a3bac;strokeColor=#333;fillColor=#ddd', 154, 78,null, '神经元细胞'),
		this.createVertexTemplateEntry('shape=m01582e54d6b6134617990092988b60c;strokeColor=#333;fillColor=#ddd', 63, 41,null, '肾'),
		this.createVertexTemplateEntry('shape=m6da8411ce163466b9c5245b185d9118;strokeColor=#333;fillColor=#ddd', 34, 49,null, '肾-面性'),
		this.createVertexTemplateEntry('shape=m6b860d5166d4ff3f3e03c6d398434c8;strokeColor=#333;fillColor=#ddd', 34, 48,null, '肾-线性'),
		this.createVertexTemplateEntry('shape=mdd6ddecb7452d0ddc75f0dc2da78757;strokeColor=#333;fillColor=#ddd', 60, 60,null, '受精'),
		this.createVertexTemplateEntry('shape=meeff5846ac4868f8911c1e3c36669e7;strokeColor=#333;fillColor=#ddd', 65, 65,null, '竖状血管+红细胞'),
		this.createVertexTemplateEntry('shape=m96e56b0249f3bd8cf99c72bee18dcc2;strokeColor=#333;fillColor=#ddd', 55, 60,null, '头骨-面性-1'),
		this.createVertexTemplateEntry('shape=m27700ed9e51e7c9a2d855c25550d41f;strokeColor=#333;fillColor=#ddd', 55, 60,null, '头骨-线性-1'),
		this.createVertexTemplateEntry('shape=mf0166d777218a214724bfd9ec4a6304;strokeColor=#333;fillColor=#ddd', 50, 52,null, '头颈-面性'),
		this.createVertexTemplateEntry('shape=m7cd7075d7385ae4e52cd215c30d364b;strokeColor=#333;fillColor=#ddd', 53, 54,null, '头颈-线性'),
		this.createVertexTemplateEntry('shape=ma31507426e5e6c20284944c7da9d5f7;strokeColor=#333;fillColor=#ddd', 54, 57,null, '头颅-面性'),
		this.createVertexTemplateEntry('shape=m9ed2d573648bea7bd2dbad358e6aa5c;strokeColor=#333;fillColor=#ddd', 54, 57,null, '头颅-线性'),
		this.createVertexTemplateEntry('shape=mef7e26e3c9f6bf6a7c11d92ace529c7;strokeColor=#333;fillColor=#ddd', 57, 52,null, '胃'),
		this.createVertexTemplateEntry('shape=m568e86474707ca176ebe54b818ea1a6;strokeColor=#333;fillColor=#ddd', 39, 39,null, '胃-面性'),
		this.createVertexTemplateEntry('shape=m280a356f57b36bfcc3a9be8350e3aa2;strokeColor=#333;fillColor=#ddd', 42, 42,null, '胃-线性'),
		this.createVertexTemplateEntry('shape=m218338a12dc9e23d6a3ee78893559f8;strokeColor=#333;fillColor=#ddd', 54, 53,null, '细胞'),
		this.createVertexTemplateEntry('shape=me0f8497791152e1efc498e1d26703c0;strokeColor=#333;fillColor=#ddd', 52, 56,null, '细胞+染色体'),
		this.createVertexTemplateEntry('shape=mb92ffc99999dbb15d21b523973ee27d;strokeColor=#333;fillColor=#ddd', 70, 70,null, '细胞-1'),
		this.createVertexTemplateEntry('shape=m471c640afecdef51f8de1a7ed70c583;strokeColor=#333;fillColor=#ddd', 52, 52,null, '细胞-2'),
		this.createVertexTemplateEntry('shape=mf8bac340489979b6d89710b77fcb3b1;strokeColor=#333;fillColor=#ddd', 64, 64,null, '细胞-3'),
		this.createVertexTemplateEntry('shape=mc66600cc0cdff28cd0e58ac34510cd5;strokeColor=#333;fillColor=#ddd', 52, 52,null, '细胞核'),
		this.createVertexTemplateEntry('shape=m4f24714c5d3b82e4e13e136d361dda3;strokeColor=#333;fillColor=#ddd', 60, 44,null, '细胞核结构'),
		this.createVertexTemplateEntry('shape=m2fd8aa31da08131c3035aa86b5b57a7;strokeColor=#333;fillColor=#ddd', 55, 40,null, '细胞-简约'),
		this.createVertexTemplateEntry('shape=m2208b6c6223aaa471b3eacb1602e64a;strokeColor=#333;fillColor=#ddd', 171, 101,null, '细胞结构-横切面'),
		this.createVertexTemplateEntry('shape=m9bbde30c1f36294436a2d33860fa6fb;strokeColor=#333;fillColor=#ddd', 149, 187,null, '细胞结构-纵切面'),
		this.createVertexTemplateEntry('shape=m050cdff2e6b7f8be27b517babc287ef;strokeColor=#333;fillColor=#ddd', 53, 53,null, '细胞-面性'),
		this.createVertexTemplateEntry('shape=m7a38ba6622db9f7b6cf7f5992e1aeb8;strokeColor=#333;fillColor=#ddd', 94, 93,null, '细胞膜'),
		this.createVertexTemplateEntry('shape=md37d5b95dffcb9f8691d3df4eb92c53;strokeColor=#333;fillColor=#ddd', 101, 82,null, '细胞透视图'),
		this.createVertexTemplateEntry('shape=mf5e1bb2280e858b6ce34cb6a0986a27;strokeColor=#333;fillColor=#ddd', 62, 62,null, '细胞-线性'),
		this.createVertexTemplateEntry('shape=m4018d6fdaf90261816b7b8cd09d9f40;strokeColor=#333;fillColor=#ddd', 68, 68,null, 'DNA转录'),
		this.createVertexTemplateEntry('shape=m4a2bb1f84fb49fb1f8bef3b26f08f7e;strokeColor=#333;fillColor=#ddd', 57, 57,null, '线粒体'),
		this.createVertexTemplateEntry('shape=m09da4716edf6e77a7e823eb80cf32fb;strokeColor=#333;fillColor=#ddd', 81, 54,null, '线粒体-1'),
		this.createVertexTemplateEntry('shape=md85110dd4367dd20375a8b21322f2f5;strokeColor=#333;fillColor=#ddd', 47, 46,null, '线粒体-2'),
		this.createVertexTemplateEntry('shape=m245eb900135e5f4d9148e4a047dc51d;strokeColor=#333;fillColor=#ddd', 55, 72,null, '心脏-1'),
		this.createVertexTemplateEntry('shape=m8ab2a1d217328b8a8ed589fbb349465;strokeColor=#333;fillColor=#ddd', 41, 61,null, '心脏-2'),
		this.createVertexTemplateEntry('shape=m7f534d8d72640a3da1f2faf061db439;strokeColor=#333;fillColor=#ddd', 37, 37,null, '心脏-抽象'),
		this.createVertexTemplateEntry('shape=m2c4d4a8dd14590f377c362633532c55;strokeColor=#333;fillColor=#ddd', 51, 49,null, '血管'),
		this.createVertexTemplateEntry('shape=ma04e28f20cf51d6ce135f99ea752baa;strokeColor=#333;fillColor=#ddd', 62, 62,null, '血管+血红细胞'),
		this.createVertexTemplateEntry('shape=mb92f94aae7e745d8b5f29e847045ed9;strokeColor=#333;fillColor=#ddd', 49, 50,null, '血管-面性'),
		this.createVertexTemplateEntry('shape=me4ff623ec431ce202cd3301af3f2a5e;strokeColor=#333;fillColor=#ddd', 53, 54,null, '血管-线性'),
		this.createVertexTemplateEntry('shape=m322388ad149ec5750db75d413bc2ca3;strokeColor=#333;fillColor=#ddd', 64, 64,null, '血红细胞-对'),
		this.createVertexTemplateEntry('shape=m96ff9d9d2ea45f0b179e47110bced14;strokeColor=#333;fillColor=#ddd', 60, 60,null, '血液+血红细胞'),
		this.createVertexTemplateEntry('shape=m638771c0d883aa614add99872bcd6d7;strokeColor=#333;fillColor=#ddd', 24, 40,null, '牙齿'),
		this.createVertexTemplateEntry('shape=m98ec5e43ba4ba42ef1eadf869ae41dc;strokeColor=#333;fillColor=#ddd', 86, 53,null, '牙齿-面性'),
		this.createVertexTemplateEntry('shape=m4601b9c191c2f080b7c7a96ea482fde;strokeColor=#333;fillColor=#ddd', 92, 57,null, '牙齿-线性'),
		this.createVertexTemplateEntry('shape=m46f5c8c6903b9f74125c4fe026e6dcd;strokeColor=#333;fillColor=#ddd', 63, 32,null, '眼睛'),
		this.createVertexTemplateEntry('shape=m02fc4d9c58f5ae14fe1c6f82a5910fb;strokeColor=#333;fillColor=#ddd', 150, 55,null, '眼睛-面性'),
		this.createVertexTemplateEntry('shape=m9ba50cdaf9e102b6a4e3354f9f43469;strokeColor=#333;fillColor=#ddd', 153, 55,null, '眼睛-线性'),
		this.createVertexTemplateEntry('shape=m8bcd35d726ab15106898f4682c7c080;strokeColor=#333;fillColor=#ddd', 24, 75,null, '有丝分裂'),
		this.createVertexTemplateEntry('shape=ma06d58cfb920dbbdb1a6cd03d833c72;strokeColor=#333;fillColor=#ddd', 63, 63,null, '支气管'),
		this.createVertexTemplateEntry('shape=m71ced421482584665e6abd37a4ad2a1;strokeColor=#333;fillColor=#ddd', 53, 44,null, '中心体'),
		this.createVertexTemplateEntry('shape=mb9a4614b598599404b3ba5e50e34f96;strokeColor=#333;fillColor=#ddd', 43, 52,null, '轴突'),
		this.createVertexTemplateEntry('shape=m169b978e93ac1da2fe0343d6dab2a20;strokeColor=#333;fillColor=#ddd', 51, 56,null, '子宫'),
		this.createVertexTemplateEntry('shape=m4dc3c62d127b87e30a05da43a645231;strokeColor=#333;fillColor=#ddd', 61, 57,null, '子宫-面性'),
		this.createVertexTemplateEntry('shape=m81292e5a94439a86cc0da4bf662c38c;strokeColor=#333;fillColor=#ddd', 61, 56,null, '子宫-线性'),
		this.createVertexTemplateEntry('shape=m697bfcf41bffc3265c0052b99e876fc;strokeColor=#333;fillColor=#ddd', 67, 47,null, '嘴'),
		this.createVertexTemplateEntry('shape=m188a23ab424f8e9e1adc0bb29c89460;strokeColor=#333;fillColor=#ddd', 69, 41,null, '嘴-线性'),
		this.createVertexTemplateEntry('shape=m163458a00d5c1ba6dc49f20e7bb4565;strokeColor=#333;fillColor=#ddd', 45, 61,null, '睾丸'),
	];
	this.addPaletteFunctions('animalOrgans', mxResources.get('animalOrgans'), (expand != null) ? expand : true, fns);
	this.setCurrentSearchEntryLibrary();
};

Sidebar.prototype.addmedicalEquipmentPalette = function (expand) {

	this.setCurrentSearchEntryLibrary('medicalEquipment', 'medicalEquipment');
	var fns = [
		this.createVertexTemplateEntry('shape=m2a0089d047a44b1965d16387979fedd;strokeColor=#333;fillColor=#ddd', 49, 50,null, '测温计'),
		this.createVertexTemplateEntry('shape=me5c30190669bb5e46a67fc8d33f772d;strokeColor=#333;fillColor=#ddd', 54, 52,null, '传染'),
		this.createVertexTemplateEntry('shape=mbbd6202c7ede531d71e9396cc668d3f;strokeColor=#333;fillColor=#ddd', 76, 76,null, '滴管+培养皿'),
		this.createVertexTemplateEntry('shape=m74899ef025c6ae09894140c6cabfd0e;strokeColor=#333;fillColor=#ddd', 72, 61,null, '电'),
		this.createVertexTemplateEntry('shape=m3bd92f3f1bdf0397b4e9ddbdefb66db;strokeColor=#333;fillColor=#ddd', 51, 52,null, '发热'),
		this.createVertexTemplateEntry('shape=m866080224575a05be2578090581d9af;strokeColor=#333;fillColor=#ddd', 44, 54,null, '防疫人员'),
		this.createVertexTemplateEntry('shape=m330ec0e8b5abafd2050d404f9aa231d;strokeColor=#333;fillColor=#ddd', 51, 51,null, '放大镜病毒'),
		this.createVertexTemplateEntry('shape=m098dfe4c030347d139b53dcf2fef7af;strokeColor=#333;fillColor=#ddd', 9, 72,null, '加热试管'),
		this.createVertexTemplateEntry('shape=m802dceea8c094ec3b2887ab8027ca52;strokeColor=#333;fillColor=#ddd', 50, 80,null, '加热圆形烧瓶'),
		this.createVertexTemplateEntry('shape=mc532709c6d6fd4fb8e04030f3a942d0;strokeColor=#333;fillColor=#ddd', 54, 54,null, '胶囊'),
		this.createVertexTemplateEntry('shape=m63129385abff4916a4899f635928b53;strokeColor=#333;fillColor=#ddd', 48, 65,null, '酒精喷灯'),
		this.createVertexTemplateEntry('shape=m978f10dfcfcc9dfa9603e7d64f243ac;strokeColor=#333;fillColor=#ddd', 51, 138,null, '酒精喷灯+锥形烧杯'),
		this.createVertexTemplateEntry('shape=m0dd94e31ce4ccb8c5b7a5b5bcd44521;strokeColor=#333;fillColor=#ddd', 8, 70,null, '空试管'),
		this.createVertexTemplateEntry('shape=mcd2f36be2b2f9bf938b829fc751e982;strokeColor=#333;fillColor=#ddd', 59, 38,null, '口罩'),
		this.createVertexTemplateEntry('shape=m7bfe5a0a11a9749370e0e86e35469d2;strokeColor=#333;fillColor=#ddd', 63, 28,null, '培养皿'),
		this.createVertexTemplateEntry('shape=m2dba4a51335b91c572d56c0136fcf78;strokeColor=#333;fillColor=#ddd', 72, 72,null, '培养皿+病毒'),
		this.createVertexTemplateEntry('shape=m9e89f26654de4ea73687b270ee3f5f4;strokeColor=#333;fillColor=#ddd', 65, 64,null, '培养皿+大肠杆菌'),
		this.createVertexTemplateEntry('shape=mb8996c213171d99df4c7c8b9794d837;strokeColor=#333;fillColor=#ddd', 48, 48,null, '培养皿+分子式'),
		this.createVertexTemplateEntry('shape=m32ca28106bbab775af712c2a168c25d;strokeColor=#333;fillColor=#ddd', 55, 55,null, '培养皿+抗体'),
		this.createVertexTemplateEntry('shape=m0288b625e6116242785c8b019fc4fa1;strokeColor=#333;fillColor=#ddd', 73, 73,null, '培养皿+细胞'),
		this.createVertexTemplateEntry('shape=m9054c03318085621cf6a9b627d4cb24;strokeColor=#333;fillColor=#ddd', 56, 56,null, '培养皿+细菌'),
		this.createVertexTemplateEntry('shape=m77a2decb3844bd6af98d122be6ec874;strokeColor=#333;fillColor=#ddd', 53, 53,null, '培养皿-空'),
		this.createVertexTemplateEntry('shape=mc88bfc874afbba17eeff5139390d2c4;strokeColor=#333;fillColor=#ddd', 60, 117,null, '瓶'),
		this.createVertexTemplateEntry('shape=mc99095b17f4ebc2dc902a52b5795046;strokeColor=#333;fillColor=#ddd', 58, 58,null, '人体病毒'),
		this.createVertexTemplateEntry('shape=m3d13ac0ee69ff1abe7c4ee5fc5f1c52;strokeColor=#333;fillColor=#ddd', 52, 52,null, '溶酶体'),
		this.createVertexTemplateEntry('shape=mdc7c2ae54b266cda618a60cb297db8a;strokeColor=#333;fillColor=#ddd', 54, 54,null, '蛇杖-面性'),
		this.createVertexTemplateEntry('shape=m4db767a0921962e19bf22ca9ebb5279;strokeColor=#333;fillColor=#ddd', 52, 52,null, '蛇杖-线性'),
		this.createVertexTemplateEntry('shape=m52c7679dc65d2ced2fdcec3c871e9a2;strokeColor=#333;fillColor=#ddd', 59, 53,null, '生化废料'),
		this.createVertexTemplateEntry('shape=mf50ccd8efc555216580ff1a87051f5a;strokeColor=#333;fillColor=#ddd', 55, 55,null, '实验'),
		this.createVertexTemplateEntry('shape=mcc4340f0dbd41365d8555825d12ea7d;strokeColor=#333;fillColor=#ddd', 66, 65,null, '实验小白鼠'),
		this.createVertexTemplateEntry('shape=m9d0f285f0e93dfa498163d0608f3761;strokeColor=#333;fillColor=#ddd', 7, 50,null, '试管'),
		this.createVertexTemplateEntry('shape=m24852ecd4494bf0b8ad6b4ca7f5e07f;strokeColor=#333;fillColor=#ddd', 128, 102,null, '试管架'),
		this.createVertexTemplateEntry('shape=mfec54099127875f63bad8e1c02baea9;strokeColor=#333;fillColor=#ddd', 55, 53,null, '试剂'),
		this.createVertexTemplateEntry('shape=mc7d183f1b71f6dde829c8ff17289f4b;strokeColor=#333;fillColor=#ddd', 69, 72,null, '手'),
		this.createVertexTemplateEntry('shape=m9dc80129f6c9b8dd3cb814af07e5aa7;strokeColor=#333;fillColor=#ddd', 116, 144,null, '显微镜'),
		this.createVertexTemplateEntry('shape=mfddf2766cacfc50bb684060366c8bba;strokeColor=#333;fillColor=#ddd', 66, 42,null, '小白鼠'),
		this.createVertexTemplateEntry('shape=m9b77416d1424882de7b693affd3615e;strokeColor=#333;fillColor=#ddd', 55, 54,null, '心脏病毒'),
		this.createVertexTemplateEntry('shape=meba6156a26f1d6db5c16afcefdf427b;strokeColor=#333;fillColor=#ddd', 44, 44,null, '疫苗'),
		this.createVertexTemplateEntry('shape=mb8dd80cda53e23ae857ce9f995445db;strokeColor=#333;fillColor=#ddd', 54, 60,null, '有害物质-面性'),
		this.createVertexTemplateEntry('shape=m8607027eba5f25a5eb6e8da8541d57f;strokeColor=#333;fillColor=#ddd', 58, 60,null, '有害物质-线性'),
		this.createVertexTemplateEntry('shape=m1e4371ef6ec62ce3fac876b81fad160;strokeColor=#333;fillColor=#ddd', 48, 66,null, '圆形烧瓶'),
		this.createVertexTemplateEntry('shape=md10c40cca7106ee894fc2bcba502cae;strokeColor=#333;fillColor=#ddd', 30, 64,null, '针管'),
		this.createVertexTemplateEntry('shape=m581b01bd9957ccd8c4c4f290fd6328d;strokeColor=#333;fillColor=#ddd', 67, 60,null, '转基因小白鼠'),
		this.createVertexTemplateEntry('shape=m6c270548c1dd6103ca5b7483c8cd331;strokeColor=#333;fillColor=#ddd', 42, 76,null, '锥形烧杯'),
	];
	this.addPaletteFunctions('medicalEquipment', mxResources.get('medicalEquipment'), (expand != null) ? expand : true, fns);
	this.setCurrentSearchEntryLibrary();
};

Sidebar.prototype.addmolecularPalette = function (expand) {

	this.setCurrentSearchEntryLibrary('molecular', 'molecular');
	var fns = [
		this.createVertexTemplateEntry('shape=me7211ba858b1ce35a8b7ed9934f3b3d;strokeColor=#333;fillColor=#ddd', 40, 47,null, '苯环'),
		this.createVertexTemplateEntry('shape=m2361ef323fc3d870ac82bc2dfe750a3;strokeColor=#333;fillColor=#ddd', 49, 47,null, '分子结构'),
		this.createVertexTemplateEntry('shape=macdd0dc87323d43346d456642aed2a5;strokeColor=#333;fillColor=#ddd', 49, 55,null, '分子-面性'),
		this.createVertexTemplateEntry('shape=mc916bc5a8429f3009ddc1f2bdabde20;strokeColor=#333;fillColor=#ddd', 40, 46,null, '分子试剂'),
		this.createVertexTemplateEntry('shape=m608e458d8820211585e8db7d0ef7d63;strokeColor=#333;fillColor=#ddd', 48, 41,null, '分子图'),
		this.createVertexTemplateEntry('shape=m98fcdb586b4c6d5c81ee4d2e37633bd;strokeColor=#333;fillColor=#ddd', 41, 48,null, '分子-线性'),
		this.createVertexTemplateEntry('shape=m5b162e410dd733aa73a8302d16cfa74;strokeColor=#333;fillColor=#ddd', 53, 48,null, '分子-斜'),
		this.createVertexTemplateEntry('shape=m1ef97b2ba25e9bf0667bc27b0ac6ac2;strokeColor=#333;fillColor=#ddd', 63, 60,null, '结构式-1'),
		this.createVertexTemplateEntry('shape=mb0ac372defd6861c95615799d998d97;strokeColor=#333;fillColor=#ddd', 62, 62,null, '结构式-2'),
		this.createVertexTemplateEntry('shape=me08ec054e0152454e4384bbd08a099f;strokeColor=#333;fillColor=#ddd', 72, 72,null, '结构式-3'),
		this.createVertexTemplateEntry('shape=m2146b68925da79518055c0c29acc807;strokeColor=#333;fillColor=#ddd', 45, 45,null, '结构式-4'),
		this.createVertexTemplateEntry('shape=mbbfffc0e9d6749e6894292826a3d5ce;strokeColor=#333;fillColor=#ddd', 61, 61,null, '结构式-5'),
		this.createVertexTemplateEntry('shape=m6673d990fb490182c165a597f19cfb1;strokeColor=#333;fillColor=#ddd', 56, 59,null, '结构式-6'),
		this.createVertexTemplateEntry('shape=m41774ddd75e69e0728bee4c7b57435c;strokeColor=#333;fillColor=#ddd', 67, 51,null, '结构式-7'),
		this.createVertexTemplateEntry('shape=m8d8133662802b4175dc05f4192bf124;strokeColor=#333;fillColor=#ddd', 64, 63,null, '结构式-8'),
		this.createVertexTemplateEntry('shape=m7c261d81458788a4a9b881d6ee0c8c5;strokeColor=#333;fillColor=#ddd', 73, 84,null, '结构式-9'),
		this.createVertexTemplateEntry('shape=ma8b8f6fce72bd5c59db99b0d800db8d;strokeColor=#333;fillColor=#ddd', 73, 67,null, '结构式-10'),
		this.createVertexTemplateEntry('shape=m11cd90e37145b99cf66142ea78b7f1f;strokeColor=#333;fillColor=#ddd', 67, 75,null, '结构式-11'),
		this.createVertexTemplateEntry('shape=m20354e2f5e97ec33a00ac2befaa1a98;strokeColor=#333;fillColor=#ddd', 69, 72,null, '结构式-12'),
		this.createVertexTemplateEntry('shape=m3721023bc346625d83d8a8f151ac4e9;strokeColor=#333;fillColor=#ddd', 73, 74,null, '结构式-13'),
		this.createVertexTemplateEntry('shape=m9965a88be19f805f7a6858336fc0887;strokeColor=#333;fillColor=#ddd', 58, 58,null, '结构式-14'),
		this.createVertexTemplateEntry('shape=m0be34f45e93dbbe4b532d2c7d0b2f4d;strokeColor=#333;fillColor=#ddd', 56, 56,null, '结构式-15'),
		this.createVertexTemplateEntry('shape=mcc2892dd3ae1cb5fb5d9c4826d9c62e;strokeColor=#333;fillColor=#ddd', 53, 53,null, '结构式-16'),
		this.createVertexTemplateEntry('shape=m2667917c9d0131da5719abeafd0988e;strokeColor=#333;fillColor=#ddd', 62, 57,null, '结构式-17'),
		this.createVertexTemplateEntry('shape=m22c6f3866e7242dd50cb1c8f4ade254;strokeColor=#333;fillColor=#ddd', 71, 55,null, '结构式-18'),
		this.createVertexTemplateEntry('shape=m60d631a8f2ab58970a2dc728b26586a;strokeColor=#333;fillColor=#ddd', 57, 57,null, '结构式-19'),
		this.createVertexTemplateEntry('shape=m1914e3c61a045af38c0ef46f26c31f4;strokeColor=#333;fillColor=#ddd', 64, 63,null, '结构式-20'),
	];
	this.addPaletteFunctions('molecular', mxResources.get('molecular'), (expand != null) ? expand : true, fns);
	this.setCurrentSearchEntryLibrary();
};

Sidebar.prototype.addplantOrgansPalette = function (expand) {

	this.setCurrentSearchEntryLibrary('plantOrgans', 'plantOrgans');
	var fns = [
		this.createVertexTemplateEntry('shape=m7e916604091f1eab8e6085b6cd5060a;strokeColor=#333;fillColor=#ddd;sc=#567', 71, 33,null, '叶绿体'),
		this.createVertexTemplateEntry('shape=mf8fce452f27c803eb59df5721599781;strokeColor=#333;fillColor=#ddd', 49, 36,null, '叶片'),
		this.createVertexTemplateEntry('shape=m44dab9c77f850aed56db7aad13f2338;strokeColor=#333;fillColor=#ddd', 56, 71,null, '植物细胞'),
		this.createVertexTemplateEntry('shape=m5cbbee6c9af2d0bc6a7023b8b0af504;strokeColor=#333;fillColor=#ddd', 64, 56,null, '植物细胞-1'),
		this.createVertexTemplateEntry('shape=m2dd589a310cfb28bfaf8da315893838;strokeColor=#333;fillColor=#ddd', 44, 51,null, '植物细胞-2'),
		this.createVertexTemplateEntry('shape=m23c476df458e372a75fc18f5f01b162;strokeColor=#333;fillColor=#ddd', 61, 69,null, '植物细胞-方'),
	];
	this.addPaletteFunctions('plantOrgans', mxResources.get('plantOrgans'), (expand != null) ? expand : true, fns);
	this.setCurrentSearchEntryLibrary();
};

Sidebar.prototype.addprocessDiagramPalette = function (expand) {

	this.setCurrentSearchEntryLibrary('processDiagram', 'processDiagram');
	var fns = [
		this.createVertexTemplateEntry('shape=m13930d774c4c0227fbd42b9f4b86871;strokeColor=#333;fillColor=#ddd', 56, 56,null, '表面受体'),
		this.createVertexTemplateEntry('shape=m8af19adca812cf3c2c051c4c093ac0f;strokeColor=#333;fillColor=#ddd', 50, 50,null, '出芽分裂'),
		this.createVertexTemplateEntry('shape=m5841351e642a3fa9f034db8fb9a7f13;strokeColor=#333;fillColor=#ddd', 70, 46,null, '植物细胞分裂-1'),
		this.createVertexTemplateEntry('shape=mc9fefa2ee8ef66884d6ce65be0709bb;strokeColor=#333;fillColor=#ddd', 71, 46,null, '植物细胞分裂-2'),
		this.createVertexTemplateEntry('shape=m8528f87a60c61535d5a3a3c8b5df572;strokeColor=#333;fillColor=#ddd', 71, 49,null, '植物细胞分裂-3'),
		this.createVertexTemplateEntry('shape=mdbbcc8977722eb3eb55d8699fb1c82a;strokeColor=#333;fillColor=#ddd', 58, 81,null, '植物细胞呼吸-闭'),
		this.createVertexTemplateEntry('shape=meae8f05e7db7367d5912f165ec998ed;strokeColor=#333;fillColor=#ddd', 58, 81,null, '植物细胞呼吸-开'),
		this.createVertexTemplateEntry('shape=m2c7b82dd77746071acf6d407ad759f0;strokeColor=#333;fillColor=#ddd', 90, 86,null, '受精卵'),
		this.createVertexTemplateEntry('shape=md63c87b00e43c857c2887cdc9aef478;strokeColor=#333;fillColor=#ddd', 108, 100,null, '八细胞期'),
		this.createVertexTemplateEntry('shape=mcd8042299d10eb7cafbeec2c2eef7bc;strokeColor=#333;fillColor=#ddd', 105, 99,null, '桑葚期'),
		this.createVertexTemplateEntry('shape=m345aa845bf2b18fa8717b3adfd237b5;strokeColor=#333;fillColor=#ddd', 101, 97,null, '囊胚腔'),
		this.createVertexTemplateEntry('shape=m6b626468266d16255f3b37fed933d26;strokeColor=#333;fillColor=#ddd', 107, 105,null, '胚胎'),
	];
	this.addPaletteFunctions('processDiagram', mxResources.get('processDiagram'), (expand != null) ? expand : true, fns);
	this.setCurrentSearchEntryLibrary();
};

Sidebar.prototype.addprokaryotesPalette = function (expand) {

	this.setCurrentSearchEntryLibrary('prokaryotes', 'prokaryotes');
	var fns = [
		this.createVertexTemplateEntry('shape=m5848d15bef659c78c8477022c4641bc;strokeColor=#333;fillColor=#ddd', 58, 61,null, '病毒+细菌'),
		this.createVertexTemplateEntry('shape=me36e0d5be3fc2a6fb0abe05692bd1ea;strokeColor=#333;fillColor=#ddd', 56, 58,null, '大肠杆菌'),
		this.createVertexTemplateEntry('shape=mdb944eac59ade03bd9ff17270d62190;strokeColor=#333;fillColor=#ddd', 69, 136,null, '大肠杆菌-1'),
		this.createVertexTemplateEntry('shape=m1f7b691732e7b1e605dcbe883d28977;strokeColor=#333;fillColor=#ddd', 59, 55,null, '大肠杆菌-2'),
		this.createVertexTemplateEntry('shape=m2e5e3a5086967bb9d64ed2925272c14;strokeColor=#333;fillColor=#ddd', 62, 58,null, '大肠杆菌群'),
		this.createVertexTemplateEntry('shape=meb4459258edac48ccdc9cee6783b530;strokeColor=#333;fillColor=#ddd', 17, 33,null, '单个细菌'),
		this.createVertexTemplateEntry('shape=m091dd78e90d1a2ac3371341b08c4cac;strokeColor=#333;fillColor=#ddd', 80, 65,null, '杆状菌'),
		this.createVertexTemplateEntry('shape=m69af5aa6c2035ab27bd11525b688836;strokeColor=#333;fillColor=#ddd', 76, 50,null, '双细菌-1'),
		this.createVertexTemplateEntry('shape=m5b5b60f9f811e48a01f059036e670bf;strokeColor=#333;fillColor=#ddd', 62, 40,null, '双细菌-2'),
		this.createVertexTemplateEntry('shape=mfbf983651aceb8e647f50a46a55f874;strokeColor=#333;fillColor=#ddd', 62, 62,null, '细菌'),
		this.createVertexTemplateEntry('shape=m8d3a4c6311a3c73af18581899a04786;strokeColor=#333;fillColor=#ddd', 107, 117,null, '细菌-1'),
		this.createVertexTemplateEntry('shape=mc9862ceb4474d347c5fe309e2469904;strokeColor=#333;fillColor=#ddd', 71, 60,null, '细菌-2'),
		this.createVertexTemplateEntry('shape=m611b83a3f41391cd5a397b4a63f2c01;strokeColor=#333;fillColor=#ddd', 65, 54,null, '细菌-3'),
		this.createVertexTemplateEntry('shape=m499ff9d83454cfe135915b0fb496332;strokeColor=#333;fillColor=#ddd', 56, 59,null, '细菌-4'),
		this.createVertexTemplateEntry('shape=mc79383903c1813597488efabef90812;strokeColor=#333;fillColor=#ddd', 61, 61,null, '细菌-5'),
		this.createVertexTemplateEntry('shape=m6c7236b0310cf3a0b03d0b1c101eb5b;strokeColor=#333;fillColor=#ddd', 53, 53,null, '细菌-6'),
		this.createVertexTemplateEntry('shape=ma690e0ea9b9c82692783ad4c1a67423;strokeColor=#333;fillColor=#ddd', 57, 57,null, '细菌-7'),
		this.createVertexTemplateEntry('shape=mf34725bc92bde797d1f396aad918166;strokeColor=#333;fillColor=#ddd', 58, 58,null, '细菌-8'),
		this.createVertexTemplateEntry('shape=m4cf00b7322aa4a8a4729aa2c2af289a;strokeColor=#333;fillColor=#ddd', 60, 60,null, '细菌-9'),
		this.createVertexTemplateEntry('shape=mad359403a10c0b498d643d7af0ee568;strokeColor=#333;fillColor=#ddd', 46, 46,null, '细菌-10'),
		this.createVertexTemplateEntry('shape=m513bf134689dfc4d301df7179f74b67;strokeColor=#333;fillColor=#ddd', 61, 26,null, '细菌-11'),
		this.createVertexTemplateEntry('shape=m5152a0f0c2b4e0d7407792095377bd7;strokeColor=#333;fillColor=#ddd', 73, 62,null, '细菌-12'),
		this.createVertexTemplateEntry('shape=m062987020d3791afd75b5e66a2d39f2;strokeColor=#333;fillColor=#ddd', 94, 80,null, '细菌-13'),
		this.createVertexTemplateEntry('shape=mfeebfa3d04de17bb20f60d0d63f6680;strokeColor=#333;fillColor=#ddd', 102, 94,null, '细菌-14'),
		this.createVertexTemplateEntry('shape=me84230b5913e88dda0d96a2cdaec603;strokeColor=#333;fillColor=#ddd', 34, 36,null, '细菌群'),
	];
	this.addPaletteFunctions('prokaryotes', mxResources.get('prokaryotes'), (expand != null) ? expand : true, fns);
	this.setCurrentSearchEntryLibrary();
};

Sidebar.prototype.addprotistPalette = function (expand) {

	this.setCurrentSearchEntryLibrary('protist', 'protist');
	var fns = [
		this.createVertexTemplateEntry('shape=m3244bae88deb50f244d7d7c96123360;strokeColor=#333;fillColor=#ddd', 65, 64,null, '扁豆-面性'),
		this.createVertexTemplateEntry('shape=m4494e1f483b85f1f0708a550a417b66;strokeColor=#333;fillColor=#ddd', 65, 64,null, '扁豆-线性'),
		this.createVertexTemplateEntry('shape=m30fab2a281cd2c738769983a755b0f1;strokeColor=#333;fillColor=#ddd', 122, 111,null, '变形虫'),
		this.createVertexTemplateEntry('shape=m85136750a38b9c13a57d8887904cc0f;strokeColor=#333;fillColor=#ddd', 55, 55,null, '变形虫-抽象'),
		this.createVertexTemplateEntry('shape=mc572d996f3cde53aee9338ed6d64e86;strokeColor=#333;fillColor=#ddd', 49, 49,null, '变形虫-简约'),
		this.createVertexTemplateEntry('shape=mc41fc6ed93dba7f4e5a2fc36db393a7;strokeColor=#333;fillColor=#ddd', 57, 57,null, '草履虫'),
		this.createVertexTemplateEntry('shape=mf7e8ce4b1c61dbfc2cfebfc7c968579;strokeColor=#333;fillColor=#ddd', 23, 72,null, '草履虫-外观'),
		this.createVertexTemplateEntry('shape=m063fecad02e225e239c6522fa3b9a2d;strokeColor=#333;fillColor=#ddd', 64, 63,null, '草-面性'),
		this.createVertexTemplateEntry('shape=m2539a3438922f0584b0d2f2ad95f70f;strokeColor=#333;fillColor=#ddd', 64, 64,null, '草-线性'),
		this.createVertexTemplateEntry('shape=med372359cb16e5b58287617e6656bfa;strokeColor=#333;fillColor=#ddd', 72, 69,null, '虫'),
		this.createVertexTemplateEntry('shape=m1187a00f495460b0a0e85106d7a5406;strokeColor=#333;fillColor=#ddd', 72, 72,null, '虫-面性'),
		this.createVertexTemplateEntry('shape=mb0c536f7f45f1db410055cdb72a53ae;strokeColor=#333;fillColor=#ddd', 59, 59,null, '大树-面性'),
		this.createVertexTemplateEntry('shape=m7d79075032d1df360f494dc27ec6d8b;strokeColor=#333;fillColor=#ddd', 59, 59,null, '大树-线性'),
		this.createVertexTemplateEntry('shape=m60cc6192c5c4fda537acd7d31c21e98;strokeColor=#333;fillColor=#ddd', 60, 60,null, '番茄-面性'),
		this.createVertexTemplateEntry('shape=m244c3f0e1b5fc884c21d53a1c368eb5;strokeColor=#333;fillColor=#ddd', 60, 60,null, '番茄-线性'),
		this.createVertexTemplateEntry('shape=m3ee9bb4753612a626770bf983a88828;strokeColor=#333;fillColor=#ddd', 71, 58,null, '蜂鸟-面性'),
		this.createVertexTemplateEntry('shape=m1fd68d6497f31367f4bf86312fd0dda;strokeColor=#333;fillColor=#ddd', 71, 58,null, '蜂鸟-线性'),
		this.createVertexTemplateEntry('shape=md01ae908e361b504ecb4b8258a37b78;strokeColor=#333;fillColor=#ddd', 59, 59,null, '胡萝卜-面性'),
		this.createVertexTemplateEntry('shape=m289fb544390b952b6ed2b57de7557b3;strokeColor=#333;fillColor=#ddd', 59, 59,null, '胡萝卜-线性'),
		this.createVertexTemplateEntry('shape=m13cee538382544965b8d17d5b10c6ca;strokeColor=#333;fillColor=#ddd', 56, 57,null, '黄瓜-面性'),
		this.createVertexTemplateEntry('shape=m0b0b197cdb9973325cead6e457dcb0a;strokeColor=#333;fillColor=#ddd', 56, 58,null, '黄瓜-线性'),
		this.createVertexTemplateEntry('shape=m3d8fe45466733139414a560b69c9483;strokeColor=#333;fillColor=#ddd', 50, 55,null, '火龙果-面性'),
		this.createVertexTemplateEntry('shape=m87de54765db37c26aeb817a34bae990;strokeColor=#333;fillColor=#ddd', 50, 59,null, '火龙果-线性'),
		this.createVertexTemplateEntry('shape=mf2712b1bb1f0b6a316714994a2d2d45;strokeColor=#333;fillColor=#ddd', 71, 59,null, '鸡'),
		this.createVertexTemplateEntry('shape=m4ece7f31600f0f11b2bd3c8fb901c3f;strokeColor=#333;fillColor=#ddd', 64, 72,null, '鸡-面性'),
		this.createVertexTemplateEntry('shape=m4d41df9b1f5a6ae7d4e3b2608273352;strokeColor=#333;fillColor=#ddd', 63, 69,null, '鸡-线性'),
		this.createVertexTemplateEntry('shape=m29cae955b5d3f2baa983728f4bc5996;strokeColor=#333;fillColor=#ddd', 72, 47,null, '金鱼-面性'),
		this.createVertexTemplateEntry('shape=m464ab5d9403d1927abfd3e7cd203fcf;strokeColor=#333;fillColor=#ddd', 72, 49,null, '金鱼-线性'),
		this.createVertexTemplateEntry('shape=mf110fd8a4511c04173189ede6fa0874;strokeColor=#333;fillColor=#ddd', 60, 66,null, '蓝莓-面性'),
		this.createVertexTemplateEntry('shape=m4fc90b4eb8c763d3727bcf0378f7244;strokeColor=#333;fillColor=#ddd', 60, 66,null, '蓝莓-线性'),
		this.createVertexTemplateEntry('shape=m12098aa6faf93414fb58c5293a66030;strokeColor=#333;fillColor=#ddd', 58, 58,null, '蘑菇'),
		this.createVertexTemplateEntry('shape=m45e9249821b108f0d9b71f1eadd558e;strokeColor=#333;fillColor=#ddd', 58, 58,null, '木瓜-面性'),
		this.createVertexTemplateEntry('shape=m807513de8b5509963f8e4f9411ea260;strokeColor=#333;fillColor=#ddd', 58, 58,null, '木瓜-线性'),
		this.createVertexTemplateEntry('shape=m0f8bdc3299c9aad8d7ba5a7d5abf8b7;strokeColor=#333;fillColor=#ddd', 47, 61,null, '牛油果-面性'),
		this.createVertexTemplateEntry('shape=mc4477b732d0cdbd166c18fbd98ba687;strokeColor=#333;fillColor=#ddd', 47, 61,null, '牛油果-线性'),
		this.createVertexTemplateEntry('shape=m43f3badf92fac0698ee7f1635a7d084;strokeColor=#333;fillColor=#ddd', 57, 57,null, '盆栽-面性'),
		this.createVertexTemplateEntry('shape=m378103d2521bcc7f0e63df4e7e303d6;strokeColor=#333;fillColor=#ddd', 57, 57,null, '盆栽-线性'),
		this.createVertexTemplateEntry('shape=m9d54009ff14279550e01d15c683e12f;strokeColor=#333;fillColor=#ddd', 55, 71,null, '葡萄-面性'),
		this.createVertexTemplateEntry('shape=md15943de1295589a4eaf68ddf84b38d;strokeColor=#333;fillColor=#ddd', 55, 71,null, '葡萄-线性'),
		this.createVertexTemplateEntry('shape=mbb11c6939128497cbcb096444e020e6;strokeColor=#333;fillColor=#ddd', 57, 57,null, '茄子-面性'),
		this.createVertexTemplateEntry('shape=mb13ff2d8c1530b29e12893ddb0687bd;strokeColor=#333;fillColor=#ddd', 57, 57,null, '茄子-线性'),
		this.createVertexTemplateEntry('shape=m1e0aed904a00dba964bb794325a14dd;strokeColor=#333;fillColor=#ddd', 70, 60,null, '热带鱼-面性'),
		this.createVertexTemplateEntry('shape=mccc7e03f492246cdee1f2134ab8ba02;strokeColor=#333;fillColor=#ddd', 63, 47,null, '热带鱼-线性'),
		this.createVertexTemplateEntry('shape=mecedc43bf70c10bf483c903fa18c196;strokeColor=#333;fillColor=#ddd', 54, 63,null, '柿子椒-面性'),
		this.createVertexTemplateEntry('shape=m559490624c70bb08707fcbbefbdce5a;strokeColor=#333;fillColor=#ddd', 54, 64,null, '柿子椒-线性'),
		this.createVertexTemplateEntry('shape=m9cf0117d83db5d3af37f6ff4fdcff14;strokeColor=#333;fillColor=#ddd', 41, 52,null, '树-面性'),
		this.createVertexTemplateEntry('shape=m7c744f2bd1486f51ea3b9322813f6eb;strokeColor=#333;fillColor=#ddd', 45, 54,null, '树木'),
		this.createVertexTemplateEntry('shape=mdb2aeed6f260afeb1ebe0cf32eb1fde;strokeColor=#333;fillColor=#ddd', 41, 52,null, '树-线性'),
		this.createVertexTemplateEntry('shape=mf28c11de45c49c40c8b0cdedab8deb1;strokeColor=#333;fillColor=#ddd', 23, 36,null, '树叶'),
		this.createVertexTemplateEntry('shape=mc8a054ab5f9368afb45a6c7866d506e;strokeColor=#333;fillColor=#ddd', 57, 59,null, '水草'),
		this.createVertexTemplateEntry('shape=m4d95f82bc0eb7653687f0c7ae5d0f43;strokeColor=#333;fillColor=#ddd', 57, 59,null, '水草-面性'),
		this.createVertexTemplateEntry('shape=m0d475adf0706820aea2affdfb5de461;strokeColor=#333;fillColor=#ddd', 65, 66,null, '仙人掌-面性'),
		this.createVertexTemplateEntry('shape=mf1c3f22576fd106a7aee897d5b8ff0e;strokeColor=#333;fillColor=#ddd', 64, 66,null, '仙人掌-线性'),
		this.createVertexTemplateEntry('shape=m7bf529425940edbc33b689b9ffd5fe3;strokeColor=#333;fillColor=#ddd', 53, 59,null, '香蕉-面性'),
		this.createVertexTemplateEntry('shape=m774e0213668b69f19e407c58c7b2f6b;strokeColor=#333;fillColor=#ddd', 54, 59,null, '香蕉-线性'),
		this.createVertexTemplateEntry('shape=m538890fb5e8d7aa9b4cb8df85850622;strokeColor=#333;fillColor=#ddd', 64, 71,null, '鸭-面性'),
		this.createVertexTemplateEntry('shape=m8807cf7bc2b921dd743b050574f933e;strokeColor=#333;fillColor=#ddd', 66, 70,null, '鸭-线性'),
		this.createVertexTemplateEntry('shape=m90302049800ee04ce3f780e054f896f;strokeColor=#333;fillColor=#ddd', 71, 60,null, '羊-面性'),
		this.createVertexTemplateEntry('shape=m7af36c2a4e0014f50400e230982e396;strokeColor=#333;fillColor=#ddd', 71, 61,null, '羊-线性'),
		this.createVertexTemplateEntry('shape=mf6f98a3ebde03a1276a77d3c61859df;strokeColor=#333;fillColor=#ddd', 54, 54,null, '椰子-面性'),
		this.createVertexTemplateEntry('shape=m50a4295992ba0d4c537ae945699a8c2;strokeColor=#333;fillColor=#ddd', 53, 60,null, '椰子树'),
		this.createVertexTemplateEntry('shape=m8fc6eaa922abdf8a4a749f5f1bf7eb0;strokeColor=#333;fillColor=#ddd', 54, 54,null, '椰子-线性'),
		this.createVertexTemplateEntry('shape=m9f8112ce21d62a386b97a9a41866ad0;strokeColor=#333;fillColor=#ddd', 63, 66,null, '樱桃-面性'),
		this.createVertexTemplateEntry('shape=m8fcb263948ca48260be07a72a1011b9;strokeColor=#333;fillColor=#ddd', 63, 66,null, '樱桃-线性'),
		this.createVertexTemplateEntry('shape=m76fe09b80b309566a383c42538db86c;strokeColor=#333;fillColor=#ddd', 61, 57,null, '幼鸟-面性'),
		this.createVertexTemplateEntry('shape=m6b85448df0cc0b9078017a002a8ce4b;strokeColor=#333;fillColor=#ddd', 63, 53,null, '幼鸟-线性'),
		this.createVertexTemplateEntry('shape=me86f8d7858373d71be3b0fae5877331;strokeColor=#333;fillColor=#ddd', 62, 63,null, '蜘蛛'),
		this.createVertexTemplateEntry('shape=m81db73223718e20c611fc61c4055b52;strokeColor=#333;fillColor=#ddd', 62, 63,null, '蜘蛛-面性'),
	];
	this.addPaletteFunctions('protist', mxResources.get('protist'), (expand != null) ? expand : true, fns);
	this.setCurrentSearchEntryLibrary();
};

Sidebar.prototype.addvirusPalette = function (expand) {

	this.setCurrentSearchEntryLibrary('virus', 'virus');
	var fns = [
		this.createVertexTemplateEntry('shape=me06d135e36a9bf5c7627151dbe1d169;strokeColor=#333;fillColor=#ddd', 13, 10,null, '病毒'),
		this.createVertexTemplateEntry('shape=m6b97467d4e83294d37e6b333612cbe0;strokeColor=#333;fillColor=#ddd', 65, 65,null, '病毒-0'),
		this.createVertexTemplateEntry('shape=m48bb634d11fba1d55c44cfc656e8c28;strokeColor=#333;fillColor=#ddd', 65, 66,null, '病毒-1'),
		this.createVertexTemplateEntry('shape=m136e1fc0419de1a9268a8da8227bc3a;strokeColor=#333;fillColor=#ddd', 47, 46,null, '病毒-10'),
		this.createVertexTemplateEntry('shape=m1ef4cefd6f477fbadc159c39ffc4902;strokeColor=#333;fillColor=#ddd', 60, 70,null, '病毒-2'),
		this.createVertexTemplateEntry('shape=ma0a59f476f4ab5d081b9e89f77b3f18;strokeColor=#333;fillColor=#ddd', 58, 58,null, '病毒-3'),
		this.createVertexTemplateEntry('shape=m1b3e8e271b720b428515d0b06235bc9;strokeColor=#333;fillColor=#ddd', 63, 63,null, '病毒-4'),
		this.createVertexTemplateEntry('shape=m4ce591b14869463d6cc1ded3c988f26;strokeColor=#333;fillColor=#ddd', 63, 63,null, '病毒-5'),
		this.createVertexTemplateEntry('shape=mb92c01d61bee79c47188993402f44be;strokeColor=#333;fillColor=#ddd', 183, 203,null, '病毒-6'),
		this.createVertexTemplateEntry('shape=m9163afb58fe3cbeb7bb98a686a5130b;strokeColor=#333;fillColor=#ddd', 57, 57,null, '病毒-7'),
		this.createVertexTemplateEntry('shape=maa111ebff82352f9bd588785f7ee508;strokeColor=#333;fillColor=#ddd', 112, 69,null, '病毒-8'),
		this.createVertexTemplateEntry('shape=m3efa01d2ed84b83dc8c995488a19526;strokeColor=#333;fillColor=#ddd', 64, 67,null, '病毒-抽象'),
		this.createVertexTemplateEntry('shape=m0a178cce32087b04cb08ec9d333854d;strokeColor=#333;fillColor=#ddd', 60, 60,null, '病毒-粗-面性'),
		this.createVertexTemplateEntry('shape=m76f528463ab6040d87f2ba4593fa830;strokeColor=#333;fillColor=#ddd', 62, 62,null, '病毒-粗-线性'),
		this.createVertexTemplateEntry('shape=mb2953f66b7a4c0a5c75366345c30326;strokeColor=#333;fillColor=#ddd', 63, 63,null, '病毒-简约'),
		this.createVertexTemplateEntry('shape=ma67e564e56a47d6d2f46c605cd38297;strokeColor=#333;fillColor=#ddd', 58, 58,null, '病毒-面性'),
		this.createVertexTemplateEntry('shape=m2b32d42dd4651bbb7386ca3481bac9c;strokeColor=#333;fillColor=#ddd', 66, 67,null, '病毒群-1'),
		this.createVertexTemplateEntry('shape=m1a5eccdd37192da482dd3d374c31339;strokeColor=#333;fillColor=#ddd', 67, 63,null, '病毒群-2'),
		this.createVertexTemplateEntry('shape=m175859b1da0b9e32531e0433746a2d9;strokeColor=#333;fillColor=#ddd', 59, 61,null, '病毒入侵细胞'),
		this.createVertexTemplateEntry('shape=m43d09f40b3f8c9b7f4fb46b2bb9791d;strokeColor=#333;fillColor=#ddd', 85, 80,null, '病毒外观'),
		this.createVertexTemplateEntry('shape=m1c622247a39a20f48d666819c592bf2;strokeColor=#333;fillColor=#ddd', 58, 58,null, '病毒-细'),
		this.createVertexTemplateEntry('shape=mb89fa177c01e923212fdaa9406a9eac;strokeColor=#333;fillColor=#ddd', 57, 57,null, '病毒-线性'),
		this.createVertexTemplateEntry('shape=mb5615bb7a30ef00c63aa3f6675b700c;strokeColor=#333;fillColor=#ddd', 46, 46,null, '肺+病毒'),
		this.createVertexTemplateEntry('shape=m1ed34ac4fedc52418e42ec505fd4b25;strokeColor=#333;fillColor=#ddd', 71, 52,null, '双病毒'),
		this.createVertexTemplateEntry('shape=m11f1af30b37325a0a0e36dc806a3d13;strokeColor=#333;fillColor=#ddd', 47, 62,null, '水滴+病毒'),
		this.createVertexTemplateEntry('shape=mff60cf16d5cb28a01b381dd1c015d7f;strokeColor=#333;fillColor=#ddd', 58, 61,null, '细菌+病毒'),
		this.createVertexTemplateEntry('shape=m27cc9a570d1dba7708ff1256079530f;strokeColor=#333;fillColor=#ddd', 38, 38,null, '血管+病毒'),
		this.createVertexTemplateEntry('shape=m4b7a8ca48b488146f7b354d7b3c108b;strokeColor=#333;fillColor=#ddd', 40, 45,null, '血液病毒'),
	];
	this.addPaletteFunctions('virus', mxResources.get('virus'), (expand != null) ? expand : true, fns);
	this.setCurrentSearchEntryLibrary();
};

Sidebar.prototype.addtoolPalette = function (expand) {
	this.setCurrentSearchEntryLibrary('tool', 'tool');
	var fns =[];
	this.addPaletteFunctions('tool', mxResources.get('tool'), (expand != null) ? expand : true, fns);
	this.setCurrentSearchEntryLibrary();
}

/**
 * 创建并返回给定的标题元素。
 */
Sidebar.prototype.createTitle = function (label) {
	//创建我的图形 提示
	var elt = document.createElement('a');
	elt.setAttribute('title', mxResources.get('sidebarTooltip'));
	elt.className = 'geTitle';
	mxUtils.write(elt, label);

	return elt;
};

/**
 *为给定的单元格创建缩略图。
 */ 
Sidebar.prototype.createThumb = function (cells, width, height, parent, title, showLabel, showTitle, realWidth, realHeight) {
	this.graph.labelsVisible = (showLabel == null || showLabel);
	var fo = mxClient.NO_FO;
	mxClient.NO_FO = Editor.prototype.originalNoForeignObject;
	this.graph.view.scaleAndTranslate(1, 0, 0);
	this.graph.addCells(cells);
	var bounds = this.graph.getGraphBounds();
	var s = Math.floor(Math.min((width - 2 * this.thumbBorder) / bounds.width,
		(height - 2 * this.thumbBorder) / bounds.height) * 100) / 100;
	this.graph.view.scaleAndTranslate(s, Math.floor((width - bounds.width * s) / 2 / s - bounds.x),
		Math.floor((height - bounds.height * s) / 2 / s - bounds.y));
	var node = null;

	//为了在IE9标准模式下支持HTML标签，将克隆容器
	if (this.graph.dialect == mxConstants.DIALECT_SVG && !mxClient.NO_FO &&
		this.graph.view.getCanvas().ownerSVGElement != null) {
		node = this.graph.view.getCanvas().ownerSVGElement.cloneNode(true);
	}
	//之后：检查是否可以在DOM中使用深克隆功能来进行怪癖
	else {
		node = this.graph.container.cloneNode(false);
		node.innerHTML = this.graph.container.innerHTML;

		//在旧版IE中进行裁剪的解决方法
		if (mxClient.IS_QUIRKS || document.documentMode == 8) {
			node.firstChild.style.overflow = 'visible';
		}
	}

	this.graph.getModel().clear();
	mxClient.NO_FO = fo;

	//捕获所有事件 
	if (mxClient.IS_IE6) {
		parent.style.backgroundImage = 'url(' + this.editorUi.editor.transparentImage + ')';
	}

	node.style.position = 'relative';
	node.style.overflow = 'hidden';
	node.style.left = this.thumbBorder + 'px';
	node.style.top = this.thumbBorder + 'px';
	node.style.width = width + 'px';
	node.style.height = height + 'px';
	node.style.visibility = '';
	node.style.minWidth = '';
	node.style.minHeight = '';

	parent.appendChild(node);

	//为侧边栏条目添加标题
	if (this.sidebarTitles && title != null && showTitle != false) {
		var border = (mxClient.IS_QUIRKS) ? 2 * this.thumbPadding + 2 : 0;
		parent.style.height = (this.thumbHeight + border + this.sidebarTitleSize + 8) + 'px';

		var div = document.createElement('div');
		div.style.fontSize = this.sidebarTitleSize + 'px';
		div.style.color = '#303030';
		div.style.textAlign = 'center';
		div.style.whiteSpace = 'nowrap';

		if (mxClient.IS_IE) {
			div.style.height = (this.sidebarTitleSize + 12) + 'px';
		}

		div.style.paddingTop = '4px';
		mxUtils.write(div, title);
		parent.appendChild(div);
	}

	return bounds;
};

/**
 *为给定图像创建并返回一个新的调色板项目。
 */
Sidebar.prototype.createItem = function (cells, title, showLabel, showTitle, width, height, allowCellsInserted) {
	var elt = document.createElement('a');
	elt.className = 'geItem';
	elt.style.overflow = 'hidden';
	var border = (mxClient.IS_QUIRKS) ? 8 + 2 * this.thumbPadding : 2 * this.thumbBorder;
	elt.style.width = (this.thumbWidth + border) + 'px';
	elt.style.height = (this.thumbHeight + border) + 'px';
	elt.style.padding = this.thumbPadding + 'px';

	if (mxClient.IS_IE6) {
		elt.style.border = 'none';
	}

	//阻止默认的点击操作
	mxEvent.addListener(elt, 'click', function (evt) {
		mxEvent.consume(evt);
	});

	this.createThumb(cells, this.thumbWidth, this.thumbHeight, elt, title, showLabel, showTitle, width, height);
	var bounds = new mxRectangle(0, 0, width, height);

	if (cells.length > 1 || cells[0].vertex) {
		var ds = this.createDragSource(elt, this.createDropHandler(cells, true, allowCellsInserted,
			bounds), this.createDragPreview(width, height), cells, bounds);
		this.addClickHandler(elt, ds, cells);

		//仅在图形中启用时才对顶点使用参考线
		ds.isGuidesEnabled = mxUtils.bind(this, function () {
			return this.editorUi.editor.graph.graphHandler.guidesEnabled;
		});
	}
	else if (cells[0] != null && cells[0].edge) {
		var ds = this.createDragSource(elt, this.createDropHandler(cells, false, allowCellsInserted,
			bounds), this.createDragPreview(width, height), cells, bounds);
		this.addClickHandler(elt, ds, cells);
	}

	//显示带有已渲染单元格的工具提示
	if (!mxClient.IS_IOS) {
		mxEvent.addGestureListeners(elt, null, mxUtils.bind(this, function (evt) {
			if (mxEvent.isMouseEvent(evt)) {
				this.showTooltip(elt, cells, bounds.width, bounds.height, title, showLabel);
			}
		}));
	}

	return elt;
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.updateShapes = function (source, targets) {
	var graph = this.editorUi.editor.graph;
	var sourceCellStyle = graph.getCellStyle(source);
	var result = [];

	graph.model.beginUpdate();
	try {
		var cellStyle = graph.getModel().getStyle(source);

		// Lists the styles to carry over from the existing shape
		var styles = ['shadow', 'dashed', 'dashPattern', 'fontFamily', 'fontSize', 'fontColor', 'align', 'startFill',
			'startSize', 'endFill', 'endSize', 'strokeColor', 'strokeWidth', 'fillColor', 'gradientColor',
			'html', 'part', 'noEdgeStyle', 'edgeStyle', 'elbow', 'childLayout', 'recursiveResize',
			'container', 'collapsible', 'connectable', 'comic', 'sketch', 'fillWeight', 'hachureGap',
			'hachureAngle', 'jiggle', 'disableMultiStroke', 'disableMultiStrokeFill',
			'fillStyle', 'curveFitting', 'simplification', 'sketchStyle'];

		for (var i = 0; i < targets.length; i++) {
			var targetCell = targets[i];

			if ((graph.getModel().isVertex(targetCell) == graph.getModel().isVertex(source)) ||
				(graph.getModel().isEdge(targetCell) == graph.getModel().isEdge(source))) {
				var style = graph.getCurrentCellStyle(targets[i]);
				graph.getModel().setStyle(targetCell, cellStyle);

				// Removes all children of composite cells
				if (mxUtils.getValue(style, 'composite', '0') == '1') {
					var childCount = graph.model.getChildCount(targetCell);

					for (var j = childCount; j >= 0; j--) {
						graph.model.remove(graph.model.getChildAt(targetCell, j));
					}
				}

				// Replaces the participant style in the lifeline shape with the target shape
				if (style[mxConstants.STYLE_SHAPE] == 'umlLifeline' &&
					sourceCellStyle[mxConstants.STYLE_SHAPE] != 'umlLifeline') {
					graph.setCellStyles(mxConstants.STYLE_SHAPE, 'umlLifeline', [targetCell]);
					graph.setCellStyles('participant', sourceCellStyle[mxConstants.STYLE_SHAPE], [targetCell]);
				}

				for (var j = 0; j < styles.length; j++) {
					var value = style[styles[j]];

					if (value != null) {
						graph.setCellStyles(styles[j], value, [targetCell]);
					}
				}

				result.push(targetCell);
			}
		}
	}
	finally {
		graph.model.endUpdate();
	}

	return result;
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createDropHandler = function (cells, allowSplit, allowCellsInserted, bounds) {
	allowCellsInserted = (allowCellsInserted != null) ? allowCellsInserted : true;

	return mxUtils.bind(this, function (graph, evt, target, x, y, force) {
		var elt = (force) ? null : ((mxEvent.isTouchEvent(evt) || mxEvent.isPenEvent(evt)) ?
			document.elementFromPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt)) :
			mxEvent.getSource(evt));

		while (elt != null && elt != this.container) {
			elt = elt.parentNode;
		}

		if (elt == null && graph.isEnabled()) {
			cells = graph.getImportableCells(cells);

			if (cells.length > 0) {
				graph.stopEditing();

				// Holding alt while mouse is released ignores drop target
				var validDropTarget = (target != null && !mxEvent.isAltDown(evt)) ?
					graph.isValidDropTarget(target, cells, evt) : false;

				var select = null;

				if (target != null && !validDropTarget) {
					target = null;
				}

				if (!graph.isCellLocked(target || graph.getDefaultParent())) {
					graph.model.beginUpdate();
					try {
						x = Math.round(x);
						y = Math.round(y);

						// Splits the target edge or inserts into target group
						if (allowSplit && graph.isSplitTarget(target, cells, evt)) {
							var s = graph.view.scale;
							var tr = graph.view.translate;
							var tx = (x + tr.x) * s;
							var ty = (y + tr.y) * s;

							var clones = graph.cloneCells(cells);
							graph.splitEdge(target, clones, null,
								x - bounds.width / 2, y - bounds.height / 2,
								tx, ty);
							select = clones;
						}
						else if (cells.length > 0) {
							select = graph.importCells(cells, x, y, target);
						}

						// Executes parent layout hooks for position/order
						if (graph.layoutManager != null) {
							var layout = graph.layoutManager.getLayout(target);

							if (layout != null) {
								var s = graph.view.scale;
								var tr = graph.view.translate;
								var tx = (x + tr.x) * s;
								var ty = (y + tr.y) * s;

								for (var i = 0; i < select.length; i++) {
									layout.moveCell(select[i], tx, ty);
								}
							}
						}

						if (allowCellsInserted && (evt == null || !mxEvent.isShiftDown(evt))) {
							graph.fireEvent(new mxEventObject('cellsInserted', 'cells', select));
						}
					}
					catch (e) {
						this.editorUi.handleError(e);
					}
					finally {
						graph.model.endUpdate();
					}

					if (select != null && select.length > 0) {
						graph.scrollCellToVisible(select[0]);
						graph.setSelectionCells(select);
					}

					if (graph.editAfterInsert && evt != null && mxEvent.isMouseEvent(evt) &&
						select != null && select.length == 1) {
						window.setTimeout(function () {
							graph.startEditing(select[0]);
						}, 0);
					}
				}
			}

			mxEvent.consume(evt);
		}
	});
};

/**
 * Creates and returns a preview element for the given width and height.
 */
Sidebar.prototype.createDragPreview = function (width, height) {
	var elt = document.createElement('div');
	elt.style.border = this.dragPreviewBorder;
	elt.style.width = width + 'px';
	elt.style.height = height + 'px';

	return elt;
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.dropAndConnect = function (source, targets, direction, dropCellIndex, evt) {
	var geo = this.getDropAndConnectGeometry(source, targets[dropCellIndex], direction, targets);

	// Targets without the new edge for selection
	var tmp = [];

	if (geo != null) {
		var graph = this.editorUi.editor.graph;
		var editingCell = null;

		graph.model.beginUpdate();
		try {
			var sourceGeo = graph.getCellGeometry(source);
			var geo2 = graph.getCellGeometry(targets[dropCellIndex]);

			// Handles special case where target should be ignored for stack layouts
			var targetParent = graph.model.getParent(source);
			var validLayout = true;

			// Ignores parent if it has a stack layout or if it is a table or row
			if (graph.layoutManager != null) {
				var layout = graph.layoutManager.getLayout(targetParent);

				// LATER: Use parent of parent if valid layout
				if (layout != null && layout.constructor == mxStackLayout) {
					validLayout = false;
				}
			}

			// Checks if another container is at the drop location
			var tmp = (graph.model.isEdge(source)) ? null : graph.view.getState(targetParent);
			var dx = 0;
			var dy = 0;

			// Offsets by parent position
			if (tmp != null) {
				var offset = tmp.origin;
				dx = offset.x;
				dy = offset.y;

				var pt = geo.getTerminalPoint(false);

				if (pt != null) {
					pt.x += offset.x;
					pt.y += offset.y;
				}
			}

			var useParent = !graph.isTableRow(source) && !graph.isTableCell(source) &&
				(graph.model.isEdge(source) || (sourceGeo != null &&
					!sourceGeo.relative && validLayout));

			var tempTarget = graph.getCellAt((geo.x + dx + graph.view.translate.x) * graph.view.scale,
				(geo.y + dy + graph.view.translate.y) * graph.view.scale, null, null, null, function (state, x, y) {
					return !graph.isContainer(state.cell);
				});

			if (tempTarget != null && tempTarget != targetParent) {
				tmp = graph.view.getState(tempTarget);

				// Offsets by new parent position
				if (tmp != null) {
					var offset = tmp.origin;
					targetParent = tempTarget;
					useParent = true;

					if (!graph.model.isEdge(source)) {
						geo.x -= offset.x - dx;
						geo.y -= offset.y - dy;
					}
				}
			}
			else if (!validLayout || graph.isTableRow(source) || graph.isTableCell(source)) {
				geo.x += dx;
				geo.y += dy;
			}

			dx = geo2.x;
			dy = geo2.y;

			// Ignores geometry of edges
			if (graph.model.isEdge(targets[dropCellIndex])) {
				dx = 0;
				dy = 0;
			}

			targets = graph.importCells(targets, (geo.x - (useParent ? dx : 0)),
				(geo.y - (useParent ? dy : 0)), (useParent) ? targetParent : null);
			tmp = targets;

			if (graph.model.isEdge(source)) {
				// Adds new terminal to edge
				// LATER: Push new terminal out radially from edge start point
				graph.model.setTerminal(source, targets[dropCellIndex],
					direction == mxConstants.DIRECTION_NORTH);
			}
			else if (graph.model.isEdge(targets[dropCellIndex])) {
				// Adds new outgoing connection to vertex and clears points
				graph.model.setTerminal(targets[dropCellIndex], source, true);
				var geo3 = graph.getCellGeometry(targets[dropCellIndex]);
				geo3.points = null;

				if (geo3.getTerminalPoint(false) != null) {
					geo3.setTerminalPoint(geo.getTerminalPoint(false), false);
				}
				else if (useParent && graph.model.isVertex(targetParent)) {
					// Adds parent offset to other nodes
					var tmpState = graph.view.getState(targetParent);
					var offset = (tmpState.cell != graph.view.currentRoot) ?
						tmpState.origin : new mxPoint(0, 0);

					graph.cellsMoved(targets, offset.x, offset.y, null, null, true);
				}
			}
			else {
				geo2 = graph.getCellGeometry(targets[dropCellIndex]);
				dx = geo.x - Math.round(geo2.x);
				dy = geo.y - Math.round(geo2.y);
				geo.x = Math.round(geo2.x);
				geo.y = Math.round(geo2.y);
				graph.model.setGeometry(targets[dropCellIndex], geo);
				graph.cellsMoved(targets, dx, dy, null, null, true);
				tmp = targets.slice();
				editingCell = (tmp.length == 1) ? tmp[0] : null;
				targets.push(graph.insertEdge(null, null, '', source, targets[dropCellIndex],
					graph.createCurrentEdgeStyle()));
			}

			if (evt == null || !mxEvent.isShiftDown(evt)) {
				graph.fireEvent(new mxEventObject('cellsInserted', 'cells', targets));
			}
		}
		catch (e) {
			this.editorUi.handleError(e);
		}
		finally {
			graph.model.endUpdate();
		}

		if (graph.editAfterInsert && evt != null && mxEvent.isMouseEvent(evt) &&
			editingCell != null) {
			window.setTimeout(function () {
				graph.startEditing(editingCell);
			}, 0);
		}
	}

	return tmp;
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.getDropAndConnectGeometry = function (source, target, direction, targets) {
	var graph = this.editorUi.editor.graph;
	var view = graph.view;
	var keepSize = targets.length > 1;
	var geo = graph.getCellGeometry(source);
	var geo2 = graph.getCellGeometry(target);

	if (geo != null && geo2 != null) {
		geo2 = geo2.clone();

		if (graph.model.isEdge(source)) {
			var state = graph.view.getState(source);
			var pts = state.absolutePoints;
			var p0 = pts[0];
			var pe = pts[pts.length - 1];

			if (direction == mxConstants.DIRECTION_NORTH) {
				geo2.x = p0.x / view.scale - view.translate.x - geo2.width / 2;
				geo2.y = p0.y / view.scale - view.translate.y - geo2.height / 2;
			}
			else {
				geo2.x = pe.x / view.scale - view.translate.x - geo2.width / 2;
				geo2.y = pe.y / view.scale - view.translate.y - geo2.height / 2;
			}
		}
		else {
			if (geo.relative) {
				var state = graph.view.getState(source);
				geo = geo.clone();
				geo.x = (state.x - view.translate.x) / view.scale;
				geo.y = (state.y - view.translate.y) / view.scale;
			}

			var length = graph.defaultEdgeLength;

			// Maintains edge length
			if (graph.model.isEdge(target) && geo2.getTerminalPoint(true) != null &&
				geo2.getTerminalPoint(false) != null) {
				var p0 = geo2.getTerminalPoint(true);
				var pe = geo2.getTerminalPoint(false);
				var dx = pe.x - p0.x;
				var dy = pe.y - p0.y;

				length = Math.sqrt(dx * dx + dy * dy);

				geo2.x = geo.getCenterX();
				geo2.y = geo.getCenterY();
				geo2.width = 1;
				geo2.height = 1;

				if (direction == mxConstants.DIRECTION_NORTH) {
					geo2.height = length
					geo2.y = geo.y - length;
					geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y), false);
				}
				else if (direction == mxConstants.DIRECTION_EAST) {
					geo2.width = length
					geo2.x = geo.x + geo.width;
					geo2.setTerminalPoint(new mxPoint(geo2.x + geo2.width, geo2.y), false);
				}
				else if (direction == mxConstants.DIRECTION_SOUTH) {
					geo2.height = length
					geo2.y = geo.y + geo.height;
					geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y + geo2.height), false);
				}
				else if (direction == mxConstants.DIRECTION_WEST) {
					geo2.width = length
					geo2.x = geo.x - length;
					geo2.setTerminalPoint(new mxPoint(geo2.x, geo2.y), false);
				}
			}
			else {
				// Try match size or ignore if width or height < 45 which
				// is considered special enough to be ignored here
				if (!keepSize && geo2.width > 45 && geo2.height > 45 &&
					geo.width > 45 && geo.height > 45) {
					geo2.width = geo2.width * (geo.height / geo2.height);
					geo2.height = geo.height;
				}

				geo2.x = geo.x + geo.width / 2 - geo2.width / 2;
				geo2.y = geo.y + geo.height / 2 - geo2.height / 2;

				if (direction == mxConstants.DIRECTION_NORTH) {
					geo2.y = geo2.y - geo.height / 2 - geo2.height / 2 - length;
				}
				else if (direction == mxConstants.DIRECTION_EAST) {
					geo2.x = geo2.x + geo.width / 2 + geo2.width / 2 + length;
				}
				else if (direction == mxConstants.DIRECTION_SOUTH) {
					geo2.y = geo2.y + geo.height / 2 + geo2.height / 2 + length;
				}
				else if (direction == mxConstants.DIRECTION_WEST) {
					geo2.x = geo2.x - geo.width / 2 - geo2.width / 2 - length;
				}

				// Adds offset to match cells without connecting edge
				if (graph.model.isEdge(target) && geo2.getTerminalPoint(true) != null &&
					target.getTerminal(false) != null) {
					var targetGeo = graph.getCellGeometry(target.getTerminal(false));

					if (targetGeo != null) {
						if (direction == mxConstants.DIRECTION_NORTH) {
							geo2.x -= targetGeo.getCenterX();
							geo2.y -= targetGeo.getCenterY() + targetGeo.height / 2;
						}
						else if (direction == mxConstants.DIRECTION_EAST) {
							geo2.x -= targetGeo.getCenterX() - targetGeo.width / 2;
							geo2.y -= targetGeo.getCenterY();
						}
						else if (direction == mxConstants.DIRECTION_SOUTH) {
							geo2.x -= targetGeo.getCenterX();
							geo2.y -= targetGeo.getCenterY() - targetGeo.height / 2;
						}
						else if (direction == mxConstants.DIRECTION_WEST) {
							geo2.x -= targetGeo.getCenterX() + targetGeo.width / 2;
							geo2.y -= targetGeo.getCenterY();
						}
					}
				}
			}
		}
	}

	return geo2;
};

/**
 * Limits drop style to non-transparent source shapes.
 */
Sidebar.prototype.isDropStyleEnabled = function (cells, firstVertex) {
	var result = true;

	if (firstVertex != null && cells.length == 1) {
		var vstyle = this.graph.getCellStyle(cells[firstVertex]);

		if (vstyle != null) {
			result = mxUtils.getValue(vstyle, mxConstants.STYLE_STROKECOLOR, mxConstants.NONE) != mxConstants.NONE ||
				mxUtils.getValue(vstyle, mxConstants.STYLE_FILLCOLOR, mxConstants.NONE) != mxConstants.NONE;
		}
	}

	return result;
};

/**
 * Ignores swimlanes as drop style targets.
 */
Sidebar.prototype.isDropStyleTargetIgnored = function (state) {
	return this.graph.isSwimlane(state.cell) || this.graph.isTableCell(state.cell) ||
		this.graph.isTableRow(state.cell) || this.graph.isTable(state.cell);
};

/**
 * Creates a drag source for the given element.
 */
Sidebar.prototype.createDragSource = function (elt, dropHandler, preview, cells, bounds) {
	// Checks if the cells contain any vertices
	var ui = this.editorUi;
	var graph = ui.editor.graph;
	var freeSourceEdge = null;
	var firstVertex = null;
	var sidebar = this;

	for (var i = 0; i < cells.length; i++) {
		if (firstVertex == null && graph.model.isVertex(cells[i])) {
			firstVertex = i;
		}
		else if (freeSourceEdge == null && graph.model.isEdge(cells[i]) &&
			graph.model.getTerminal(cells[i], true) == null) {
			freeSourceEdge = i;
		}

		if (firstVertex != null && freeSourceEdge != null) {
			break;
		}
	}

	var dropStyleEnabled = this.isDropStyleEnabled(cells, firstVertex);

	var dragSource = mxUtils.makeDraggable(elt, graph, mxUtils.bind(this, function (graph, evt, target, x, y) {
		if (this.updateThread != null) {
			window.clearTimeout(this.updateThread);
		}

		if (cells != null && currentStyleTarget != null && activeArrow == styleTarget) {
			var tmp = graph.isCellSelected(currentStyleTarget.cell) ? graph.getSelectionCells() : [currentStyleTarget.cell];
			var updatedCells = this.updateShapes((graph.model.isEdge(currentStyleTarget.cell)) ? cells[0] : cells[firstVertex], tmp);
			graph.setSelectionCells(updatedCells);
		}
		else if (cells != null && activeArrow != null && currentTargetState != null && activeArrow != styleTarget) {
			var index = (graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null) ? firstVertex : freeSourceEdge;
			graph.setSelectionCells(this.dropAndConnect(currentTargetState.cell, cells, direction, index, evt));
		}
		else {
			dropHandler.apply(this, arguments);
		}

		if (this.editorUi.hoverIcons != null) {
			this.editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
		}
	}), preview, 0, 0, graph.autoscroll, true, true);

	// Stops dragging if cancel is pressed
	graph.addListener(mxEvent.ESCAPE, function (sender, evt) {
		if (dragSource.isActive()) {
			dragSource.reset();
		}
	});

	// Overrides mouseDown to ignore popup triggers
	var mouseDown = dragSource.mouseDown;

	dragSource.mouseDown = function (evt) {
		if (!mxEvent.isPopupTrigger(evt) && !mxEvent.isMultiTouchEvent(evt)) {
			graph.stopEditing();
			mouseDown.apply(this, arguments);
		}
	};

	// 通过怪癖和 IE8 中的图像标签进行事件重定向的解决方法
	function createArrow(img, tooltip) {
		var arrow = null;

		if (mxClient.IS_IE && !mxClient.IS_SVG) {
			// Workaround for PNG images in IE6
			if (mxClient.IS_IE6 && document.compatMode != 'CSS1Compat') {
				arrow = document.createElement(mxClient.VML_PREFIX + ':image');
				arrow.setAttribute('src', img.src);
				arrow.style.borderStyle = 'none';
			}
			else {
				arrow = document.createElement('div');
				arrow.style.backgroundImage = 'url(' + img.src + ')';
				arrow.style.backgroundPosition = 'center';
				arrow.style.backgroundRepeat = 'no-repeat';
			}

			arrow.style.width = (img.width + 4) + 'px';
			arrow.style.height = (img.height + 4) + 'px';
			arrow.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
		}
		else {
			arrow = mxUtils.createImage(img.src);
			arrow.style.width = img.width + 'px';
			arrow.style.height = img.height + 'px';
		}

		if (tooltip != null) {
			arrow.setAttribute('title', tooltip);
		}

		mxUtils.setOpacity(arrow, (img == this.refreshTarget) ? 30 : 20);
		arrow.style.position = 'absolute';
		arrow.style.cursor = 'crosshair';

		return arrow;
	};

	var currentTargetState = null;
	var currentStateHandle = null;
	var currentStyleTarget = null;
	var activeTarget = false;

	var arrowUp = createArrow(this.triangleUp, mxResources.get('connect'));
	var arrowRight = createArrow(this.triangleRight, mxResources.get('connect'));
	var arrowDown = createArrow(this.triangleDown, mxResources.get('connect'));
	var arrowLeft = createArrow(this.triangleLeft, mxResources.get('connect'));
	var styleTarget = createArrow(this.refreshTarget, mxResources.get('replace'));
	// Workaround for actual parentNode not being updated in old IE
	var styleTargetParent = null;
	var roundSource = createArrow(this.roundDrop);
	var roundTarget = createArrow(this.roundDrop);
	var direction = mxConstants.DIRECTION_NORTH;
	var activeArrow = null;

	function checkArrow(x, y, bounds, arrow) {
		if (arrow.parentNode != null) {
			if (mxUtils.contains(bounds, x, y)) {
				mxUtils.setOpacity(arrow, 100);
				activeArrow = arrow;
			}
			else {
				mxUtils.setOpacity(arrow, (arrow == styleTarget) ? 30 : 20);
			}
		}

		return bounds;
	};

	// Hides guides and preview if target is active
	var dsCreatePreviewElement = dragSource.createPreviewElement;

	// Stores initial size of preview element
	dragSource.createPreviewElement = function (graph) {
		var elt = dsCreatePreviewElement.apply(this, arguments);

		// Pass-through events required to tooltip on replace shape
		if (mxClient.IS_SVG) {
			elt.style.pointerEvents = 'none';
		}

		this.previewElementWidth = elt.style.width;
		this.previewElementHeight = elt.style.height;

		return elt;
	};

	// Shows/hides hover icons
	var dragEnter = dragSource.dragEnter;
	dragSource.dragEnter = function (graph, evt) {
		if (ui.hoverIcons != null) {
			ui.hoverIcons.setDisplay('none');
		}

		dragEnter.apply(this, arguments);
	};

	var dragExit = dragSource.dragExit;
	dragSource.dragExit = function (graph, evt) {
		if (ui.hoverIcons != null) {
			ui.hoverIcons.setDisplay('');
		}

		dragExit.apply(this, arguments);
	};

	dragSource.dragOver = function (graph, evt) {
		mxDragSource.prototype.dragOver.apply(this, arguments);

		if (this.currentGuide != null && activeArrow != null) {
			this.currentGuide.hide();
		}

		if (this.previewElement != null) {
			var view = graph.view;

			if (currentStyleTarget != null && activeArrow == styleTarget) {
				this.previewElement.style.display = (graph.model.isEdge(currentStyleTarget.cell)) ? 'none' : '';

				this.previewElement.style.left = currentStyleTarget.x + 'px';
				this.previewElement.style.top = currentStyleTarget.y + 'px';
				this.previewElement.style.width = currentStyleTarget.width + 'px';
				this.previewElement.style.height = currentStyleTarget.height + 'px';
			}
			else if (currentTargetState != null && activeArrow != null) {
				if (dragSource.currentHighlight != null && dragSource.currentHighlight.state != null) {
					dragSource.currentHighlight.hide();
				}

				var index = (graph.model.isEdge(currentTargetState.cell) || freeSourceEdge == null) ? firstVertex : freeSourceEdge;
				var geo = sidebar.getDropAndConnectGeometry(currentTargetState.cell, cells[index], direction, cells);
				var geo2 = (!graph.model.isEdge(currentTargetState.cell)) ? graph.getCellGeometry(currentTargetState.cell) : null;
				var geo3 = graph.getCellGeometry(cells[index]);
				var parent = graph.model.getParent(currentTargetState.cell);
				var dx = view.translate.x * view.scale;
				var dy = view.translate.y * view.scale;

				if (geo2 != null && !geo2.relative && graph.model.isVertex(parent) && parent != view.currentRoot) {
					var pState = view.getState(parent);

					dx = pState.x;
					dy = pState.y;
				}

				var dx2 = geo3.x;
				var dy2 = geo3.y;

				// Ignores geometry of edges
				if (graph.model.isEdge(cells[index])) {
					dx2 = 0;
					dy2 = 0;
				}

				// Shows preview at drop location
				this.previewElement.style.left = ((geo.x - dx2) * view.scale + dx) + 'px';
				this.previewElement.style.top = ((geo.y - dy2) * view.scale + dy) + 'px';

				if (cells.length == 1) {
					this.previewElement.style.width = (geo.width * view.scale) + 'px';
					this.previewElement.style.height = (geo.height * view.scale) + 'px';
				}

				this.previewElement.style.display = '';
			}
			else if (dragSource.currentHighlight.state != null &&
				graph.model.isEdge(dragSource.currentHighlight.state.cell)) {
				// Centers drop cells when splitting edges
				this.previewElement.style.left = Math.round(parseInt(this.previewElement.style.left) -
					bounds.width * view.scale / 2) + 'px';
				this.previewElement.style.top = Math.round(parseInt(this.previewElement.style.top) -
					bounds.height * view.scale / 2) + 'px';
			}
			else {
				this.previewElement.style.width = this.previewElementWidth;
				this.previewElement.style.height = this.previewElementHeight;
				this.previewElement.style.display = '';
			}
		}
	};

	var startTime = new Date().getTime();
	var timeOnTarget = 0;
	var prev = null;

	// Gets source cell style to compare shape below
	var sourceCellStyle = this.editorUi.editor.graph.getCellStyle(cells[0]);

	// Allows drop into cell only if target is a valid root
	dragSource.getDropTarget = mxUtils.bind(this, function (graph, x, y, evt) {
		// Alt means no targets at all
		// LATER: Show preview where result will go
		var cell = (!mxEvent.isAltDown(evt) && cells != null) ?
			graph.getCellAt(x, y, null, null, null, function (state, x, y) {
				return graph.isContainer(state.cell);
			}) : null;

		// Uses connectable parent vertex if one exists
		if (cell != null && !this.graph.isCellConnectable(cell) &&
			!this.graph.model.isEdge(cell)) {
			var parent = this.graph.getModel().getParent(cell);

			if (this.graph.getModel().isVertex(parent) &&
				this.graph.isCellConnectable(parent)) {
				cell = parent;
			}
		}

		// Ignores locked cells
		if (graph.isCellLocked(cell)) {
			cell = null;
		}

		var state = graph.view.getState(cell);
		activeArrow = null;
		var bbox = null;

		// Time on target
		if (prev != state) {
			startTime = new Date().getTime();
			timeOnTarget = 0;
			prev = state;

			if (this.updateThread != null) {
				window.clearTimeout(this.updateThread);
			}

			if (state != null) {
				this.updateThread = window.setTimeout(function () {
					if (activeArrow == null) {
						prev = state;
						dragSource.getDropTarget(graph, x, y, evt);
					}
				}, this.dropTargetDelay + 10);
			}
		}
		else {
			timeOnTarget = new Date().getTime() - startTime;
		}

		// Shift means disabled, delayed on cells with children, shows after this.dropTargetDelay, hides after 2500ms
		if (dropStyleEnabled && (timeOnTarget < 2500) && state != null && !mxEvent.isShiftDown(evt) &&
			// If shape is equal or target has no stroke, fill and gradient then use longer delay except for images
			(((mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE) != mxUtils.getValue(sourceCellStyle, mxConstants.STYLE_SHAPE) &&
				(mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, mxConstants.NONE) != mxConstants.NONE ||
					mxUtils.getValue(state.style, mxConstants.STYLE_FILLCOLOR, mxConstants.NONE) != mxConstants.NONE ||
					mxUtils.getValue(state.style, mxConstants.STYLE_GRADIENTCOLOR, mxConstants.NONE) != mxConstants.NONE)) ||
				mxUtils.getValue(sourceCellStyle, mxConstants.STYLE_SHAPE) == 'image') ||
				timeOnTarget > 1500 || graph.model.isEdge(state.cell)) && (timeOnTarget > this.dropTargetDelay) &&
			!this.isDropStyleTargetIgnored(state) && ((graph.model.isVertex(state.cell) && firstVertex != null) ||
				(graph.model.isEdge(state.cell) && graph.model.isEdge(cells[0])))) {
			currentStyleTarget = state;
			var tmp = (graph.model.isEdge(state.cell)) ? graph.view.getPoint(state) :
				new mxPoint(state.getCenterX(), state.getCenterY());
			tmp = new mxRectangle(tmp.x - this.refreshTarget.width / 2, tmp.y - this.refreshTarget.height / 2,
				this.refreshTarget.width, this.refreshTarget.height);

			styleTarget.style.left = Math.floor(tmp.x) + 'px';
			styleTarget.style.top = Math.floor(tmp.y) + 'px';

			if (styleTargetParent == null) {
				graph.container.appendChild(styleTarget);
				styleTargetParent = styleTarget.parentNode;
			}

			checkArrow(x, y, tmp, styleTarget);
		}
		// Does not reset on ignored edges
		else if (currentStyleTarget == null || !mxUtils.contains(currentStyleTarget, x, y) ||
			(timeOnTarget > 1500 && !mxEvent.isShiftDown(evt))) {
			currentStyleTarget = null;

			if (styleTargetParent != null) {
				styleTarget.parentNode.removeChild(styleTarget);
				styleTargetParent = null;
			}
		}
		else if (currentStyleTarget != null && styleTargetParent != null) {
			// Sets active Arrow as side effect
			var tmp = (graph.model.isEdge(currentStyleTarget.cell)) ? graph.view.getPoint(currentStyleTarget) : new mxPoint(currentStyleTarget.getCenterX(), currentStyleTarget.getCenterY());
			tmp = new mxRectangle(tmp.x - this.refreshTarget.width / 2, tmp.y - this.refreshTarget.height / 2,
				this.refreshTarget.width, this.refreshTarget.height);
			checkArrow(x, y, tmp, styleTarget);
		}

		// Checks if inside bounds
		if (activeTarget && currentTargetState != null && !mxEvent.isAltDown(evt) && activeArrow == null) {
			// LATER: Use hit-detection for edges
			bbox = mxRectangle.fromRectangle(currentTargetState);

			if (graph.model.isEdge(currentTargetState.cell)) {
				var pts = currentTargetState.absolutePoints;

				if (roundSource.parentNode != null) {
					var p0 = pts[0];
					bbox.add(checkArrow(x, y, new mxRectangle(p0.x - this.roundDrop.width / 2,
						p0.y - this.roundDrop.height / 2, this.roundDrop.width, this.roundDrop.height), roundSource));
				}

				if (roundTarget.parentNode != null) {
					var pe = pts[pts.length - 1];
					bbox.add(checkArrow(x, y, new mxRectangle(pe.x - this.roundDrop.width / 2,
						pe.y - this.roundDrop.height / 2,
						this.roundDrop.width, this.roundDrop.height), roundTarget));
				}
			}
			else {
				var bds = mxRectangle.fromRectangle(currentTargetState);

				// Uses outer bounding box to take rotation into account
				if (currentTargetState.shape != null && currentTargetState.shape.boundingBox != null) {
					bds = mxRectangle.fromRectangle(currentTargetState.shape.boundingBox);
				}

				bds.grow(this.graph.tolerance);
				bds.grow(HoverIcons.prototype.arrowSpacing);

				var handler = this.graph.selectionCellsHandler.getHandler(currentTargetState.cell);

				if (handler != null) {
					bds.x -= handler.horizontalOffset / 2;
					bds.y -= handler.verticalOffset / 2;
					bds.width += handler.horizontalOffset;
					bds.height += handler.verticalOffset;

					// Adds bounding box of rotation handle to avoid overlap
					if (handler.rotationShape != null && handler.rotationShape.node != null &&
						handler.rotationShape.node.style.visibility != 'hidden' &&
						handler.rotationShape.node.style.display != 'none' &&
						handler.rotationShape.boundingBox != null) {
						bds.add(handler.rotationShape.boundingBox);
					}
				}

				bbox.add(checkArrow(x, y, new mxRectangle(currentTargetState.getCenterX() - this.triangleUp.width / 2,
					bds.y - this.triangleUp.height, this.triangleUp.width, this.triangleUp.height), arrowUp));
				bbox.add(checkArrow(x, y, new mxRectangle(bds.x + bds.width,
					currentTargetState.getCenterY() - this.triangleRight.height / 2,
					this.triangleRight.width, this.triangleRight.height), arrowRight));
				bbox.add(checkArrow(x, y, new mxRectangle(currentTargetState.getCenterX() - this.triangleDown.width / 2,
					bds.y + bds.height, this.triangleDown.width, this.triangleDown.height), arrowDown));
				bbox.add(checkArrow(x, y, new mxRectangle(bds.x - this.triangleLeft.width,
					currentTargetState.getCenterY() - this.triangleLeft.height / 2,
					this.triangleLeft.width, this.triangleLeft.height), arrowLeft));
			}

			// Adds tolerance
			if (bbox != null) {
				bbox.grow(10);
			}
		}

		direction = mxConstants.DIRECTION_NORTH;

		if (activeArrow == arrowRight) {
			direction = mxConstants.DIRECTION_EAST;
		}
		else if (activeArrow == arrowDown || activeArrow == roundTarget) {
			direction = mxConstants.DIRECTION_SOUTH;
		}
		else if (activeArrow == arrowLeft) {
			direction = mxConstants.DIRECTION_WEST;
		}

		if (currentStyleTarget != null && activeArrow == styleTarget) {
			state = currentStyleTarget;
		}

		var validTarget = (firstVertex == null || graph.isCellConnectable(cells[firstVertex])) &&
			((graph.model.isEdge(cell) && firstVertex != null) ||
				(graph.model.isVertex(cell) && graph.isCellConnectable(cell)));

		// Drop arrows shown after this.dropTargetDelay, hidden after 5 secs, switches arrows after 500ms
		if ((currentTargetState != null && timeOnTarget >= 5000) ||
			(currentTargetState != state &&
				(bbox == null || !mxUtils.contains(bbox, x, y) ||
					(timeOnTarget > 500 && activeArrow == null && validTarget)))) {
			activeTarget = false;
			currentTargetState = ((timeOnTarget < 5000 && timeOnTarget > this.dropTargetDelay) ||
				graph.model.isEdge(cell)) ? state : null;

			if (currentTargetState != null && validTarget) {
				var elts = [roundSource, roundTarget, arrowUp, arrowRight, arrowDown, arrowLeft];

				for (var i = 0; i < elts.length; i++) {
					if (elts[i].parentNode != null) {
						elts[i].parentNode.removeChild(elts[i]);
					}
				}

				if (graph.model.isEdge(cell)) {
					var pts = state.absolutePoints;

					if (pts != null) {
						var p0 = pts[0];
						var pe = pts[pts.length - 1];
						var tol = graph.tolerance;
						var box = new mxRectangle(x - tol, y - tol, 2 * tol, 2 * tol);

						roundSource.style.left = Math.floor(p0.x - this.roundDrop.width / 2) + 'px';
						roundSource.style.top = Math.floor(p0.y - this.roundDrop.height / 2) + 'px';

						roundTarget.style.left = Math.floor(pe.x - this.roundDrop.width / 2) + 'px';
						roundTarget.style.top = Math.floor(pe.y - this.roundDrop.height / 2) + 'px';

						if (graph.model.getTerminal(cell, true) == null) {
							graph.container.appendChild(roundSource);
						}

						if (graph.model.getTerminal(cell, false) == null) {
							graph.container.appendChild(roundTarget);
						}
					}
				}
				else {
					var bds = mxRectangle.fromRectangle(state);

					// Uses outer bounding box to take rotation into account
					if (state.shape != null && state.shape.boundingBox != null) {
						bds = mxRectangle.fromRectangle(state.shape.boundingBox);
					}

					bds.grow(this.graph.tolerance);
					bds.grow(HoverIcons.prototype.arrowSpacing);

					var handler = this.graph.selectionCellsHandler.getHandler(state.cell);

					if (handler != null) {
						bds.x -= handler.horizontalOffset / 2;
						bds.y -= handler.verticalOffset / 2;
						bds.width += handler.horizontalOffset;
						bds.height += handler.verticalOffset;

						// Adds bounding box of rotation handle to avoid overlap
						if (handler.rotationShape != null && handler.rotationShape.node != null &&
							handler.rotationShape.node.style.visibility != 'hidden' &&
							handler.rotationShape.node.style.display != 'none' &&
							handler.rotationShape.boundingBox != null) {
							bds.add(handler.rotationShape.boundingBox);
						}
					}

					arrowUp.style.left = Math.floor(state.getCenterX() - this.triangleUp.width / 2) + 'px';
					arrowUp.style.top = Math.floor(bds.y - this.triangleUp.height) + 'px';

					arrowRight.style.left = Math.floor(bds.x + bds.width) + 'px';
					arrowRight.style.top = Math.floor(state.getCenterY() - this.triangleRight.height / 2) + 'px';

					arrowDown.style.left = arrowUp.style.left
					arrowDown.style.top = Math.floor(bds.y + bds.height) + 'px';

					arrowLeft.style.left = Math.floor(bds.x - this.triangleLeft.width) + 'px';
					arrowLeft.style.top = arrowRight.style.top;

					if (state.style['portConstraint'] != 'eastwest') {
						graph.container.appendChild(arrowUp);
						graph.container.appendChild(arrowDown);
					}

					graph.container.appendChild(arrowRight);
					graph.container.appendChild(arrowLeft);
				}

				// Hides handle for cell under mouse
				if (state != null) {
					currentStateHandle = graph.selectionCellsHandler.getHandler(state.cell);

					if (currentStateHandle != null && currentStateHandle.setHandlesVisible != null) {
						currentStateHandle.setHandlesVisible(false);
					}
				}

				activeTarget = true;
			}
			else {
				var elts = [roundSource, roundTarget, arrowUp, arrowRight, arrowDown, arrowLeft];

				for (var i = 0; i < elts.length; i++) {
					if (elts[i].parentNode != null) {
						elts[i].parentNode.removeChild(elts[i]);
					}
				}
			}
		}

		if (!activeTarget && currentStateHandle != null) {
			currentStateHandle.setHandlesVisible(true);
		}

		// Handles drop target
		var target = ((!mxEvent.isAltDown(evt) || mxEvent.isShiftDown(evt)) &&
			!(currentStyleTarget != null && activeArrow == styleTarget)) ?
			mxDragSource.prototype.getDropTarget.apply(this, arguments) : null;
		var model = graph.getModel();

		if (target != null) {
			if (activeArrow != null || !graph.isSplitTarget(target, cells, evt)) {
				// Selects parent group as drop target
				while (target != null && !graph.isValidDropTarget(target, cells, evt) &&
					model.isVertex(model.getParent(target))) {
					target = model.getParent(target);
				}

				if (target != null && (graph.view.currentRoot == target ||
					(!graph.isValidRoot(target) &&
						graph.getModel().getChildCount(target) == 0) ||
					graph.isCellLocked(target) || model.isEdge(target) ||
					!graph.isValidDropTarget(target, cells, evt))) {
					target = null;
				}
			}
		}

		return target;
	});

	dragSource.stopDrag = function () {
		mxDragSource.prototype.stopDrag.apply(this, arguments);

		var elts = [roundSource, roundTarget, styleTarget, arrowUp, arrowRight, arrowDown, arrowLeft];

		for (var i = 0; i < elts.length; i++) {
			if (elts[i].parentNode != null) {
				elts[i].parentNode.removeChild(elts[i]);
			}
		}

		if (currentTargetState != null && currentStateHandle != null) {
			currentStateHandle.reset();
		}

		currentStateHandle = null;
		currentTargetState = null;
		currentStyleTarget = null;
		styleTargetParent = null;
		activeArrow = null;
	};

	return dragSource;
};

/**
 * Adds a handler for inserting the cell with a single click.
 */
Sidebar.prototype.itemClicked = function (cells, ds, evt, elt) {
	var graph = this.editorUi.editor.graph;
	graph.container.focus();

	// Alt+Click inserts and connects
	if (mxEvent.isAltDown(evt) && graph.getSelectionCount() == 1 &&
		graph.model.isVertex(graph.getSelectionCell())) {
		var firstVertex = null;

		for (var i = 0; i < cells.length && firstVertex == null; i++) {
			if (graph.model.isVertex(cells[i])) {
				firstVertex = i;
			}
		}

		if (firstVertex != null) {
			graph.setSelectionCells(this.dropAndConnect(graph.getSelectionCell(), cells,
				(mxEvent.isMetaDown(evt) || mxEvent.isControlDown(evt)) ?
					(mxEvent.isShiftDown(evt) ? mxConstants.DIRECTION_WEST : mxConstants.DIRECTION_NORTH) :
					(mxEvent.isShiftDown(evt) ? mxConstants.DIRECTION_EAST : mxConstants.DIRECTION_SOUTH),
				firstVertex, evt));
			graph.scrollCellToVisible(graph.getSelectionCell());
		}
	}
	// Shift+Click updates shape
	else if (mxEvent.isShiftDown(evt) && !graph.isSelectionEmpty()) {
		this.updateShapes(cells[0], graph.getSelectionCells());
		graph.scrollCellToVisible(graph.getSelectionCell());
	}
	else {
		var pt = (mxEvent.isAltDown(evt)) ? graph.getFreeInsertPoint() :
			graph.getCenterInsertPoint(graph.getBoundingBoxFromGeometry(cells, true));
		ds.drop(graph, evt, null, pt.x, pt.y, true);
	}
};

/**
 * Adds a handler for inserting the cell with a single click.
 */
Sidebar.prototype.addClickHandler = function (elt, ds, cells) {
	var graph = this.editorUi.editor.graph;
	var oldMouseDown = ds.mouseDown;
	var oldMouseMove = ds.mouseMove;
	var oldMouseUp = ds.mouseUp;
	var tol = graph.tolerance;
	var first = null;
	var sb = this;

	ds.mouseDown = function (evt) {
		oldMouseDown.apply(this, arguments);
		first = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));

		if (this.dragElement != null) {
			this.dragElement.style.display = 'none';
			mxUtils.setOpacity(elt, 50);
		}
	};

	ds.mouseMove = function (evt) {
		if (this.dragElement != null && this.dragElement.style.display == 'none' &&
			first != null && (Math.abs(first.x - mxEvent.getClientX(evt)) > tol ||
				Math.abs(first.y - mxEvent.getClientY(evt)) > tol)) {
			this.dragElement.style.display = '';
			mxUtils.setOpacity(elt, 100);
		}

		oldMouseMove.apply(this, arguments);
	};

	ds.mouseUp = function (evt) {
		try {
			if (!mxEvent.isPopupTrigger(evt) && this.currentGraph == null &&
				this.dragElement != null && this.dragElement.style.display == 'none') {
				sb.itemClicked(cells, ds, evt, elt);
			}

			oldMouseUp.apply(ds, arguments);
			mxUtils.setOpacity(elt, 100);
			first = null;

			// Blocks tooltips on this element after single click
			sb.currentElt = elt;
		}
		catch (e) {
			ds.reset();
			sb.editorUi.handleError(e);
		}
	};
};

/**
 *创建用于插入给定单元格的放置处理程序。 
 */
Sidebar.prototype.createVertexTemplateEntry = function (style, width, height, value, title, showLabel, showTitle, tags) {
	tags = (tags != null && tags.length > 0) ? tags : ((title != null) ? title.toLowerCase() : '');

	return this.addEntry(tags, mxUtils.bind(this, function () {
		return this.createVertexTemplate(style, width, height, value, title, showLabel, showTitle);
	}));
}

// Sidebar.prototype.createVertexTemplateEntry = function (style, width, height, value, title, showLabel, showTitle, tags) {
// 	tags = (tags != null && tags.length > 0) ? tags : ((title != null) ? title.toLowerCase() : '');
//
// 	return this.addEntry(tags, mxUtils.bind(this, function () {
// 		return this.createVertexTemplate(style, width, height, value, title, showLabel, showTitle);
// 	}));
// }

/**
 *创建用于插入给定单元格的放置处理程序。
 */
Sidebar.prototype.createVertexTemplate = function (style, width, height, value, title, showLabel, showTitle, allowCellsInserted) {
	// 构造mxcell实例  
	// value：用于定义图元的内容，支持添加dom对象，字符串。     
	// geometry：图形的几何数值，关于顶点类型记录了图形的x，y，宽度，高度属性；边缘类型将会记录线段相互连接的点。
	// style：图形样式
	var cells = [new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style)];
	// 将cell设定为几何图案类型
	cells[0].vertex = true;

	// 从单元创建顶点模板
	return this.createVertexTemplateFromCells(cells, width, height, title, showLabel, showTitle, allowCellsInserted);
};

/**
 *创建用于插入给定单元格的放置处理程序。
 */
Sidebar.prototype.createVertexTemplateFromData = function (data, width, height, title, showLabel, showTitle, allowCellsInserted) {
	var doc = mxUtils.parseXml(Graph.decompress(data));
	var codec = new mxCodec(doc);

	var model = new mxGraphModel();
	codec.decode(doc.documentElement, model);

	var cells = this.graph.cloneCells(model.root.getChildAt(0).children);

	return this.createVertexTemplateFromCells(cells, width, height, title, showLabel, showTitle, allowCellsInserted);
};

/**
 *创建用于插入给定单元格的放置处理程序。
 */
Sidebar.prototype.createVertexTemplateFromCells = function (cells, width, height, title, showLabel, showTitle, allowCellsInserted) {
	// Use this line to convert calls to this function with lots of boilerplate code for creating cells
	//console.trace('xml', Graph.compress(mxUtils.getXml(this.graph.encodeCells(cells))), cells);
	return this.createItem(cells, title, showLabel, showTitle, width, height, allowCellsInserted);
};

/**
 * 
 */
Sidebar.prototype.createEdgeTemplateEntry = function (style, width, height, value, title, showLabel, tags, allowCellsInserted) {
	tags = (tags != null && tags.length > 0) ? tags : title.toLowerCase();

	return this.addEntry(tags, mxUtils.bind(this, function () {
		return this.createEdgeTemplate(style, width, height, value, title, showLabel, allowCellsInserted);
	}));
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createEdgeTemplate = function (style, width, height, value, title, showLabel, allowCellsInserted) {
	var cell = new mxCell((value != null) ? value : '', new mxGeometry(0, 0, width, height), style);
	cell.geometry.setTerminalPoint(new mxPoint(0, height), true);
	cell.geometry.setTerminalPoint(new mxPoint(width, 0), false);
	cell.geometry.relative = true;
	cell.edge = true;

	return this.createEdgeTemplateFromCells([cell], width, height, title, showLabel, allowCellsInserted);
};

/**
 * Creates a drop handler for inserting the given cells.
 */
Sidebar.prototype.createEdgeTemplateFromCells = function (cells, width, height, title, showLabel, allowCellsInserted) {
	return this.createItem(cells, title, showLabel, true, width, height, allowCellsInserted);
};

/**
 *添加给定的调色板。
 */
Sidebar.prototype.addPaletteFunctions = function (id, title, expanded, fns) {
	this.addPalette(id, title, expanded, mxUtils.bind(this, function (content) {
		for (var i = 0; i < fns.length; i++) {
			content.appendChild(fns[i](content));
		}
	}));
};

/**
 * Adds the given palette.
 */
Sidebar.prototype.addPalette = function (id, title, expanded, onInit) {
	var elt = this.createTitle(title);
	this.container.appendChild(elt);

	var div = document.createElement('div');
	div.className = 'geSidebar';

	//禁用内置平移和缩放IE10及更高版本
	if (mxClient.IS_POINTER) {
		div.style.touchAction = 'none';
	}

	if (expanded) {
		onInit(div);
		onInit = null;
	}
	else {
		div.style.display = 'none';
	}

	this.addFoldingHandler(elt, div, onInit);

	var outer = document.createElement('div');
	outer.appendChild(div);
	this.container.appendChild(outer);

	//保留对DOM节点的引用
	if (id != null) {
		this.palettes[id] = [elt, outer];
	}

	return div;
};

/**
 * Create the given title element.
 */
Sidebar.prototype.addFoldingHandler = function (title, content, funct) {
	var initialized = false;

	// Avoids mixed content warning in IE6-8
	if (!mxClient.IS_IE || document.documentMode >= 8) {
		title.style.backgroundImage = (content.style.display == 'none') ?
			'url(\'' + this.collapsedImage + '\')' : 'url(\'' + this.expandedImage + '\')';
	}

	title.style.backgroundRepeat = 'no-repeat';
	title.style.backgroundPosition = '0% 50%';

	mxEvent.addListener(title, 'click', mxUtils.bind(this, function (evt) {
		if (content.style.display == 'none') {
			if (!initialized) {
				initialized = true;

				if (funct != null) {
					//等待光标在Mac上不显示
					title.style.cursor = 'wait';
					var prev = title.innerHTML;
					title.innerHTML = mxResources.get('loading') + '...';

					window.setTimeout(function () {
						content.style.display = 'block';
						title.style.cursor = '';
						title.innerHTML = prev;

						var fo = mxClient.NO_FO;
						mxClient.NO_FO = Editor.prototype.originalNoForeignObject;
						funct(content, title);
						mxClient.NO_FO = fo;
					}, (mxClient.IS_FF) ? 20 : 0);
				}
				else {
					content.style.display = 'block';
				}
			}
			else {
				content.style.display = 'block';
			}

			title.style.backgroundImage = 'url(\'' + this.expandedImage + '\')';
		}
		else {
			title.style.backgroundImage = 'url(\'' + this.collapsedImage + '\')';
			content.style.display = 'none';
		}

		mxEvent.consume(evt);
	}));

	//阻止焦点
	if (!mxClient.IS_QUIRKS) {
		mxEvent.addListener(title, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
			mxUtils.bind(this, function (evt) {
				evt.preventDefault();
			}));
	}
};

/**
 * Removes the palette for the given ID.
 */
Sidebar.prototype.removePalette = function (id) {
	var elts = this.palettes[id];

	if (elts != null) {
		this.palettes[id] = null;

		for (var i = 0; i < elts.length; i++) {
			this.container.removeChild(elts[i]);
		}

		return true;
	}

	return false;
};

/**
 *添加给定的图像调色板。
 */
Sidebar.prototype.addImagePalette = function (id, title, prefix, postfix, items, titles, tags) {
	var showTitles = titles != null;
	var fns = [];

	for (var i = 0; i < items.length; i++) {
		(mxUtils.bind(this, function (item, title, tmpTags) {
			if (tmpTags == null) {
				var slash = item.lastIndexOf('/');
				var dot = item.lastIndexOf('.');
				tmpTags = item.substring((slash >= 0) ? slash + 1 : 0, (dot >= 0) ? dot : item.length).replace(/[-_]/g, ' ');
			
			}

			fns.push(this.createVertexTemplateEntry('image;html=0;image=' + prefix + item + postfix,
				this.defaultImageWidth, this.defaultImageHeight, '', title, title != null, null, this.filterTags(tmpTags)));
		}))(items[i], (titles != null) ? titles[i] : null, (tags != null) ? tags[items[i]] : null);
	}

	this.addPaletteFunctions(id, title, false, fns);
};

/**
 *为给定的模板创建标签数组。允许重复，以后将过滤掉。
 */
Sidebar.prototype.getTagsForStencil = function (packageName, stencilName, moreTags) {
	var tags = packageName.split('.');

	for (var i = 1; i < tags.length; i++) {
		tags[i] = tags[i].replace(/_/g, ' ')
	}

	tags.push(stencilName.replace(/_/g, ' '));

	if (moreTags != null) {
		tags.push(moreTags);
	}

	return tags.slice(1, tags.length);
};

/**
 *添加给定的模具调色板。
 */
// Sidebar.prototype.addStencilPalette = function (id, title, stencilFile, style, ignore, onInit, scale, tags, customFns, groupId) {
// 	scale = (scale != null) ? scale : 1;

// 	if (this.addStencilsToIndex) {
// 		//之后：处理异步加载依赖项
// 		var fns = [];

// 		if (customFns != null) {
// 			for (var i = 0; i < customFns.length; i++) {
// 				fns.push(customFns[i]);
// 			}
// 		}

// 		mxStencilRegistry.loadStencilSet(stencilFile, mxUtils.bind(this, function (packageName, stencilName, displayName, w, h) {
// 			if (ignore == null || mxUtils.indexOf(ignore, stencilName) < 0) {
// 				var tmp = this.getTagsForStencil(packageName, stencilName);
// 				var tmpTags = (tags != null) ? tags[stencilName] : null;

// 				if (tmpTags != null) {
// 					tmp.push(tmpTags);
// 				}

// 				fns.push(this.createVertexTemplateEntry('shape=' + packageName + stencilName.toLowerCase() + style,
// 					Math.round(w * scale), Math.round(h * scale), '', stencilName.replace(/_/g, ' '), null, null,
// 					this.filterTags(tmp.join(' '))));
// 			}
// 		}), true, true);

// 		this.addPaletteFunctions(id, title, false, fns);
// 	}
// 	else {
// 		this.addPalette(id, title, false, mxUtils.bind(this, function (content) {
// 			if (style == null) {
// 				style = '';
// 			}

// 			if (onInit != null) {
// 				onInit.call(this, content);
// 			}

// 			if (customFns != null) {
// 				for (var i = 0; i < customFns.length; i++) {
// 					customFns[i](content);
// 				}
// 			}

// 			mxStencilRegistry.loadStencilSet(stencilFile, mxUtils.bind(this, function (packageName, stencilName, displayName, w, h) {
// 				if (ignore == null || mxUtils.indexOf(ignore, stencilName) < 0) {
// 					content.appendChild(this.createVertexTemplate('shape=' + packageName + stencilName.toLowerCase() + style,
// 						Math.round(w * scale), Math.round(h * scale), '', stencilName.replace(/_/g, ' '), true));
// 				}
// 			}), true);
// 		}));
// 	}
// };

/**
 *添加给定的模具调色板。
 */
Sidebar.prototype.destroy = function () {
	if (this.graph != null) {
		if (this.graph.container != null && this.graph.container.parentNode != null) {
			this.graph.container.parentNode.removeChild(this.graph.container);
		}

		this.graph.destroy();
		this.graph = null;
	}

	if (this.pointerUpHandler != null) {
		mxEvent.removeListener(document, (mxClient.IS_POINTER) ? 'pointerup' : 'mouseup', this.pointerUpHandler);
		this.pointerUpHandler = null;
	}

	if (this.pointerDownHandler != null) {
		mxEvent.removeListener(document, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown', this.pointerDownHandler);
		this.pointerDownHandler = null;
	}

	if (this.pointerMoveHandler != null) {
		mxEvent.removeListener(document, (mxClient.IS_POINTER) ? 'pointermove' : 'mousemove', this.pointerMoveHandler);
		this.pointerMoveHandler = null;
	}

	if (this.pointerOutHandler != null) {
		mxEvent.removeListener(document, (mxClient.IS_POINTER) ? 'pointerout' : 'mouseout', this.pointerOutHandler);
		this.pointerOutHandler = null;
	}
};
