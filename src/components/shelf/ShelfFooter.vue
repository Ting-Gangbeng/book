<template>
  <div class="shelf-footer" v-show="isEditMode">
    <div
      class="shelf-footer-tab-wrapper"
      v-for="item in tabs"
      :key="item.index"
      @click="onTabClick(item)"
    >
      <div class="shelf-footer-tab" :class="{ 'is-selected': isSelected }">
        <div
          class="icon-private tab-icon"
          v-if="item.index === 1 && !isPrivate"
        ></div>
        <div
          class="icon-private-see tab-icon"
          :class="{ 'is-selected': isSelected }"
          v-if="item.index === 1 && isPrivate"
        ></div>
        <div
          class="icon-download tab-icon"
          :class="{ 'is-selected': isSelected }"
          v-if="item.index === 2 && !isDownload"
        ></div>
        <div
          class="icon-download-remove tab-icon"
          :class="{ 'is-selected': isSelected }"
          v-if="item.index === 2 && isDownload"
        ></div>
        <div class="icon-move tab-icon" v-if="item.index == 3"></div>
        <div class="icon-shelf tab-icon" v-if="item.index == 4"></div>
        <div
          class="tab-text"
          :class="{
            'remove-text': item.index === 4,
            'is-selected': isSelected,
          }"
        >
          {{ label(item) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { storeShelfMixin } from "@/utils/mixin";
import { saveBookShelf, removeLocalStorage } from "@/utils/localStorage";
import { download } from "@/api/store";
import { removeLocalForage } from "@/utils/localForage";
export default {
  mixins: [storeShelfMixin],
  computed: {
    isPrivate() {
      //判断是否全都是私密
      if (!this.isSelected) {
        //没有选中图书
        return false;
      } else {
        //判断是否每一个选中的都是私密
        return this.shelfSelected.every((item) => item.private);
      }
    },
    isDownload() {
      if (!this.isSelected) {
        //没有选中图书
        return false;
      } else {
        //判断是否每一个选中的都是下载
        return this.shelfSelected.every((item) => item.cache);
      }
    },
    isSelected() {
      return this.shelfSelected && this.shelfSelected.length > 0;
    },
    tabs() {
      return [
        {
          label: this.$t("shelf.private"),
          label2: this.$t("shelf.noPrivate"),
          index: 1,
        },
        {
          label: this.$t("shelf.download"),
          label2: this.$t("shelf.delete"),
          index: 2,
        },
        {
          label: this.$t("shelf.move"),
          index: 3,
        },
        {
          label: this.$t("shelf.remove"),
          index: 4,
        },
      ];
    },
  },
  data() {
    return {
      popupMenu: null,
    };
  },
  methods: {
    downloadBook(book) {
      let text = "";
      const toast = this.toast({
        text: text,
      });
      toast.continueShow();
      //离线下载
      return new Promise((resolve, reject) => {
        download(
          book,
          (book) => {
            toast.remove(); //下载完成移除remove
            console.log(book);
            resolve(book);
          },
          reject,
          (processEvent) => {
            let progress =
              Math.floor((processEvent.loaded / processEvent.total) * 100) +
              "%";
            text = this.$t("shelf.progressDownload").replace(
              "$1",
              `${book.fileName}.epub(${progress})`
            );
            if (text) {
              toast.updateText(text); //传入更新后的值
            }
          }
        );
      });
    },
    async downloadSelectedBook() {
      //离线下载所选书籍
      for (let i = 0; i < this.shelfSelected.length; i++) {
        await this.downloadBook(this.shelfSelected[i]).then((book) => {
          book.cache = true;
        });
      }
    },
    removeSelectedBook() {
      Promise.all(this.shelfSelected.map((book) => this.removeBook(book))).then(
        (books) => {
          books.map((book) => (book.cache = false));
          saveBookShelf(this.shelfList); //保存书架中图书的状态到本地
          this.simpleToast(this.$t("shelf.removeDownloadSuccess"));
        }
      );
    },
    removeBook(book) {
      return new Promise((resolve, reject) => {
        removeLocalStorage(`${book.categoryText}/${book.fileName}-info`);
        removeLocalForage(`${book.fileName}`, resolve, reject);
        resolve(book);
      });
    },
    onComplete() {
      this.hidePopup();
      this.setIsEditMode(false); //关闭编辑状态
      saveBookShelf(this.shelfList); //保存书架的状态到本地
    },
    label(item) {
      switch (item.index) {
        case 1:
          return this.isPrivate ? item.label2 : item.label;
        case 2:
          return this.isDownload ? item.label2 : item.label;
        default:
          return item.label;
      }
    },
    onTabClick(item) {
      if (!this.isSelected) {
        //如果没有一个选中的书籍就点不动
        return;
      }
      switch (item.index) {
        case 1:
          this.showPrivate();
          break;
        case 2:
          this.showDownload();
          break;
        case 3:
          this.dialog().show();
          break;
        case 4:
          this.showRemove();
          break;
        default:
          break;
      }
    },
    hidePopup() {
      this.popupMenu.hide();
    },
    setPrivate() {
      let isPrivate;
      if (this.isPrivate) {
        //全部是私密阅读
        isPrivate = false;
      } else {
        isPrivate = true;
      }
      this.shelfSelected.forEach((book) => {
        //将全部书籍置为与isPrivate相同
        book.private = isPrivate;
      });

      this.onComplete();
      if (isPrivate) {
        this.simpleToast(this.$t("shelf.setPrivateSuccess"));
      } else {
        this.simpleToast(this.$t("shelf.closePrivateSuccess"));
      }
    },
    async setDownload() {
      this.onComplete();
      if (this.isDownload) {
        this.removeSelectedBook(); //删除下载
      } else {
        //下载
        await this.downloadSelectedBook();
        saveBookShelf(this.shelfList); //保存书架状态到本地
        this.simpleToast(this.$t("shelf.setDownloadSuccess"));
      }
    },
    // 将所选书籍移出书架
    removeSelected() {
      // console.log('aaa')
      // shelfList是书架的首页列表，
      // shelfList.itemList是书架列表里面的分类
      this.shelfSelected.forEach((selected) => {
        this.setShelfList(
          this.shelfList.filter((book) => {
            if (book.itemList) {
              // 进入到分类中判断
              book.itemList = book.itemList.filter((subBook) => {
                return subBook !== selected;
              });
            }
            return book !== selected;
          })
        );
      });
      // 也可以这么写
      // this.setShelfList(this.shelfList.filter(book => {
      //   if (book.itemList) {
      //     console.log('aaa')
      //     book.itemList = book.itemList.filter(subBook => this.shelfSelected.indexOf(subBook) < 0)
      //   }
      //   return this.shelfSelected.indexOf(book) < 0
      // }))
      this.setShelfSelected([]);
      this.onComplete();
    },
    showPrivate() {
      this.popupMenu = this.popup({
        title: this.isPrivate
          ? this.$t("shelf.closePrivateTitle")
          : this.$t("shelf.setPrivateTitle"),
        btn: [
          {
            text: this.isPrivate
              ? this.$t("shelf.close")
              : this.$t("shelf.open"),
            click: () => {
              this.setPrivate();
            },
          },
          {
            text: this.$t("shelf.cancel"),
            click: () => {
              this.hidePopup();
            },
          },
        ],
      }).show();
    },
    showDownload() {
      this.popupMenu = this.popup({
        title: this.isDownload
          ? this.$t("shelf.removeDownloadTitle")
          : this.$t("shelf.setDownloadTitle"),
        btn: [
          {
            text: this.isDownload
              ? this.$t("shelf.delete")
              : this.$t("shelf.open"),
            click: () => {
              this.setDownload();
            },
          },
          {
            text: this.$t("shelf.cancel"),
            click: () => {
              this.hidePopup();
            },
          },
        ],
      }).show();
    },
    showRemove() {
      let msg;
      if (this.shelfSelected.length === 1) {
        msg = this.$t("shelf.removeBookTitle").replace(
          "$1",
          "《" + this.shelfSelected[0].title + "》"
        );
      } else {
        msg = this.$t("shelf.removeBookTitle").replace(
          "$1",
          this.$t("shelf.selectedBooks")
        );
      }

      this.popupMenu = this.popup({
        title: msg,
        btn: [
          {
            text: this.$t("shelf.removeBook"),
            type: "danger",
            click: () => {
              this.removeSelected();
            },
          },
          {
            text: this.$t("shelf.cancel"),
            click: () => {
              this.hidePopup();
            },
          },
        ],
      }).show();
    },
  },
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";

.shelf-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 120;
  display: flex;
  width: 100%;
  height: px2rem(48);
  background: white;
  box-shadow: 0 px2rem(-2) px2rem(4) 0 rgba(0, 0, 0, 0.1);
  .shelf-footer-tab-wrapper {
    flex: 1;
    width: 25%;
    height: 100%;
    .shelf-footer-tab {
      width: 100%;
      height: 100%;
      @include columnCenter;
      opacity: 0.5;
      &.is-selected {
        opacity: 1;
      }
      .tab-icon {
        font-size: px2rem(20);
        color: #666;
        &.icon-shelf {
          color: $color-pink;
        }
        &.icon-download {
          font-size: px2rem(22);
        }
      }
      .tab-text {
        margin-top: px2rem(5);
        font-size: px2rem(12);
        color: #666;
        &.remove-text {
          color: $color-pink;
        }
      }
    }
  }
}
</style>
