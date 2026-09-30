# Anki 联动：不用插件，纯 JS 获取更新

本站每次发版都会自动生成机器可读的更新源 `decks.js`（同时有 `decks.json`）。
你**不需要安装任何插件**，只要把下面这段 JS 粘贴进牌组的卡片模板，Anki 在复习该牌组时就会自动显示更新横幅，点开即可看到本站对应牌组的「更新 & 勘误时间轴」。

> 为什么不用插件？Anki 的扩展只能靠 Python 插件实现，安装麻烦、还要随 Anki 版本维护。
> 而卡片模板本身支持内嵌 JS——把更新提示做进卡片，零安装、随牌组走。

## 用法（两步）

1. Anki → 打开牌组 → 右上「卡片」，进入卡片模板编辑；
2. 在**正面模板**最下方粘贴下面代码（背面可同理粘贴，避免翻面后横幅消失）：

```html
<!-- 长缨记忆卡 · 更新提示（无需插件） -->
<script>
(function(){
  if (window.__cyAlert) return; window.__cyAlert = true;
  var DECK_KEY = "红宝书";                               // ← 改成你的牌组关键词：红宝书 / COCA / 日语卡
  var SITE = "https://xjtuyan.github.io/anki-changelog"; // ← 若用 Cloudflare 域名，请替换成你的正式域名
  var s = document.createElement("script");
  s.src = SITE + "/decks.js?t=" + Date.now();
  s.onload = function(){
    var feed = window.DECKS_FEED;
    if (!feed || !feed.decks) return;
    var d = feed.decks.filter(function(x){
      return (x.match||[]).some(function(k){ return DECK_KEY.indexOf(k)>=0 || k.indexOf(DECK_KEY)>=0; });
    })[0];
    if (!d) return;
    if (document.getElementById("cy-update-bar")) return;
    var bar = document.createElement("div");
    bar.id = "cy-update-bar";
    bar.style.cssText = "background:#c0392b;color:#fff;font:14px/1.6 system-ui,sans-serif;padding:8px 12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.15)";
    bar.innerHTML = "📢 长缨记忆卡 · " + d.name + " 最新版 <b>" + d.version + "</b>（" + d.date + "）· <a href='" + SITE + d.url + "' target='_blank' style='color:#fff;text-decoration:underline'>查看更新与勘误</a>";
    document.body.insertBefore(bar, document.body.firstChild);
  };
  document.head.appendChild(s);
})();
</script>
```

## 原理与注意

- `SITE` 默认值指向 GitHub Pages；若你用 Cloudflare 域名，把 `SITE` 改成你的正式域名即可（两处地址同源）。
- 匹配规则：卡片 JS 按 `DECK_KEY` 在更新源 `match` 字段里找包含关系，命中即显示该牌组横幅。
- 横幅**在复习卡片时出现**——Anki 卡片 JS 只在渲染卡片时执行，不会在「打开牌组」瞬间弹窗（这是 Anki 机制限制，但效果等价：每次复习都能看到最新版提示）。
- 需联网：卡片 JS 实时拉取 `decks.js`，离线时横幅不显示，不影响正常复习。
- 同一份数据：网页时间轴与卡片提示都来自 `products.json`，永远一致。

## 进阶（可选）：只在比你手上的版本新时才提示

若想「只有比你当前导入的版本新才提示」，在模板顶部加一行当前版本常量，并在插入横幅前判断：

```js
var MY_VER = "3.2.0";   // ← 填你当前导入的牌组版本
// 在 s.onload 内、插入横幅前加一句：
function vcmp(a,b){var x=String(a).split('.').map(Number),y=String(b).split('.').map(Number);for(var i=0;i<3;i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)-(y[i]||0);}return 0;}
if (MY_VER && d.version && vcmp(d.version, MY_VER) <= 0) return;   // 不比手上的新就不提示
```
