<template>
  <div class="shelf-list" :style="{ top: shelfListTop }">
    <transition-group name="list" tag="div" id="shelf-list">
      <div v-for="item in data" :key="item.id" class="shelf-list-item-wrapper">
        <shelf-item :data="item" :style="{ height: itemHeight }"></shelf-item>
        <div class="shelf-list-title-wrapper">
          <span class="shelf-list-title title-small">{{ item.title }}</span>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { storeShelfMixin } from "@/utils/mixin";
import ShelfItem from "@/components/shelf/ShelfItem";
import { realPx, px2rem } from "@/utils/utils";
export default {
  mixins: [storeShelfMixin],
  props: {
    top: { type: Number, default: 94 },
    data: { type: Array },
  },
  components: {
    ShelfItem,
  },

  computed: {
    itemHeight() {
      // h = w * 350 / 250
      // 书籍封面的宽高比
      // 高度自适应计算
      return ((window.innerWidth - realPx(120)) / 3 / 250) * 350 + "px";
    },
    shelfListTop() {
      return px2rem(this.top) + "rem";
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global";

.shelf-list {
  position: absolute;
  top: px2rem(94);
  left: 0;
  z-index: 100;
  width: 100%;

  #shelf-list {
    display: flex;
    flex-flow: row wrap;
    padding: 0 px2rem(15);
    box-sizing: border-box;
    width: 100%;

    .shelf-list-item-wrapper {
      flex: 0 0 33.33%;
      width: 33.33%;
      padding: px2rem(15);
      box-sizing: border-box;
      &.list-leave-active {
        display: none;
      }
      &.list-move {
        transition: transform 0.5s;
      }
      .shelf-list-title-wrapper {
        margin-top: px2rem(10);
      }
    }
  }
}
</style>