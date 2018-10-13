
var prefix = "/ywgl/jsbZfrwFk"
$(function() {
	load();
});

function load() {
	$('#exampleTable')
			.bootstrapTable(
					{
						method : 'get', // 服务器数据的请求方式 get or post
						url : prefix + "/list", // 服务器数据的加载地址
					//	showRefresh : true,
					//	showToggle : true,
					//	showColumns : true,
						iconSize : 'outline',
						toolbar : '#exampleToolbar',
						striped : true, // 设置为true会有隔行变色效果
						dataType : "json", // 服务器返回的数据类型
						pagination : true, // 设置为true会在底部显示分页条
						// queryParamsType : "limit",
						// //设置为limit则会发送符合RESTFull格式的参数
						singleSelect : false, // 设置为true将禁止多选
						// contentType : "application/x-www-form-urlencoded",
						// //发送到服务器的数据编码类型
						pageSize : 10, // 如果设置了分页，每页数据条数
						pageNumber : 1, // 如果设置了分布，首页页码
						//search : true, // 是否显示搜索框
						showColumns : false, // 是否显示内容下拉框（选择显示的列）
						sidePagination : "server", // 设置在哪里进行分页，可选值为"client" 或者 "server"
						queryParams : function(params) {
							return {
								//说明：传入后台的参数包括offset开始索引，limit步长，sort排序列，order：desc或者,以及所有列的键值对
								limit: params.limit,
								offset:params.offset
					           // name:$('#searchName').val(),
					           // username:$('#searchName').val()
							};
						},
						// //请求服务器数据时，你可以通过重写参数的方式添加一些额外的参数，例如 toolbar 中的参数 如果
						// queryParamsType = 'limit' ,返回参数必须包含
						// limit, offset, search, sort, order 否则, 需要包含:
						// pageSize, pageNumber, searchText, sortName,
						// sortOrder.
						// 返回false将会终止请求
						columns : [
								{
									checkbox : true
								},
																{
									field : 'id', 
									title : '走访任务_反馈ID' 
								},
																{
									field : 'zfrwId', 
									title : '走访任务ID' 
								},
																{
									field : 'hzMc', 
									title : '患者名称' 
								},
																{
									field : 'hzSfzhm', 
									title : '患者身份证号码' 
								},
																{
									field : 'gkdj', 
									title : '管控等级(1=一级管控，2=二级管控，3=三级管控)' 
								},
																{
									field : 'zfdd', 
									title : '走访地点' 
								},
																{
									field : 'lng', 
									title : '经度' 
								},
																{
									field : 'lat', 
									title : '纬度' 
								},
																{
									field : 'hzqkRyzw', 
									title : '患者情况_人员在位(1=在家，2=长期在外，3=走失)' 
								},
																{
									field : 'hzqkCqzwQx', 
									title : '患者情况_长期在外_去向' 
								},
																{
									field : 'hzqkBqwd', 
									title : '患者情况_病情稳定(1=为发病，2=偶然发病，3=经常发病)' 
								},
																{
									field : 'hzqkJhrlz', 
									title : '患者情况_监护人履职(1=履行，2=无力履行，3=不履行)' 
								},
																{
									field : 'hzqkFyqk', 
									title : '患者情况_服药情况(1=规律，2=不规律，3=服药间断，4=无力购药，5=不服药)' 
								},
																{
									field : 'hzqkFxdj', 
									title : '患者情况_风险等级(0=0级，1=1级，2=2级，3=3级，4=4级，5=5级)' 
								},
																{
									field : 'hzqkQtqksm', 
									title : '患者情况_其他情况说明' 
								},
																{
									field : 'mjzfsx', 
									title : '民警嘱咐事项' 
								},
																{
									field : 'zfrq', 
									title : '走访日期' 
								},
																{
									field : 'xczfrq', 
									title : '下次走访日期' 
								},
																{
									field : 'zfmjJh', 
									title : '走访民警_警号' 
								},
																{
									field : 'zfmjMc', 
									title : '走访民警_名称' 
								},
																{
									field : 'lhsfryJh', 
									title : '联合随访人员_警号' 
								},
																{
									field : 'lhsfryMc', 
									title : '联合随访人员_名称' 
								},
																{
									field : 'scsj', 
									title : '生成时间' 
								},
																{
									field : 'isread', 
									title : '是否已读(0=未读，1已读)' 
								},
																{
									field : 'readTime', 
									title : '已读_时间' 
								},
																{
									title : '操作',
									field : 'id',
									align : 'center',
									formatter : function(value, row, index) {
										var e = '<a class="btn btn-primary btn-sm '+s_edit_h+'" href="#" mce_href="#" title="编辑" onclick="edit(\''
												+ row.id
												+ '\')"><i class="fa fa-edit"></i></a> ';
										var d = '<a class="btn btn-warning btn-sm '+s_remove_h+'" href="#" title="删除"  mce_href="#" onclick="remove(\''
												+ row.id
												+ '\')"><i class="fa fa-remove"></i></a> ';
										var f = '<a class="btn btn-success btn-sm" href="#" title="备用"  mce_href="#" onclick="resetPwd(\''
												+ row.id
												+ '\')"><i class="fa fa-key"></i></a> ';
										return e + d ;
									}
								} ]
					});
}
function reLoad() {
	$('#exampleTable').bootstrapTable('refresh');
}
function add() {
	layer.open({
		type : 2,
		title : '增加',
		maxmin : true,
		shadeClose : false, // 点击遮罩关闭层
		area : [ '800px', '520px' ],
		content : prefix + '/add' // iframe的url
	});
}
function edit(id) {
	layer.open({
		type : 2,
		title : '编辑',
		maxmin : true,
		shadeClose : false, // 点击遮罩关闭层
		area : [ '800px', '520px' ],
		content : prefix + '/edit/' + id // iframe的url
	});
}
function remove(id) {
	layer.confirm('确定要删除选中的记录？', {
		btn : [ '确定', '取消' ]
	}, function() {
		$.ajax({
			url : prefix+"/remove",
			type : "post",
			data : {
				'id' : id
			},
			success : function(r) {
				if (r.code==0) {
					layer.msg(r.msg);
					reLoad();
				}else{
					layer.msg(r.msg);
				}
			}
		});
	})
}

function resetPwd(id) {
}
function batchRemove() {
	var rows = $('#exampleTable').bootstrapTable('getSelections'); // 返回所有选择的行，当没有选择的记录时，返回一个空数组
	if (rows.length == 0) {
		layer.msg("请选择要删除的数据");
		return;
	}
	layer.confirm("确认要删除选中的'" + rows.length + "'条数据吗?", {
		btn : [ '确定', '取消' ]
	// 按钮
	}, function() {
		var ids = new Array();
		// 遍历所有选择的行数据，取每条数据对应的ID
		$.each(rows, function(i, row) {
			ids[i] = row['id'];
		});
		$.ajax({
			type : 'POST',
			data : {
				"ids" : ids
			},
			url : prefix + '/batchRemove',
			success : function(r) {
				if (r.code == 0) {
					layer.msg(r.msg);
					reLoad();
				} else {
					layer.msg(r.msg);
				}
			}
		});
	}, function() {

	});
}