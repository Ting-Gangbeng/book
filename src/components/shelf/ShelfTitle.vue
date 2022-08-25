<template>
  <transition name="fade">
    <div
      class="shelf-title"
      :class="{ 'hide-shadow': ifHideShadow }"
      v-show="shelfTitleVisible"
    >
      <div class="shelf-title-text-wrapper">
        <span class="shelf-title-text">{{ title }}</span>
        <span class="shelf-title-sub-text" v-show="isEditMode">
          {{ selectedText }}
        </span>
      </div>
      <!-- 显示清楚缓存 -->
      <div class="shelf-title-btn-warpper shelf-title-left" v-if="showClear">
        <span class="shelf-title-btn-text" @click="clearCache">
          <!-- {{ $t("shelf.clearCache") }} -->
          {{ !isEditMode ? $t("home.title") : $t("shelf.clearCache") }}
        </span>
      </div>
      <!-- 编辑按钮 -->
      <div class="shelf-title-btn-warpper shelf-title-right" v-if="showEdit">
        <span class="shelf-title-btn-text" @click="onEditClick">
          {{ isEditMode ? $t("shelf.cancel") : $t("shelf.edit") }}
        </span>
      </div>
      <div class="shelf-title-btn-warpper shelf-title-left" v-if="showBack">
        <span class="icon-back" @click="back"></span>
      </div>
      <div
        class="shelf-title-btn-warpper"
        :class="{
          'shelf-title-left': changeGroupLeft,
          'shelf-title-right': changeGroupRight,
        }"
        @click="changeGroup"
        v-if="showChangeGroup"
      >
        <span class="shelf-title-btn-text">{{ $t("shelf.editGroup") }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
import { clearLocalForage } from "../../utils/localForage";
import { clearLocalStorage, saveBookShelf } from "../../utils/localStorage";
import { storeShelfMixin } from "../../utils/mixin";
import { gotoStoreHome } from "../../utils/store";

export default {
  mixins: [storeShelfMixin],
  data() {
    return {
      ifHideShadow: true,
    };
  },
  props: {
    title: String,
  },
  computed: {
    // 显示状态currentType在vuex中
    emptyCategory() {
      // 没有分组 或者 分组书籍列表不存在 或者 没有书籍 返回true
      return (
        !this.shelfCategory ||
        !this.shelfCategory.itemList ||
        this.shelfCategory.itemList.length === 0
      );
    },
    showEdit() {
      return this.currentType === 1 || !this.emptyCategory;
    },
    showClear() {
      return this.currentType === 1;
    },
    showBack() {
      // 2表示分组内 不为编辑模式
      return this.currentType === 2 && !this.isEditMode;
    },
    showChangeGroup() {
      return this.currentType === 2 && (this.isEditMode || this.emptyCategory);
    },
    changeGroupLeft() {
      return !this.emptyCategory;
    },
    changeGroupRight() {
      return this.emptyCategory;
    },
    selectedText() {
      const selectedNumber = this.shelfSelected ? this.shelfSelected.length : 0;
      return selectedNumber <= 0
        ? this.$t("shelf.selectBook")
        : selectedNumber === 1
        ? this.$t("shelf.haveSelectedBook").replace("$1", selectedNumber)
        : this.$t("shelf.haveSelectedBooks").replace("$1", selectedNumber);
    },
    popupCancelBtn() {
      return this.createPopupBtn(this.$t("shelf.cancel"), () => {
        this.hidePopup();
      });
    },
  },
  watch: {
    // 监听y偏移量 来控制是否显示阴影
    offsetY(offsetY) {
      // console.log(offsetY)
      if (offsetY > 0) {
        this.ifHideShadow = false;
      } else {
        this.ifHideShadow = true;
      }
    },
  },
  methods: {
    onComplete() {
      this.hidePopup();
      // 删除分组
      this.setShelfList(
        this.shelfList.filter((book) => book.id !== this.shelfCategory.id)
      ).then(() => {
        saveBookShelf(this.shelfList);
        this.$router.go(-1);
        this.setIsEditMode(false);
      });
    },
    // 删除分组
    deleteGroup() {
      if (!this.emptyCategory) {
        // 分组中的书籍全部选中
        this.setShelfSelected(this.shelfCategory.itemList);
        // 书籍全部移出分组
        this.moveOutOfGroup(this.onComplete);
      } else {
        this.onComplete();
      }
    },
    // 显示删除分组弹窗
    showDeleteGroup() {
      this.hidePopup();
      setTimeout(() => {
        this.popupMenu = this.popup({
          title: this.$t("shelf.deleteGroupTitle"),
          btn: [
            this.createPopupBtn(
              this.$t("shelf.confirm"),
              () => {
                this.deleteGroup();
              },
              "danger"
            ),
            this.popupCancelBtn,
          ],
        }).show();
      }, 200);
    },
    // 改变分组标题弹窗
    changeGroupName() {
      this.hidePopup();
      this.dialog({
        showNewGroup: true,
        groupName: this.shelfCategory.title,
      }).show();
    },
    hidePopup() {
      this.popupMenu.hide();
    },
    // 创建修改分组的弹窗按钮
    createPopupBtn(text, onClick, type = "normal") {
      return {
        text,
        type,
        click: onClick,
      };
    },
    // 修改分组弹窗
    changeGroup() {
      // console.log('修改分组')
      this.popupMenu = this.popup({
        btn: [
          this.createPopupBtn(this.$t("shelf.editGroupName"), () => {
            this.changeGroupName();
          }),
          this.createPopupBtn(
            this.$t("shelf.deleteGroup"),
            () => {
              this.showDeleteGroup();
            },
            "danger"
          ),
          this.popupCancelBtn,
        ],
      }).show();
    },
    back() {
      this.$router.go(-1);
      this.setIsEditMode(false);
    },
    // 切换编辑模式
    onEditClick() {
      // 进入编辑模式之前 先把全部的选中状态清空
      if (!this.isEditMode) {
        // 不为编辑模式的话 选中状态取消
        this.setShelfSelected([]);
        // shelfList是书架中的书籍
        this.shelfList.forEach((item) => {
          item.selected = false;
          // 取消分类里的书籍选中状态
          if (item.itemList) {
            item.itemList.forEach((subItem) => {
              subItem.selected = false;
            });
          }
        });
      }
      this.setIsEditMode(!this.isEditMode);
    },
    clearCache() {
      if (this.isEditMode) {
        // 编辑模式 清除缓存
        // alert('clear')
        // 清理书架书籍缓存
        clearLocalStorage();
        // 清理书籍离线缓存
        clearLocalForage();
        // vux 空
        this.setShelfList([]);
        this.setShelfSelected([]);
        // mixin中的方法
        // 从接口获取书籍添加加号到vuex中
        this.getBookShelf();
        this.simpleToast(this.$t("shelf.clearCacheSuccess"));
      } else {
        // 否则进入书城
        gotoStoreHome(this);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global";

.shelf-title {
  position: relative;
  z-index: 130;
  width: 100%;
  height: px2rem(42);
  background: white;
  box-shadow: 0 px2rem(2) px2rem(2) 0 rgba(0, 0, 0, 0.1);
  &.hide-shadow {
    box-shadow: none;
  }
  .shelf-title-text-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: px2rem(42);
    @include columnCenter;
    .shelf-title-text {
      font-size: px2rem(16);
      line-height: px2rem(20);
      font-weight: bold;
      color: #333;
    }
    .shelf-title-sub-text {
      font-size: px2rem(10);
      color: #666;
    }
  }
  .shelf-title-btn-warpper {
    position: absolute;
    top: 0;
    box-sizing: border-box;
    height: 100%;
    @include center;
    .shelf-title-btn-text {
      font-size: px2rem(14);
      color: #666;
    }
    .icon-back {
      font-size: px2rem(20);
      color: #666;
    }
    &.shelf-title-left {
      left: 0;
      padding-left: px2rem(15);
    }
    &.shelf-title-right {
      right: 0;
      padding-right: px2rem(15);
    }
  }
}
</style>