<template>
  <div class="menu-bar">
    <transition name="slide-up">
      <div
        class="menu-wrapper"
        v-show="menuVisible"
        :class="{ 'hide-box-shadow': settingVisible >= 0 }"
      >
        <div class="icon-wrapper">
          <span class="icon-menu" @click="showSetting(3)"></span>
        </div>
        <div class="icon-wrapper">
          <span class="icon-progress" @click="showSetting(2)"></span>
        </div>
        <div class="icon-wrapper">
          <span class="icon-bright" @click="showSetting(1)"></span>
        </div>
        <div class="icon-wrapper">
          <span class="icon-A" @click="showSetting(0)"></span>
        </div>
      </div>
    </transition>
    <EbookSettingFont />
    <EbookSettingFontPopup />
    <EbookSettingTheme />
    <EbookSettingProgress />
    <EbookSlide />
  </div>
</template>

<script>
import EbookSettingFont from "@/components/ebook/EbookSettingFont";
import EbookSettingFontPopup from "@/components/ebook/EbookSettingFontPopup";
import EbookSettingTheme from "@/components/ebook/EbookSettingTheme";
import EbookSettingProgress from "@/components/ebook/EbookSettingProgress";
import EbookSlide from "@/components/ebook/EbookSlide";
import { ebookMixin } from "@/utils/mixin";
export default {
  components: {
    EbookSettingFont,
    EbookSettingFontPopup,
    EbookSettingTheme,
    EbookSettingProgress,
    EbookSlide,
  },
  mixins: [ebookMixin],
  methods: {
    showSetting(key) {
      this.setSettingVisible(key);
    },
  },
};
</script>

<style lang='scss' scoped>
@import "@/assets/styles/global";

.menu-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 300;
  display: flex;
  width: 100%;
  height: px2rem(48);
  background: white;
  box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, 0.15);
  font-size: px2rem(20);
  &.hide-box-shadow {
    box-shadow: none;
  }
  .icon-wrapper {
    flex: 1;
    @include center;
    .icon-progress {
      font-size: px2rem(24);
    }
    .icon-bright {
      font-size: px2rem(22);
    }
  }
}
</style>
