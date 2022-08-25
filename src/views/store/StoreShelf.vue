<template>
  <div class="store-shelf">
    <shelf-title :title="$t('shelf.title')" :ifShowBack="false"></shelf-title>
    <scroll
      :top="0"
      class="store-shelf-scroll-wrapper"
      @onScroll="onScroll"
      :bottom="scrollBottom"
      ref="scroll"
    >
      <shelf-search></shelf-search>
      <shelf-list :data="shelfList"></shelf-list>
    </scroll>
    <shelf-footer></shelf-footer>
  </div>
</template>

<script>
import ShelfTitle from "@/components/shelf/ShelfTitle";
import { storeShelfMixin } from "@/utils/mixin";
import Scroll from "../../components/common/Scroll.vue";
import ShelfSearch from "../../components/shelf/ShelfSearch.vue";
import ShelfList from "../../components/shelf/ShelfList.vue";
import ShelfFooter from "../../components/shelf/ShelfFooter.vue";

export default {
  mixins: [storeShelfMixin],
  components: {
    ShelfTitle,
    Scroll,
    ShelfSearch,
    ShelfList,
    ShelfFooter,
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
  },
  methods: {
    onScroll(offsetY) {
      this.setOffsetY(offsetY);
    },
  },
  mounted() {
    this.setCurrentType(1); //当前处于暑假列表；
    // this.setshelfCategory([])//书架列表为空
    this.getShelfList();
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
}
</style>