<template>
  <div
    class="shelf-item"
    :class="{ 'shelf-item-shadow': data.type == 1 || data.type == 2 }"
    @click="onItemClick"
  >
    <component
      :is="item"
      :data="data"
      class="shelf-item-comp"
      :class="{ 'is-edit': isEditMode && data.type == 2 }"
    ></component>
    <div
      class="shelf-item-select-icon icon-selected"
      :class="{ 'is-selected': data.selected }"
      v-show="isEditMode && data.type == 1"
    ></div>
  </div>
</template>

<script>
import { storeShelfMixin } from "@/utils/mixin";
import shelfBook from "./ShelfItemBook.vue";
import shelfCategory from "./ShelfItemCategory.vue";
import shelfAdd from "./ShelfItemAdd.vue";
import { gotoStoreHome } from "@/utils/store";
export default {
  props: {
    data: Object,
  },

  mixins: [storeShelfMixin],
  components: {
    shelfBook,
    shelfCategory,
    shelfAdd,
  },
  data() {
    return {
      book: shelfBook,
      category: shelfCategory,
      add: shelfAdd,
    };
  },
  computed: {
    item() {
      return this.data.type == 1
        ? this.book
        : this.data.type == 2
        ? this.category
        : this.add;
    },
  },
  methods: {
    onItemClick() {
      if (this.isEditMode) {
        //编辑模式
        this.data.selected = !this.data.selected; //打钩或者不打
        if (this.data.selected) {
          //放进选入的列表
          this.shelfSelected.pushWithoutDuplicate(this.data);
        } else {
          //从列表里面移除
          this.setShelfSelected(
            this.shelfSelected.filter((item) => item.id != this.data.id)
          );
        }
      } else {
        //根据不同类型点击进行跳转
        if (this.data.type === 1) {
          this.showBookDetail(this.data);
        } else if (this.data.type === 2) {
          this.$router.push({
            path: "/store/category",
            query: {
              title: this.data.title,
            },
          });
        } else {
          gotoStoreHome(this); //去到书城首页
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../assets/styles/global";

.shelf-item {
  position: relative;
  width: 100%;
  height: 100%;
  &.shelf-item-shadow {
    box-shadow: px2rem(2) px2rem(2) px2rem(2) px2rem(2) rgba(200, 200, 200, 0.3);
  }
  .shelf-item-comp {
    opacity: 1;
    &.is-edit {
      opacity: 50%;
    }
  }
  .icon-selected {
    position: absolute;
    bottom: px2rem(2);
    right: px2rem(2);
    font-size: px2rem(18);
    color: raba(0, 0, 0, 0.4);
    &.is-selected {
      color: $color-blue;
    }
  }
}
</style>