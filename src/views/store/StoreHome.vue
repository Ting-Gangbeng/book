<!-- 书城首页组件 -->
<template>
  <div class="store-home">
    <search-bar></search-bar>
    <flap-card :data="random"></flap-card>
    <scroll :top="scrollTop" @onScroll="onScroll" ref="scroll">
      <!-- <div class="banner-wrapper">
        <div
          class="banner-img"
          :style="{ backgroundImage: `url('${banner}')` }"
        ></div>
      </div> -->
      <recommend class="recommend" :data="recommend"></recommend>
      <guess-you-like :data="guessYouLike"></guess-you-like>
      <featured
        class="featured"
        :data="featured"
        :titleText="$t('home.featured')"
        :btnText="$t('home.seeAll')"
      ></featured>
      <div
        class="category-list-wrapper"
        v-for="(item, index) in categoryList"
        :key="index"
      >
        <category-book :data="item"></category-book>
      </div>
      <category class="category" :data="categories"></category>
    </scroll>
  </div>
</template>

<script>
import SearchBar from '../../components/home/SearchBar'
import FlapCard from '../../components/home/FlapCard'
import Scroll from '../../components/common/Scroll'
import GuessYouLike from '../../components/home/guessYouLike'
import Recommend from '../../components/home/recommend'
import Featured from '../../components/home/featured'
import CategoryBook from '../../components/home/categoryBook'
import Category from '../../components/home/category'
import { storeHomeMixin } from '../../utils/mixin'
import { home } from '../../api/store'

export default {
  mixins: [storeHomeMixin],
  components: {
    SearchBar,
    Scroll,
    FlapCard,
    GuessYouLike,
    Recommend,
    Featured,
    CategoryBook,
    Category
  },
  data() {
    return {
      scrollTop: 94,
      random: null,
      // banner: '',
      guessYouLike: null,
      recommend: null,
      featured: null,
      categoryList: null,
      categories: null
    }
  },
  methods: {
    // 子组件scroll将滚动的偏移量传给父组件
    onScroll(offsetY) {
      // console.log(offsetY)
      this.setOffsetY(offsetY)
      if (offsetY > 0) {
        this.scrollTop = 52
      } else {
        this.scrollTop = 94
      }
      this.$refs.scroll.refresh()
    }
  },
  mounted() {
    // 获取数据
    home().then(response => {
      // console.log(response)
      if (response && response.status === 200) {
        const data = response.data
        // console.log(data)
        //  这里data.random.length长度1
        const randomIndex = Math.floor(Math.random() * data.random.length)
        // 存储一本书
        this.random = data.random[randomIndex]
        // console.log(this.random)
        // 取到图片
        // this.banner = data.banner
        // 猜你喜欢
        this.guessYouLike = data.guessYouLike
        // 热门推荐
        this.recommend = data.recommend
        // console.log(this.recommend)
        this.featured = data.featured
        this.categoryList = data.categoryList
        this.categories = data.categories
      }
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global";

.store-home {
  width: 100%;
  height: 100%;
  // .banner-wrapper {
  //   width: 100%;
  //   padding: px2rem(10);
  //   box-sizing: border-box;
  //   .banner-img {
  //     width: 100%;
  //     height: px2rem(140);
  //     background-repeat: no-repeat;
  //     background-size: 100% 100%;
  //   }
  // }
  .guess-you-like {
    margin-top: px2rem(10);
  }
  .featured {
    margin-top: px2rem(10);
  }
  .category-list-wrapper {
    margin-top: px2rem(10);
  }
  .category {
    margin-top: px2rem(10);
  }
}
</style>