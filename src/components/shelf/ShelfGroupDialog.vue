<!-- 移动到的弹窗 -->
<template>
  <ebook-dialog :title="title" ref="dialog">
    <!-- 显示移动分组弹窗 -->
    <div class="dialog-list-wrapper" v-if="!ifNewGroup">
      <div
        class="dialog-list-item-wrapper"
        v-for="(item, index) in categoryList"
        :key="index"
      >
        <div
          class="dialog-list-item"
          :class="{ 'is-add': item.edit ? item.edit === 1 : false }"
          @click="onGroupClick(item)"
          v-if="(item.edit === 2 && isInGroup) || item.edit !== 2 || !item.edit"
        >
          <div class="dialog-list-item-text">{{ item.title }}</div>
          <div
            class="dialog-list-icon-wrapper"
            v-if="isInGroup && shelfCategory.id === item.id"
          >
            <span class="icon-check"></span>
          </div>
        </div>
      </div>
    </div>
    <!-- 显示新建分组弹窗 -->
    <div class="dialog-new-group-wrapper" v-else>
      <div class="dialog-input-title-wrapper">
        <span class="dialog-input-title">{{ $t("shelf.groupName") }}</span>
      </div>
      <div class="dialog-input-wrapper">
        <div class="dialog-input-inner-wrapper">
          <input
            type="text"
            class="dialog-input"
            v-model="newGroupName"
            ref="dialogInput"
          />
          <div
            class="dialog-input-clear-wrapper"
            @click="clear"
            v-show="newGroupName && newGroupName.length > 0"
          >
            <span class="icon-close-circle-fill"></span>
          </div>
        </div>
      </div>
    </div>
    <div slot="btn" class="group-dialog-btn-wrapper">
      <div class="dialog-btn" @click="hide">{{ $t("shelf.cancel") }}</div>
      <div
        class="dialog-btn"
        @click="createNewGroup"
        :class="{ 'is-empty': !newGroupName || newGroupName.length === 0 }"
        v-if="ifNewGroup"
      >
        {{ $t("shelf.confirm") }}
      </div>
    </div>
  </ebook-dialog>
</template>

<script>
import EbookDialog from "../common/Dialog";
import { storeShelfMixin } from "../../utils/mixin";
import {
  removeAddToShelf,
  appendAddToShelf,
 
} from "../../utils/store";
import { saveBookShelf } from "../../utils/localStorage";

export default {
  name: "group-dialog",
  mixins: [storeShelfMixin],
  components: {
    EbookDialog,
  },
  props: {
    // 修改分组传过来的
    showNewGroup: {
      type: Boolean,
      default: false,
    },
    groupName: String,
  },
  computed: {
    // 在分组内
    isInGroup() {
      return this.currentType === 2;
    },
    defaultCategory() {
      return [
        {
          title: this.$t("shelf.newGroup"),
          edit: 1,
        },
        {
          title: this.$t("shelf.groupOut"),
          edit: 2,
        },
      ];
    },
    category() {
      // 获取书架中的分组 1是书籍 2是分组 3是加号
      return this.shelfList.filter((item) => item.type === 2);
    },
    // 移动到 的显示列表
    categoryList() {
      return [...this.defaultCategory, ...this.category];
    },
    title() {
      return !this.ifNewGroup
        ? this.$t("shelf.moveBook")
        : this.$t("shelf.newGroup");
    },
  },
  data() {
    return {
      ifNewGroup: false,
      newGroupName: "",
    };
  },
  methods: {
    show() {
      // 新建分组标志位ifNewGroup
      this.ifNewGroup = this.showNewGroup;
      // 新的分组名
      this.newGroupName = this.groupName;
      this.$refs.dialog.show();
    },
    hide() {
      this.$refs.dialog.hide();
      setTimeout(() => {
        this.ifNewGroup = false;
      }, 200);
    },
    onGroupClick(item) {
      // edit=1 表示新建分组  2表示移出分组
      if (item.edit && item.edit === 1) {
        // 进入新建分组弹窗
        this.ifNewGroup = true;
      } else if (item.edit && item.edit === 2) {
        // 移出分组
        this.moveOutFromGroup(item);
      } else {
        // 移入其他分组
        this.moveToGroup(item);
      }
    },
    clear() {
      this.newGroupName = "";
    },
    // 将书架/分组内的书籍移入新分组
    moveToGroup(group) {
      // 现在原来的位置删除选中的书籍
      this.setShelfList(
        this.shelfList.filter((book) => {
          if (book.itemList) {
            // 分组内的书籍 删除选中的书籍
            book.itemList = book.itemList.filter(
              (subBook) => this.shelfSelected.indexOf(subBook) < 0
            );
          }
          return this.shelfSelected.indexOf(book) < 0;
        })
      ).then(() => {
        // 在将选中书籍移入新的分组
        // group 是选中的分组
        // console.log(group)
        if (group && group.itemList) {
          group.itemList = [...group.itemList, ...this.shelfSelected];
        }
        // 更新书籍id
        group.itemList.forEach((item, index) => {
          item.id = index + 1;
        });
        this.simpleToast(
          this.$t("shelf.moveBookInSuccess").replace("$1", group.title)
        );
        this.onComplete();
      });
    },
    // 书籍移出分组到书架
    moveOutFromGroup() {
      this.moveOutOfGroup(this.onComplete);
      
    },
    // 新建分组
    createNewGroup() {
      if (!this.newGroupName || this.newGroupName.length === 0) {
        return;
      }
      // 修改分组传过来会使showNewGroup 为true
      if (this.showNewGroup) {
        // 分组名修改
        this.shelfCategory.title = this.newGroupName;
        this.onComplete();
      } else {
        // 新增分组
        const group = {
          id: this.shelfList[this.shelfList.length - 2].id + 1,
          itemList: [],
          selected: false,
          title: this.newGroupName,
          type: 2,
        };
        let list = removeAddToShelf(this.shelfList);
        list.push(group);
        list = appendAddToShelf(list);
        this.setShelfList(list).then(() => {
          // 书籍移入新分组
          this.moveToGroup(group);
        });
      }
    },
    onComplete() {
      saveBookShelf(this.shelfList);
      this.hide();
      this.setIsEditMode(false);
    },
  },
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";

.dialog-list-wrapper {
  width: 100%;
  padding: 0 px2rem(20);
  box-sizing: border-box;
  font-size: px2rem(14);
  @include scroll;
  .dialog-list-item {
    display: flex;
    padding: px2rem(15) 0;
    box-sizing: border-box;
    color: #666;
    &.is-add {
      color: $color-blue;
      &:active {
        color: $color-blue-transparent;
      }
    }
    &:active {
      color: rgba(102, 102, 102, 0.5);
    }
    .dialog-list-item-text {
      flex: 1;
    }
    .dialog-list-icon-wrapper {
      flex: 0 0 px2rem(30);
      color: $color-blue;
      @include right;
    }
  }
}

.dialog-new-group-wrapper {
  width: 100%;
  padding: 0 px2rem(20);
  box-sizing: border-box;
  .dialog-input-title-wrapper {
    font-size: px2rem(10);
    margin-top: px2rem(20);
  }
  .dialog-input-wrapper {
    width: 100%;
    padding: 0 0 px2rem(30) 0;
    box-sizing: border-box;
    .dialog-input-inner-wrapper {
      display: flex;
      width: 100%;
      padding: px2rem(10) 0;
      box-sizing: border-box;
      border-bottom: px2rem(1) solid #eee;
      font-size: px2rem(14);
      color: #666;
      .dialog-input {
        flex: 1;
        border: none;
        &:focus {
          outline: none;
        }
      }
      .dialog-input-clear-wrapper {
        flex: 0 0 px2rem(30);
        color: #ccc;
        @include center;
        &:active {
          color: #999;
        }
      }
    }
  }
}

.group-dialog-btn-wrapper {
  width: 100%;
  @include center;
}

.dialog-btn {
  flex: 1;
  &.is-empty {
    color: rgba(255, 255, 255, 0.5);
  }
  &:active {
    color: rgba(255, 255, 255, 0.5);
  }
}
</style>