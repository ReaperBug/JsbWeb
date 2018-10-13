/*
 * mescroll -- 精致的下拉刷新和上拉加载js框架  ( a great JS framework for pull-refresh and pull-up-loading )
 * version 1.1.6
 * 2017-08-27
 * https://github.com/mescroll/mescroll.git
 * http://www.mescroll.com
 * author: wenju < mescroll@qq.com > 文举
 */

;(function (name, definition) {
  // 检测上下文环境是否为AMD或CMD
  var hasDefine = typeof define === 'function',
  // 检查上下文环境是否为Node
    hasExports = typeof module !== 'undefined' && module.exports;

  if (hasDefine) {
    // AMD环境或CMD环境
    define(definition);
  } else if (hasExports) {
    // 定义为普通Node模块
    module.exports = definition();
  } else {
    // 将模块的执行结果挂在window变量中，在浏览器中this指向window对象
    this[name] = definition();
  }
})('MeScroll', function () {
  function MeScroll(mescrollId, options) {
    this.scrollDom = document.getElementById(mescrollId); //MeScroll的滑动区域
    this.options = options || {}; //配置

    this.isDownScrolling = false; //是否在执行下拉刷新的回调
    this.isUpScrolling = false; //是否在执行上拉加载的回调

    //初始化下拉刷新
    this.initDownScroll();
    //初始化上拉加载,则初始化
    this.initUpScroll();

    //自动加载
    var me = this;
    setTimeout(function() { //待主线程执行完毕再执行,避免new MeScroll未初始化,在回调获取不到mescroll的实例
      if(me.optDown.auto) { //默认true 以下拉刷新的方式自动加载第一页数据
        if(me.optDown.autoShowLoading) {
          me.triggerDownScroll(); //显示下拉进度,执行下拉回调
        } else {
          me.optDown.callback && me.optDown.callback(me); //不显示下拉进度,直接执行下拉回调
        }
      }

      me.optUp.auto && me.triggerUpScroll(); //默认false
    }, 30); //需让me.optDown.inited和me.optUp.inited先执行
  }
  /*配置参数:上拉加载*/
  MeScroll.prototype.extendUpScroll = function(optUp) {
    //是否为PC端,如果是scrollbar端,默认自定义滚动条
    var isPC = typeof window.orientation == 'undefined' ;
    //上拉加载的配置
    MeScroll.extend(optUp, {
      use: true, //是否启用上拉加载; 默认true
      auto: false, //是否在初始化完毕之后自动执行上拉加载的回调; 默认false
      isLock: false, //是否锁定上拉加载,默认false;当列表没有更多数据时会自动锁定不可上拉;在endSuccess如果检查到有下一页数据,则会自动解锁true
      isBoth: false, //上拉加载时,如果滑动到列表顶部是否可以同时触发下拉刷新;默认false,两者不可同时触发;
      callback: null, //上拉加载的回调;function(page,mescroll){ }
      page: {
        num: 0, //当前页码,默认0,回调之前会加1,即callback(page)会从1开始
        size: 5, //每页数据的数量
        time: null //加载第一页数据服务器返回的时间; 防止用户翻页时,后台新增了数据从而导致下一页数据重复;
      },
      noMoreSize: 5, //如果列表已无数据,可设置列表的总数量要大于5条才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看
      offset: 100, //列表滚动到距离底部小于100px,即可触发上拉加载的回调
      toTop: {
        //回到顶部按钮,需配置src才显示
        src: null, //图片路径,默认null;
        offset: 1000, //列表滚动多少距离才显示回到顶部按钮,默认1000
        warpClass: "mescroll-totop", //按钮样式,参见mescroll.css
        showClass: "mescroll-fade-in", //显示样式,参见mescroll.css
        hideClass: "mescroll-fade-out", //隐藏样式,参见mescroll.css
        duration: 300 //回到顶部的动画时长,默认300ms
      },
      loadFull: {
        use: false, //列表数据过少,不足以滑动触发上拉加载,是否自动加载下一页,直到满屏或者无更多数据为止;默认false,因为可通过调高page.size避免这个情况
        delay: 500 //延时执行的毫秒数; 延时是为了保证列表数据或占位的图片都已初始化完成,且下拉刷新上拉加载中区域动画已执行完毕;
      },
      empty: {
        //列表第一页无任何数据时,显示的空提示布局; 需配置warpId或clearEmptyId才生效;
        warpId: null, //父布局的id; 如果此项有值,将不使用clearEmptyId的值;
        icon: null, //图标路径
        tip: "暂无相关数据~", //提示
        btntext: "", //按钮
        btnClick: null //点击按钮的回调
      },
      clearId: null, //加载第一页时需清空数据的列表id; 如果此项有值,将不使用clearEmptyId的值;
      clearEmptyId: null, //相当于同时设置了clearId和empty.warpId; 简化写法;
      hardwareClass: "mescroll-hardware", //硬件加速样式,动画更流畅,参见mescroll.css
      warpClass: "mescroll-upwarp", //上拉加载的布局容器样式,参见mescroll.css
      htmlLoading: '<p class="upwarp-progress mescroll-rotate"></p><p class="upwarp-tip">加载中..</p>', //上拉加载中的布局
      htmlNodata: '<p class="upwarp-nodata">-- END --</p>', //无数据的布局
      inited: function(mescroll, upwarp) {
        //初始化完毕的回调,可缓存dom 比如 mescroll.upProgressDom = upwarp.getElementsByClassName("upwarp-progress")[0];
      },
      showLoading: function(mescroll, upwarp) {
        //上拉加载中.. mescroll.upProgressDom.style.display = "block" 不通过此方式显示,因为ios快速滑动到底部,进度条会无法及时渲染
        upwarp.innerHTML = mescroll.optUp.htmlLoading;
      },
      showNoMore: function(mescroll, upwarp) {
        //无更多数据
        upwarp.innerHTML = mescroll.optUp.htmlNodata;
      },
      onScroll: null, //列表滑动监听,默认null; 例如 onScroll: function(mescroll, y){ }; //y为列表当前滚动条的位置
      scrollbar: {
        use: isPC, //默认只在PC端自定义滚动条样式
        barClass: "mescroll-bar"
      }
    })
  }

  /*配置参数*/
  MeScroll.extend = function(userOption, defaultOption) {
    if(!userOption) return defaultOption;
    for(key in defaultOption) {
      if(userOption[key] == null) {
        userOption[key] = defaultOption[key];
      } else if(typeof userOption[key] == "object") {
        MeScroll.extend(userOption[key], defaultOption[key]); //深度匹配
      }
    }
    return userOption;
  }

  /*-------初始化下拉刷新-------*/
  MeScroll.prototype.initDownScroll = function() {
    var me = this;

    //配置参数
    me.optDown = me.options.down || {};
    //可配置不使用下拉刷新
    if(me.optDown.use == false) return;
    //具体参数配置
    //在页面中加入下拉布局
    me.downwarp = document.createElement("div");
    me.downwarp.className = me.optDown.warpClass;
    me.scrollDom.insertBefore(me.downwarp, me.scrollDom.firstChild);

    //鼠标或手指的按下事件
    me.scrollDom.addEventListener("touchstart", touchstartEvent); //移动端手指事件
    me.scrollDom.addEventListener("mousedown", touchstartEvent); //PC端鼠标事件
    function touchstartEvent(e) {
      if(me.isScrollTo) e.preventDefault(); //如果列表执行滑动事件,则阻止事件,优先执行scrollTo方法
      me.startTop = me.scrollDom.scrollTop; //此时列表到顶部的距离,鼠标或手指离开时制空,避免直接触发move事件;
      if(me.optDown.mustToTop) {
        me.startY = e.touches ? e.touches[0].pageY : e.clientY; //如果列表必须滑动到顶部才能下拉,则记录此时第一个手指距离列表顶部的距离
      }
    }

    //鼠标或手指的滑动事件
    me.scrollDom.addEventListener("touchmove", touchmoveEvent); //移动端手指事件
    me.scrollDom.addEventListener("mousemove", touchmoveEvent); //PC端鼠标事件
    function touchmoveEvent(e) {
      //列表在顶部且不在加载中
      if(me.startTop != null && me.scrollDom.scrollTop <= 0 && !me.isDownScrolling && (!me.isUpScrolling || (me.isUpScrolling && me.optUp.isBoth)) && !me.optDown.isLock) {

        //是否列表必须滑动到顶部才能下拉
        if(me.optDown.mustToTop && me.startTop > 0) return;

        var curX = e.touches ? e.touches[0].pageX : e.clientX; //当前第一个手指距离列表顶部的距离x
        var curY = e.touches ? e.touches[0].pageY : e.clientY; //当前第一个手指距离列表顶部的距离y

        if(!me.preX) me.preX = curX; //设置上次移动的距离x
        if(!me.preY) me.preY = curY; //设置上次移动的距离y

        //计算两点之间的角度
        var x = Math.abs(me.preX - curX);
        var y = Math.abs(me.preY - curY);
        var z = Math.sqrt(x*x + y*y);

        var diff = curY - me.preY; //和上次比,移动的距离 (大于0向下,小于0向上)
        me.preX = curX; //记录本次curX的值
        me.preY = curY; //记录本次curY的值

        if(z!=0){
          var angle=Math.asin(y / z) / Math.PI*180; //角度区间 [0,90]
          if(angle < me.optDown.minAngle) return; //如果小于配置的角度,则不往下执行 -- 1.1.6版本加入的配置
        }

        if(!me.startY && !me.optDown.mustToTop) me.startY = curY; //记住列表滚动到0的位置时,手指距离顶部的距离,在touchend重置
        var moveY = curY - me.startY; //和起点比,移动的距离,大于0向下拉
      }
    }
  }

  /*-------初始化上拉加载-------*/
  MeScroll.prototype.initUpScroll = function() {
    var me = this;

    //配置参数
    me.optUp = me.options.up || {};
    //可配置不使用上拉加载
    if(me.optUp.use == false) return;
    //具体参数配置
    me.extendUpScroll(me.optUp);

    //自定义滚动条 (默认只在PC端设置)
    if(me.optUp.scrollbar.use) me.scrollDom.classList.add(me.optUp.scrollbar.barClass);

    //在页面中加入下拉布局
    me.upwarp = document.createElement("div");
    me.upwarp.className = me.optUp.warpClass;
    me.scrollDom.appendChild(me.upwarp);

    //滚动监听
    me.scrollDom.addEventListener("scroll", function() {
      //列表内容顶部卷去的高度(含列表边框)
      var scrollTop = me.scrollDom.scrollTop;

      //如果没有在加载中
      if(!me.isUpScrolling && (!me.isDownScrolling || (me.isDownScrolling && me.optDown.isBoth))) {
        //clientHeight 列表高度(内容+内边距),不含列表边框
        //scrollHeight 列表内容撑开的高度
        if(!me.optUp.isLock) {
          var toBottom = me.scrollDom.scrollHeight - me.scrollDom.clientHeight - scrollTop; //滚动条距离底部的距离
          if(toBottom <= me.optUp.offset) {
            //如果滚动条距离底部指定范围内了,则执行上拉加载回调
            me.triggerUpScroll();
          }
        }

        //顶部按钮的显示隐藏
        if(me.optUp.toTop.src) {
          if(scrollTop >= me.optUp.toTop.offset) {
            me.showTopBtn();
          } else {
            me.hideTopBtn();
          }
        }
      }

      //滑动监听
      me.optUp.onScroll&&me.optUp.onScroll(me, scrollTop);
    });

    //初始化完毕的回调
    setTimeout(function() { //待主线程执行完毕再执行,避免new MeScroll未初始化,在回调获取不到mescroll的实例
      me.optUp.inited(me, me.upwarp);
    }, 0)
  }

  /*触发上拉加载*/
  MeScroll.prototype.triggerUpScroll = function() {
    this.showUpScroll(); //上拉加载中...
    this.optUp.page.num++; //预先加一页,如果失败则减回
    this.optUp.callback && this.optUp.callback(this.optUp.page, this); //执行回调,联网加载数据
  }

  /*显示上拉加载中*/
  MeScroll.prototype.showUpScroll = function() {
    this.isUpScrolling = true; //标记上拉加载中
    this.upwarp.classList.add(this.optUp.hardwareClass); //添加硬件加速样式,使动画更流畅
    this.upwarp.style.visibility = "visible"; //显示上拉加载区域
    this.optUp.showLoading(this, this.upwarp); //加载中...
  }

  /*显示上拉无更多数据*/
  MeScroll.prototype.showNoMore = function() {
    this.upwarp.style.visibility = "visible"; //显示上拉加载区域
    this.optUp.isLock = true; //锁定不可上拉
    this.optUp.showNoMore(this, this.upwarp); //无更多数据
  }

  /*隐藏上拉区域*/
  MeScroll.prototype.hideUpScroll = function() {
    this.upwarp.style.visibility = "hidden"; /*代替display: none,列表快速滑动到底部能及时显示*/
    this.upwarp.classList.remove(this.optUp.hardwareClass); //移除硬件加速样式
  }

  /*结束上拉加载*/
  MeScroll.prototype.endUpScroll = function(isShowNoMore) {
    if(isShowNoMore != null) { //isShowNoMore=null,不处理下拉状态
      if(isShowNoMore) {
        this.showNoMore(); //isShowNoMore=true,显示无更多数据
      } else {
        this.hideUpScroll(); //isShowNoMore=false,隐藏上拉加载
      }
    }
    this.isUpScrolling = false; //标记结束上拉加载
  }

  /*重置上拉加载列表为第一页
   *isShowLoading 是否显示进度布局;
   * 1.默认null,不传参,则显示上拉加载的进度布局
   * 2.传参true, 则显示下拉刷新的进度布局
   * 3.传参false,则不显示上拉和下拉的进度 (常用于静默更新列表数据)
   */
  MeScroll.prototype.resetUpScroll = function(isShowLoading) {
    if(this.optUp && this.optUp.use) {
      var page = this.optUp.page;
      this.prePageNum = page.num; //缓存重置前的页码,加载失败可退回
      this.prePageTime = page.time; //缓存重置前的时间,加载失败可退回
      page.num = 1; //重置为第一页
      page.time = null; //重置时间为空
      if(!this.isDownScrolling&&isShowLoading!=false) {//如果不是下拉刷新触发的resetUpScroll并且不配置列表静默更新,则显示进度;
        if(isShowLoading==null) {
          this.removeEmpty(); //移除空布局
          this.clearDataList();//先清空列表数据,才能显示到上拉加载的布局
          this.showUpScroll(); //不传参,默认显示上拉加载的进度布局
        } else {
          this.showDownScroll(); //传true,显示下拉刷新的进度布局,不清空列表
        }
      }
      this.optUp.callback && this.optUp.callback(page, this); //执行上拉回调
    }
  }

  /*清空上拉加载的数据列表*/
  MeScroll.prototype.clearDataList = function() {
    var listId = this.optUp.clearId || this.optUp.clearEmptyId; //优先使用clearId
    if(listId) {
      var listDom = document.getElementById(listId);
      if(listDom) listDom.innerHTML = "";
    }
  }

  /*回调成功
   *结束下拉刷新 meScroll.endSuccess();无参;
   *结束上拉加载 meScroll.endSuccess(dataSize, systime); 必须传dataSize:联网获取到的数据条数;用于判断列表是否还有数据.如果不传则仅隐藏加载中的状态;  systime:第一页的系统时间 (可空)
   */
  MeScroll.prototype.endSuccess = function(dataSize, systime) {
    //结束下拉刷新
    if(this.isDownScrolling) this.endDownScroll();

    //结束上拉加载
    if(this.optUp.use) {
      var pageNum = this.optUp.page.num; //当前页码
      var pageSize = this.optUp.page.size; //每页长度

      if(pageNum == 1) this.clearDataList(); //如果是第一页,自动清空第一页列表数据

      var isShowNoMore; //是否已无更多数据
      if(dataSize != null) {
        if(dataSize < pageSize) {
          //返回的数据不满一页时,则说明已无更多数据
          this.optUp.isLock = true;
          if(dataSize == 0 && pageNum == 1) {
            //如果第一页无任何数据且配置了空布局
            isShowNoMore = false;
            this.showEmpty();
          } else {
            //总列表数少于配置的数量,则不显示无更多数据
            var allDataSize = (pageNum - 1) * pageSize + dataSize;
            if(allDataSize < this.optUp.noMoreSize) {
              isShowNoMore = false;
            } else {
              isShowNoMore = true;
            }
            this.removeEmpty(); //移除空布局
          }
        } else {
          //还有下一页
          isShowNoMore = false;
          this.optUp.isLock = false;
          this.removeEmpty(); //移除空布局
        }
      }

      //设置加载列表数据第一页的时间
      if(pageNum == 1 && systime) this.optUp.page.time = systime;

      //隐藏上拉
      this.endUpScroll(isShowNoMore);

      //检查是否满屏自动加载下一页
      this.loadFull();
    }
  }

  /*回调失败,结束下拉刷新和上拉加载*/
  MeScroll.prototype.endErr = function() {
    //结束下拉,回调失败重置回原来的页码和时间
    if(this.isDownScrolling) {
      var page = this.optUp.page;
      if(page && this.prePageNum) {
        page.num = this.prePageNum;
        page.time = this.prePageTime;
      }
      this.endDownScroll();
    }
    //结束上拉,回调失败重置回原来的页码
    if(this.isUpScrolling) {
      this.optUp.page.num--;
      this.endUpScroll(false);
    }
  }

  /*检查如果加载的数据过少,无法触发上拉加载时,则自动加载下一页,直到满屏或者没有更多数据
   此方法最好在列表的数据加载完成之后调用,以便计算列表内容高度的准确性*/
  MeScroll.prototype.loadFull = function() {
    var me = this;
    if(me.optUp.loadFull.use && !me.optUp.isLock && me.scrollDom.scrollHeight <= me.scrollDom.clientHeight) {
      setTimeout(function() {
        //延时之后,还需再判断一下高度,因为可能有些图片在延时期间加载完毕撑开高度
        if(me.scrollDom.scrollHeight <= me.scrollDom.clientHeight) me.triggerUpScroll();
      }, me.optUp.loadFull.delay)
    }
  }

  /*锁定上拉加载:isLock=ture,null锁定;isLock=false解锁*/
  MeScroll.prototype.lockUpScroll = function(isLock) {
    if(isLock == null) isLock = true;
    this.optUp.isLock = isLock;
  }

  /*--------无任何数据的空布局--------*/
  MeScroll.prototype.showEmpty = function() {
    var me = this;
    var optEmpty = me.optUp.empty; //空布局的配置
    var warpId = optEmpty.warpId || me.optUp.clearEmptyId; //优先使用warpId
    if(warpId == null) return;
    var emptyWarp = document.getElementById(warpId) //要显示空布局的位置
    if(emptyWarp) {
      me.removeEmpty(); //先移除,避免重复加入
      //初始化无任何数据的空布局
      var str = '';
      if(optEmpty.icon) str += '<img class="empty-icon" src="' + optEmpty.icon + '"/>'; //图标
      if(optEmpty.tip) str += '<p class="empty-tip">' + optEmpty.tip + '</p>'; //提示
      if(optEmpty.btntext) str += '<p class="empty-btn">' + optEmpty.btntext + '</p>'; //按钮
      me.emptyDom = document.createElement("div");
      me.emptyDom.className = 'mescroll-empty';
      me.emptyDom.innerHTML = str;
      emptyWarp.appendChild(me.emptyDom);
      if(optEmpty.btnClick) { //点击按钮的回调
        var emptyBtn = me.emptyDom.getElementsByClassName("empty-btn")[0];
        emptyBtn.onclick = function() {
          optEmpty.btnClick();
        }
      }
    }
  }
  /*移除空布局*/
  MeScroll.prototype.removeEmpty = function() {
    if(this.emptyDom) {
      var parentDom = this.emptyDom.parentNode;
      if(parentDom) parentDom.removeChild(this.emptyDom);
      this.emptyDom = null;
    }
  }

  /*--------回到顶部的按钮--------*/
  MeScroll.prototype.showTopBtn = function() {
    if(!this.topBtnShow) {
      this.topBtnShow = true; //标记显示
      var me = this;
      var optTop = me.optUp.toTop; //回到顶部的配置
      if(me.toTopBtn == null) {
        //未加入按钮,则加入
        me.toTopBtn = document.createElement("img");
        me.toTopBtn.className = optTop.warpClass;
        me.toTopBtn.src = optTop.src;
        me.toTopBtn.onclick = function() {
          me.scrollTo(0, me.optUp.toTop.duration); //置顶
        }
        document.body.appendChild(me.toTopBtn); //加在body上,避免加在me.scrollDom在使用硬件加速样式时会使fixed失效
      }
      //显示--淡入动画
      me.toTopBtn.classList.remove(optTop.hideClass);
      me.toTopBtn.classList.add(optTop.showClass);
    }
  }
  /*隐藏回到顶部的按钮*/
  MeScroll.prototype.hideTopBtn = function() {
    if(this.topBtnShow && this.toTopBtn) {
      this.topBtnShow = false;
      this.toTopBtn.classList.remove(this.optUp.toTop.showClass);
      this.toTopBtn.classList.add(this.optUp.toTop.hideClass);
    }
  }

  /*滑动列表到指定位置--带缓冲效果 (y=0回到顶部;如果要滚动到底部可以传一个较大的值,比如99999);t时长,单位ms,默认300*/
  MeScroll.prototype.scrollTo = function(y, t) {
    t = t || 300; //时长 300ms
    var rate = 20; //周期 20ms
    var count = t / rate; //次数
    var me = this;
    var maxY = me.scrollDom.scrollHeight - me.scrollDom.clientHeight; //y的最大值
    if(y < 0) y = 0; //不可小于0
    if(y > maxY) y = maxY; //不可超过最大值
    var diff = me.scrollDom.scrollTop - y; //差值 (可能为负值)
    if(diff == 0) return;
    var step = diff / count; //步长
    me.isScrollTo = true; //标记在滑动中,阻止列表的触摸事件
    var i = 0; //计数
    var scrollTimer = window.setInterval(function() {
      if(i < count) {
        if(i == count - 1) {
          me.scrollDom.scrollTop = y; //最后一次直接设置y,避免计算误差
        } else {
          me.scrollDom.scrollTop -= step;
        }
        i++;
      } else {
        me.isScrollTo = false;
        window.clearInterval(scrollTimer);
      }
    }, rate);
  }

  return MeScroll
});