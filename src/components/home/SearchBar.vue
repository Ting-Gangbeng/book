<template>
  <transition name="hot-search-move">
    <div>
      <div
        class="search-bar-wrapper"
        :class="{ 'hide-title': !titleVisible, 'hide-shadow': !shadowVisible }"
      >
        <transition name="title-move">
          <div class="search-bar-title-wrapper" v-show="titleVisible">
            <div class="title-text-wrapper">
              <span class="title-text-title title">
                {{ $t("home.title") }}
              </span>
            </div>
            <div class="title-icon-shake-wrapper" @click="showFlapCard">
              <span class="icon-shake icon"> </span>
            </div>
          </div>
        </transition>
        <div
          class="title-icon-back-wrapper"
          :class="{ 'hide-title': !titleVisible }"
          @click="back"
        >
          <span class="icon-back icon"></span>
        </div>
        <div
          class="search-bar-input-wrapper"
          :class="{ 'hide-title': !titleVisible }"
        >
          <div
            class="search-bar-blank"
            :class="{ 'hide-title': !titleVisible }"
          ></div>
          <div class="search-bar-input">
            <span class="icon-search icon"></span>
            <input
              type="text"
              class="search"
              :placeholder="$t('home.hint')"
              v-model="searchText"
              @click="showHotSearch"
              @keyup.13.exact="search"
            />
          </div>
        </div>
      </div>
      <hot-search-list
        v-show="hotSearchVisible"
        ref="hotSearch"
      ></hot-search-list>
    </div>
  </transition>
</template>

<script>
import { storeHomeMixin } from "@/utils/mixin";
import hotSearchList from "@/components/home/hotSearchList";
export default {
  mixins: [storeHomeMixin],
  components: {
    hotSearchList,
  },
  data() {
    return {
      searchText: "",
      titleVisible: true,
      shadowVisible: true,
      hotSearchVisible: false,
    };
  },
  watch: {
    offsetY(offsetY) {
      if (offsetY > 0) {
        this.hideTitle();
        this.showShadow();
      } else {
        this.showTitle();
        this.hideShadow();
      }
    },
    hotSearchOffsetY(hotSearchOffsetY) {
      if (hotSearchOffsetY) {
        this.showShadow();
      } else {
        this.hideShadow();
      }
    },
  },
  methods: {
    search() {
      //关键字搜索
      this.$router.push({
        path: "/store/list",
        query: {
          keyword: this.searchText,
        },
      });
    },
    showFlapCard() {
      this.setFlapCardVisible(true);
    },
    back() {
      if (this.offsetY > 0) {
        this.showShadow();
      } else {
        this.hideTitle();
      }
      this.showTitle();
      this.hideHotSearch();
    },
    hideHotSearch() {
      this.hotSearchVisible = false;

      if (this.offsetY > 0) {
        this.hideTitle();
        this.showShadow();
      } else {
        this.showTitle();
        this.hideShadow();
      }
    },
    showHotSearch() {
      this.hideTitle();
      this.hotSearchVisible = true;
      this.hideShadow();
      this.$nextTick(() => {
        this.$refs.hotSearch.reset(); //等dom更新完成才能进行操作
      });
    },
    hideTitle() {
      this.titleVisible = false;
    },
    showTitle() {
      this.titleVisible = true;
    },
    hideShadow() {
      this.shadowVisible = false;
    },
    showShadow() {
      this.shadowVisible = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global";
.search-bar-wrapper {
  position: relative;
  z-index: 150;
  width: 100%;
  height: px2rem(94);
  box-shadow: 0 px2rem(2) px2rem(2) 0 rgba(0, 0, 0, 0.1);
  &.hide-title {
    height: px2rem(52);
  }
  &.hide-shadow {
    box-shadow: none;
  }
  .search-bar-title-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: px2rem(42);

    .title-text-wrapper {
      width: 100%;
      height: px2rem(42);
      @include center;
    }
    .title-icon-shake-wrapper {
      position: absolute;
      top: 0;
      right: px2rem(15);
      height: px2rem(42);
    }
  }
  .title-icon-back-wrapper {
    position: absolute;
    z-index: 200;
    top: 0;
    left: px2rem(15);
    height: px2rem(42);
    &.hide-title {
      height: px2rem(52);
    }
  }
  .search-bar-input-wrapper {
    display: flex;
    position: absolute;
    top: px2rem(42);
    left: 0;
    width: 100%;
    height: px2rem(52);
    padding: px2rem(10);
    box-sizing: border-box;
    transition: top $animationTime $animationType;
    &.hide-title {
      top: 0;
    }
    .search-bar-blank {
      flex: 0 0 0;
      width: 0;
      transition: all $animationTime $animationType;
      &.hide-title {
        flex: 0 0 px2rem(31);
        width: px2rem(31);
      }
    }
    .search-bar-input {
      width: 100%;
      background-color: #f4f4f4;
      border-radius: px2rem(20);
      padding: px2rem(5) px2rem(15);
      box-sizing: border-box;
      border: px2rem(1) solid #eee;
      @include left;
      .search {
        width: 100%;
        height: px2rem(22);
        border: 0;
        background-color: transparent;
        margin-left: px2rem(10);
        font-size: px2rem(12);
        color: #666;
        .icon-search {
          color: #999;
        }
        &:focus {
          outline: none;
        }
        &::-webkit-input-placeholder {
          color: #ccc;
        }
      }
    }
  }
}
</style>