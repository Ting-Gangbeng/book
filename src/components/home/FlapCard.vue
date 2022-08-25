<template>
  <div class="flap-card-wrapper" v-show="flapCardVisible">
    <div
      class="flap-card-bg"
      :class="{ animation: runFlapCardAnimation }"
      v-show="runFlapCardAnimation"
    >
      <div
        class="flap-card"
        v-for="(item, index) in flapCardList"
        :key="index"
        :style="{ zIndex: item.zIndex }"
      >
        <div class="flap-card-circle">
          <div
            class="flap-card-semi-circle flap-card-semi-circle-left"
            :style="semiCircleStyle(item, 'left')"
            ref="left"
          ></div>
          <div
            class="flap-card-semi-circle flap-card-semi-circle-right"
            :style="semiCircleStyle(item, 'right')"
            ref="right"
          ></div>
        </div>
      </div>
      <div class="point-warpper">
        <div
          class="point"
          :class="{ animation: runPointAnimation }"
          v-for="item in pointList"
          :key="item"
        ></div>
      </div>
    </div>
    <div
      class="book-card"
      :class="{ animation: runBookCardAnimation }"
      v-show="runBookCardAnimation"
    >
      <div class="book-card-wrapper">
        <div class="img-wrapper">
          <img class="img" :src="data ? data.cover : ''" />
        </div>
        <div class="content-wrapper">
          <div class="content-title">{{ data ? data.title : "" }}</div>
          <div class="content-author sub-title-medium">
            {{ data ? data.author : "" }}
          </div>
          <div class="content-category">{{ categoryText() }}</div>
        </div>
        <div class="read-btn" @click.stop="showBookDetail(data)">
          {{ $t("home.readNow") }}
        </div>
      </div>
    </div>
    <div class="close-btn-warpper" @click="close">
      <span class="icon-close"></span>
    </div>
  </div>
</template>

<script>
import { storeHomeMixin } from '../../utils/mixin'
import { flapCardList, categoryText } from '../../utils/store'

export default {
  mixins: [storeHomeMixin],
  props: {
    data: Object
  },
  data() {
    return {
      flapCardList,
      front: 0,
      back: 1,
      intervalTime: 25,
      runFlapCardAnimation: false,
      pointList: null,
      runPointAnimation: false,
      runBookCardAnimation: false
    }
  },
  watch: {
    // 从vuex中监听卡片动画显示
    flapCardVisible(v) {
      if (v) {
        this.runAnimation()
      }
    }
  },
  methods: {
    // 运行动画
    runAnimation() {
      // 卡片显示动画
      this.runFlapCardAnimation = true
      // 翻转和烟花动画
      this.timeout1 = setTimeout(() => {
        this.startFlapCardAnimation()
        this.startPointAnimation()
      }, 300)
      this.timeout2 = setTimeout(() => {
        this.stopAnimation()
        this.runBookCardAnimation = true
      }, 2500)
    },
    // 开始旋转动画
    startFlapCardAnimation() {
      this.prepare()
      this.task = setInterval(() => {
        this.flapCardRotate()
      }, this.intervalTime)
    },
    // 开始烟花动画
    startPointAnimation() {
      this.runPointAnimation = true
      setTimeout(() => {
        this.runPointAnimation = false
      }, 750)
    },
    // 停止动画
    stopAnimation() {
      // this.runFlapCardAnimation = false // 在reset中了
      if (this.task) {
        // 清除翻转动画的定时任务
        clearInterval(this.task)
      }
      if (this.timeout1) {
        clearInterval(this.timeout1)
      }
      if (this.timeout2) {
        clearInterval(this.timeout2)
      }
      this.reset()
    },
    // 关闭书籍推荐
    close() {
      this.stopAnimation()
      this.setFlapCardVisible(false)
    },
    semiCircleStyle(item, dir) {
      return {
        backgroundColor: `rgb(${item.r}, ${item.g}, ${item.b})`,
        backgroundSize: item.backgroundSize,
        backgroundImage: dir === 'left' ? item.imgLeft : item.imgRight
      }
    },
    // 卡片转动
    rotate(index, type) {
      const item = this.flapCardList[index]
      let dom
      if (type === 'front') {
        dom = this.$refs.right[index]
      } else {
        dom = this.$refs.left[index]
      }
      // 转动度数 0deg 会转到原位置 顺时针是正角度
      dom.style.transform = `rotateY(${item.rotateDegree}deg)`
      dom.style.backgroundColor = `rgb(${item.r}, ${item._g}, ${item.b})`
    },
    flapCardRotate() {
      const frontFlapCard = this.flapCardList[this.front]
      const backFlapCard = this.flapCardList[this.back]
      frontFlapCard.rotateDegree += 10
      frontFlapCard._g -= 5
      backFlapCard.rotateDegree -= 10
      // 背面半圆 颜色增加 跟原来相同
      if (backFlapCard.rotateDegree < 90) {
        backFlapCard._g += 5
      }
      // 右边的半圆其实是往外旋转到90度之后不显示了，
      // 左边的半圆往里旋转90度之后 显示，就这样形成重叠的动画
      // 转过90度之后 背面半圆覆盖前面半圆显示
      if (frontFlapCard.rotateDegree === 90 && backFlapCard.rotateDegree === 90) {
        backFlapCard.zIndex += 2
      }
      // 实现转动
      this.rotate(this.front, 'front')
      this.rotate(this.back, 'back')
      // 两个半圆转到左边
      if (frontFlapCard.rotateDegree === 180 && backFlapCard.rotateDegree === 0) {
        this.next()
      }
    },
    // 执行下一组旋转
    next() {
      // 还原
      const frontFlapCard = this.flapCardList[this.front]
      const backFlapCard = this.flapCardList[this.back]
      frontFlapCard.rotateDegree = 0
      backFlapCard.rotateDegree = 0
      frontFlapCard._g = frontFlapCard.g
      backFlapCard._g = backFlapCard.g
      // 移动到原来的位置
      this.rotate(this.front, 'front')
      this.rotate(this.back, 'back')
      // 下一组
      this.front++
      this.back++
      const len = this.flapCardList.length
      if (this.front >= len) {
        this.front = 0
      }
      if (this.back >= len) {
        this.back = 0
      }
      // 动态设置zIndex
      // 100 -> 96
      // 99 -> 100
      // 98 -> 99
      // 97 -> 98
      // 96 -> 97
      // （0 -1 + 5） % 5 = 4
      // （1 - 1 + 5） % 5 = 0
      // zIndex每次变化 都要增大 才不会覆盖
      this.flapCardList.forEach((item, index) => {
        item.zIndex = 100 - ((index - this.front + len) % len)
      })
      this.prepare()
    },
    // 左半圆初始角度为180，之后旋转角度依次减10，
    // 往里面旋转。小于90度的时候才显示
    prepare() {
      const backFlapCard = this.flapCardList[this.back]
      backFlapCard.rotateDegree = 180
      // 左边的半圆背景颜色先减少 每次5 转动9次
      backFlapCard._g = backFlapCard.g - 5 * 9
      this.rotate(this.back, 'back')
    },
    // 关闭卡片翻转动画之后 重置
    reset() {
      this.front = 0
      this.back = 1
      this.flapCardList.forEach((item, index) => {
        item.zIndex = 100 - index
        item._g = item.g
        item.rotateDegree = 0
        this.rotate(index, 'front')
        this.rotate(index, 'back')
      })
      this.runFlapCardAnimation = false
      this.runPointAnimation = false
      this.runBookCardAnimation = false
    },
    // 显示推荐图书的名字
    categoryText() {
      // data是获取到的书籍信息
      if (this.data) {
        // console.log(this.data)
        // util中的函数 获取书籍的分类
        return categoryText(this.data.category, this)
      } else {
        return ''
      }
    }
  },
  created() {
    this.pointList = []
    for (let i = 0; i < 18; i++) {
      this.pointList.push(`point${i}`)
    }
  }
  // mounted() { // 放到监听
  //   // this.startFlapCardAnimation()
  // }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global";
@import "../../assets/styles/flapCard";

.flap-card-wrapper {
  z-index: 1000;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  @include center;
  @include absCenter;
  .flap-card-bg {
    position: relative;
    width: px2rem(64);
    height: px2rem(64);
    border-radius: px2rem(5);
    background: white;
    transform: scale(0);
    opacity: 0;
    &.animation {
      animation: flap-card-move 0.3s ease-in both;
    }
    @keyframes flap-card-move {
      0% {
        transition: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.2);
        opacity: 1;
      }
      75% {
        transform: scale(0.9);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    // 每一个圆
    .flap-card {
      width: px2rem(48);
      height: px2rem(48);
      // background: orange;
      // 绝对定位居中
      @include absCenter;
      .flap-card-circle {
        display: flex;
        width: 100%;
        height: 100%;
        .flap-card-semi-circle {
          flex: 0 0 50%;
          width: 50%;
          height: 100%;
          background-repeat: no-repeat;
          // 半圆背面隐藏
          backface-visibility: hidden;
        }
        .flap-card-semi-circle-left {
          border-radius: px2rem(24) 0 0 px2rem(24);
          background-position: center right;
          transform-origin: right;
        }
        .flap-card-semi-circle-right {
          border-radius: 0 px2rem(24) px2rem(24) 0;
          background-position: center left;
          transform-origin: left;
        }
      }
    }
    .point-warpper {
      z-index: 1500;
      @include absCenter;
      .point {
        border-radius: 50%;
        @include absCenter;
        &.animation {
          @for $i from 1 to length($moves) {
            &:nth-child(#{$i}) {
              @include move($i);
            }
          }
        }
      }
    }
  }
  .book-card {
    position: relative;
    width: 65%;
    max-width: px2rem(400);
    box-sizing: border-box;
    border-radius: px2rem(15);
    background: white;
    &.animation {
      animation: scale 0.3s ease-in both;
      @keyframes scale {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    }
    .book-card-wrapper {
      width: 100%;
      height: 100%;
      margin-bottom: px2rem(30);
      @include columnTop;
      .img-wrapper {
        width: 100%;
        margin-top: px2rem(10);
        @include center;
        .img {
          width: px2rem(90);
          height: px2rem(130);
        }
      }
      .content-wrapper {
        padding: 0 px2rem(20);
        margin: px2rem(8);
        .content-title {
          color: #333;
          font-weight: bold;
          font-size: px2rem(18);
          line-height: px2rem(20);
          max-height: px2rem(40);
          text-align: center;
          @include ellipsis2(2);
        }
        .content-author {
          margin-top: px2rem(5);
          text-align: center;
        }
        .content-category {
          color: #999;
          font-size: px2rem(14);
          margin-top: px2rem(5);
          text-align: center;
        }
      }
      .read-btn {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1100;
        width: 100%;
        border-radius: 0 0 px2rem(15) px2rem(15);
        padding: px2rem(10) 0;
        text-align: center;
        color: white;
        font-size: px2rem(14);
        background: $color-blue;
      }
    }
  }
  .close-btn-warpper {
    position: absolute;
    left: 0;
    bottom: px2rem(30);
    z-index: 1100;
    width: 100%;
    @include center;
    .icon-close {
      width: px2rem(45);
      height: px2rem(45);
      border-radius: 50%;
      background: #333;
      font-size: px2rem(25);
      color: white;
      @include center;
    }
  }
}
</style>