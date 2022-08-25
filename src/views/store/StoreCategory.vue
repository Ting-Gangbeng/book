<template>
  <div class="store-shelf">
    <shelf-title :title="shelfCategory.title" ></shelf-title>
    <scroll
      :top="0"
      class="store-shelf-scroll-wrapper"
      @onScroll="onScroll"
      :bottom="scrollBottom"
      ref="scroll"
      v-if="ifShowList"
    >
      <shelf-list :top="42" :data="shelfCategory.itemList"></shelf-list>
    </scroll>
    <!-- 分类列表数据为空时展示内容 -->
    <div class="store-shelf-empty-view" v-else>{{ $t("shelf.groupNone") }}</div>
    <shelf-footer></shelf-footer>
  </div>
</template>

<script>
import ShelfTitle from "@/components/shelf/ShelfTitle";
import { storeShelfMixin } from "@/utils/mixin";
import Scroll from "../../components/common/Scroll.vue";
import ShelfList from "../../components/shelf/ShelfList.vue";
import ShelfFooter from "../../components/shelf/ShelfFooter.vue";

export default {
  mixins: [storeShelfMixin],
  components: {
    ShelfTitle,
    Scroll,
    ShelfList,
    ShelfFooter,
  },

  mounted() {
    this.getCategoryList(this.$route.query.title);//加载分类里的内容放入vuex
    this.setCurrentType(2); //状态2 在分类列表里
  },

  data() {
    return {
      scrollBottom: 0,
    };
  },
  watch: {
    isEditMode(isEditMode) {
      this.scrollBottom = isEditMode ? 48 : 0;
      this.$nextTick(() => {
        this.$refs.scroll.refresh();
      });
    },
  },
  computed: {
    selectedText() {
      return this.$t("shelf.selectBook");
    },
    ifShowList() {
      // 分类列表展示的条件
      return (
        this.shelfCategory.itemList && this.shelfCategory.itemList.length > 0
      );
    },
  },
  methods: {
    onScroll(offsetY) {
      this.setOffsetY(offsetY);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global";
.store-shelf {
  position: relative;
  z-index: 100;
  width: 100%;
  height: 100%;
  .store-shelf-scroll-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 101;
  }
  .store-shelf-empty-view {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    font-size: px2rem(14);
    color: #333;
    @include center;
  }
}
</style>