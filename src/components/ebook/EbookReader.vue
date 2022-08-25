<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <div
      class="ebook-reader-mask"
      @click="onMaskClick"
      @touchmove="move"
      @touchend="moveEnd"
      @mousedown.left="onMouseEnter"
      @mousemove.left="onMouseMove"
      @mouseup.left="onMouseEnd"
    ></div>
  </div>
</template>

<script>
import { ebookMixin } from "@/utils/mixin";
import {
  saveFontFamily,
  getFontFamily,
  getFontSize,
  saveFontSize,
  getTheme,
  saveTheme,
  getLocation,
} from "@/utils/localStorage";
import { flatten } from "@/utils/book";
import Epub from "epubjs";
import { getLocalForage } from "../../utils/localForage";
export default {
  mixins: [ebookMixin],
  mounted() {
    const books = this.$route.params.fileName.split("|");
    const fileName = books[1];
    getLocalForage(fileName, (err, blob) => {
      if (!err && blob) {
        this.setFileName(books.join("/")).then(() => {
          this.initEpub(blob);
        });
      } else {
        this.setFileName(books.join("/")).then(() => {
          const url =
            process.env.VUE_APP_RES_URL + "/epub/" + this.fileName + ".epub";

          this.initEpub(url);
        });
      }
    });
  },
  methods: {
    // 1 - 鼠标进入
    // 2 - 鼠标进入后的移动
    // 3 - 鼠标从移动状态松手
    // 4 - 鼠标还原
    onMouseEnter(e) {
      //鼠标点击进入
      this.mouseState = 1;
      this.mouseStartTime = e.timeStamp;
      e.preventDefault();
      e.stopPropagation();
    },
    onMouseMove(e) {
      //必须是点击过后的移动才算数
      if (this.mouseState === 1) {
        this.mouseState = 2;
      } else if (this.mouseState === 2) {
        let offsetY = 0;
        if (this.firstOffsetY) {
          offsetY = e.clientY - this.firstOffsetY;
          this.setOffsetY(offsetY);
        } else {
          this.firstOffsetY = e.clientY;
        }
      }
      e.preventDefault();
      e.stopPropagation();
    },
    onMouseEnd(e) {
      //放开鼠标
      if (this.mouseState === 2) {
        //移动过后放开鼠标
        this.setOffsetY(0);
        this.firstOffsetY = null;
        this.mouseState = 3;
      } else {
        this.mouseState = 4; //直接进行点击没有移动 判断为点击事件
      }
      const time = e.timeStamp - this.mouseStartTime;
      if (time < 100) {
        //防止误触把mouse变成状态码3 判断为不是点击事件
        this.mouseState = 4;
      }
      e.preventDefault();
      e.stopPropagation();
    },
    onMaskClick(e) {
      if (this.mouseState && (this.mouseState === 2 || this.mouseState === 3)) {
        return;
      }
      const offsetX = e.offsetX;
      const width = window.innerWidth;
      if (offsetX > 0 && offsetX < width * 0.3) {
        this.prevPage(); //点击左侧
      } else if (offsetX > 0 && offsetX > width * 0.7) {
        this.nextPage(); //点击右侧
      } else {
        this.toggleMenuVisible();
      }
    },
    move(e) {
      let offsetY = 0;
      if (this.firstOffsetY) {
        offsetY = e.changedTouches[0].clientY - this.firstOffsetY;
        this.setOffsetY(offsetY);
      } else {
        this.firstOffsetY = e.changedTouches[0].clientY;
      }
      e.preventDefault();
      e.stopPropagation();
    },
    moveEnd(e) {
      this.setOffsetY(0);
      this.firstOffsetY = null;
    },

    prevPage() {
      //上一页
      if (this.rendition) {
        this.rendition.prev().then(() => {
          this.refreshLocation();
        });
        this.hideTitleAndMenu();
      }
    },
    nextPage() {
      //下一页
      if (this.rendition) {
        this.rendition.next().then(() => {
          this.refreshLocation();
        });
        this.hideTitleAndMenu();
      }
    },
    toggleMenuVisible() {
      //显示菜单和主题
      this.setMenuVisible(!this.menuVisible);
      if (this.menuVisible) {
        this.setSettingVisible(-1);
        this.setFontFamilyVisible(false);
      }
    },

    initFontSize() {
      let fontSize = getFontSize(this.fileName);
      if (!fontSize) {
        //如果本地没有字体
        saveFontSize(this.fileName, this.defaultFontSize);
      } else {
        this.rendition.themes.fontSize(`${fontSize}px`);
        this.setDefaultFontSize(fontSize);
      }
    },
    initFontFamily() {
      let font = getFontFamily(this.fileName);
      if (!font) {
        //如果本地没有字体
        saveFontFamily(this.fileName, this.defaultFontFamily);
      } else {
        this.rendition.themes.font(font);
        this.setDefaultFontFamily(font);
      }
    },
    //初始化主题
    initTheme() {
      let defaultTheme = getTheme(this.fileName); //从本地拿主题
      if (!defaultTheme) {
        defaultTheme = this.themeList[0].name;
        saveTheme(this.fileName, defaultTheme); //存放到本地
      }
      this.setDefaultTheme(defaultTheme); //存放到vuex

      this.themeList.forEach((theme) => {
        //注册主题
        this.rendition.themes.register(theme.name, theme.style);
      });
      this.rendition.themes.select(defaultTheme); //首先设置默认主题
    },
    initRendition() {
      this.rendition = this.book.renderTo("read", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      const location = getLocation(this.fileName);
      this.display(location, () => {
        this.initTheme();
        this.initFontSize();
        this.initFontFamily();
        this.initGlobalStyle();
        // this.display(location);
      });
    },
    initGesture() {
      this.rendition.on("touchstart", (event) => {
        this.touchStartX = event.changedTouches[0].clientX;
        this.touchStartTime = event.timeStamp;
      });
      this.rendition.on("touchend", (event) => {
        const offsetX = event.changedTouches[0].clientX - this.touchStartX;
        const time = event.timeStamp - this.touchStartTime;
        if (time < 500 && offsetX > 40) {
          this.prevPage();
        } else if (time < 500 && offsetX < -40) {
          this.nextPage();
        } else {
          this.toggleMenuVisible();
        }
        event.passive = false;
        event.stopPropagation();
      });

      this.rendition.hooks.content.register((contents) => {
        //注册面板主题
        contents.addStylesheet(
          `${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`
        );
        contents.addStylesheet(
          `${process.env.VUE_APP_RES_URL}/fonts/cabin.css`
        );
        contents.addStylesheet(
          `${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`
        );
        contents.addStylesheet(
          `${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`
        );
      });
    },
    parseBook() {
      //初始化书本封面
      this.book.loaded.cover.then((cover) => {
        //获取封面
        this.book.archive.createUrl(cover).then((url) => {
          this.setCover(url);
        });
      });
      this.book.loaded.metadata.then((metadata) => {
        //获取书本信息
        this.setMetadata(metadata);
      });
      this.book.loaded.navigation.then((nav) => {
        //每一节目录在那一层得到
        // console.log(nav.toc);
        // console.log(flatten(nav.toc));

        const navigation = flatten(nav.toc);
        function find(item, level = 0) {
          if (!item.parent) {
            return level;
          } else {
            return find(
              navigation.filter((parentItem) => parentItem.id === item.parent),
              ++level
            );
          }
        }
        navigation.forEach((item) => {
          item.level = find(item);
        });
        // console.log(navigation);
        this.setNavigation(navigation);
      });
    },
    initEpub(url) {
      this.book = new Epub(url);
      this.setCurrentBook(this.book); //将this.book传入vuex
      this.initRendition();
      // this.initGesture();
      this.parseBook();
      this.book.ready
        .then(() => {
          //设置电子书分页
          return this.book.locations.generate(
            750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16)
          );
        })
        .then((locations) => {
          this.setBookAvailable(true);
          this.refreshLocation();
        });
    },
  },
};
</script>

<style lang="scss" scoped >
@import "@/assets/styles/global";

.ebook-reader {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .ebook-reader-mask {
    position: absolute;
    top: 0;
    left: 0;
    background: transparent;
    z-index: 300;
    width: 100%;
    height: 100%;
  }
}
</style>