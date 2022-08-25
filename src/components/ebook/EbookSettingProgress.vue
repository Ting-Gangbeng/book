<template>
  <transition name="slide-up">
    <div class="setting-wrapper" v-show="menuVisible && settingVisible == 2">
      <div class="setting-progress">
        <div class="read-time-wrapper">
          <div class="read-time-text">{{ getReadTimeText() }}</div>
          <div class="icon-forward"></div>
        </div>
        <div class="progress-wrapper">
          <div class="progress-icon-wrapper" @click="prevSetion()">
            <span class="icon-back"></span>
          </div>
          <input
            class="progress"
            type="range"
            max="100"
            min="0"
            step="1"
            @change="onProgressChange($event.target.value)"
            @input="onProgressInput($event.target.value)"
            :value="progress"
            :disabled="!bookAvailable"
            ref="progress"
          />
          <div class="progress-icon-wrapper" @click="nextSetion()">
            <span class="icon-forward"></span>
          </div>
        </div>

        <div class="text-wrapper">
          <span class="progress-section-text">{{ getSectionName }}</span>
          <span>({{ bookAvailable ? progress + "%" : "加载中..." }})</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ebookMixin } from "@/utils/mixin";
export default {
  mixins: [ebookMixin],
  mounted() {
    //初始化进度条
    this.updateProgressbg();
  },
  updated() {
    this.updateProgressbg();
  },

  methods: {
    onProgressChange(progress) {
      //进度条停止过后调用
      this.setProgress(progress).then(() => {
        this.displayProgress();
        this.updateProgressbg();
      });
    },
    onProgressInput(progress) {
      //进度条移动过程中调用
      this.setProgress(progress).then(() => {
        this.updateProgressbg();
      });
    },
    displayProgress() {
      //设置书本内容
      const cfi = this.currentBook.locations.cfiFromPercentage(
        //当前进度条位置所占比例
        this.progress / 100
      );
      this.display(cfi);
    },
    updateProgressbg() {
      //改变进度条背景
      this.$refs.progress.style.backgroundSize = `${this.progress}%  100%`;
    },
    prevSetion() {
      //上一章节跳转
      if (this.section > 0 && this.bookAvailable) {
        this.setSection(this.section - 1).then(() => {
          this.displaySection();
        });
      }
    },
    nextSetion() {
      //下一章节跳转
      if (
        this.section < this.currentBook.spine.length - 1 &&
        this.bookAvailable
      ) {
        this.setSection(this.section + 1).then(() => {
          this.displaySection();
        });
      }
    },
    displaySection() {
      const sectionInfo = this.currentBook.section(this.section); //下一张的信息 通过section获取章节信息
      if (sectionInfo && sectionInfo.href) {
        this.display(sectionInfo.href);
      }
    },
  },
};
</script>

<style lang='scss' scoped>
@import "@/assets/styles/global";
.setting-wrapper {
  position: absolute;
  bottom: px2rem(48);
  left: 0;
  z-index: 400;
  width: 100%;
  height: px2rem(90);
  background: white;
  box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, 0.15);

  .setting-progress {
    position: relative;
    width: 100%;
    height: 100%;
    .read-time-wrapper {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: px2rem(40);
      font-size: px2rem(12);
      @include center;
    }
    .progress-wrapper {
      width: 100%;
      height: 100%;
      @include center;
      padding: 0 px2rem(15);
      box-sizing: border-box;
      .progress-icon-wrapper {
        font-size: px2rem(20);
      }
      .progress {
        width: 100%;
        -webkit-appearance: none;
        height: px2rem(2);

        margin: 0 px2rem(10);
        &:focus {
          outline: none;
        }
        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: px2rem(20);
          width: px2rem(20);
          border-radius: 50%;
          background: white;
          box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.15);
          border: px2rem(1) solid #ddd;
        }
      }
    }
    .text-wrapper {
      position: absolute;
      left: 0;
      bottom: px2rem(10);
      width: 100%;
      color: #333;
      font-size: px2rem(12);
      text-align: center;
      padding: 0 px2rem(30);
      box-sizing: border-box;
      @include center;
      .progress-section-text {
        @include ellipsis;
      }
    }
  }
}
</style>