<template>
  <div class="ebook" ref="ebook">
    <ebook-header></ebook-header>
    <ebook-reader></ebook-reader>
    <ebook-title></ebook-title>
    <ebook-menu></ebook-menu>
    <ebook-bookmark></ebook-bookmark>
    <ebook-footer></ebook-footer>
  </div>
</template>

<script>
import EbookReader from "@/components/ebook/EbookReader";
import EbookTitle from "../../components/ebook/EbookTitle.vue";
import EbookMenu from "../../components/ebook/EbookMenu.vue";
import EbookBookmark from "@/components/ebook/EbookBookmark";
import EbookHeader from "@/components/ebook/EbookHeader";
import EbookFooter from "@/components/ebook/EbookFooter";
import { getReadTime, saveReadTime } from "@/utils/localStorage";
import { ebookMixin } from "@/utils/mixin";

export default {
  mixins: [ebookMixin],
  components: {
    EbookReader,
    EbookTitle,
    EbookMenu,
    EbookBookmark,
    EbookHeader,
    EbookFooter,
  },
  watch: {
    //监听y轴的变化
    offsetY(v) {
      if (!this.menuVisible && this.bookAvailable) {
        if (v > 0) {
          this.move(v);
        } else if (v == 0) {
          this.restore();
        }
      }
    },
  },
  methods: {
    restore() {
      this.$refs.ebook.style.top = 0;
      this.$refs.ebook.style.transition = "all .2s linear";
      setTimeout(() => {
        this.$refs.ebook.style.transition = "";
      }, 200);
    },
    move(v) {
      this.$refs.ebook.style.top = v + "px";
    },
    startLoopReadTime() {
      let readTime = getReadTime(this.fileName);
      if (!readTime) {
        readTime = 0;
      }
      this.task = setInterval(() => {
        readTime++;
        if (readTime % 30 == 0) {
          //每30秒记录一次
          saveReadTime(this.fileName, readTime);
        }
      }, 1000);
    },
  },
  mounted() {
    this.startLoopReadTime();
  },
  beforeDestroyed() {
    if (this.task) {
      clearInterval(this.task);
    }
  },
};
</script>

<style lang="scss" scoped>
.ebook {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>