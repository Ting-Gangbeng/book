import { mapGetters, mapActions } from "vuex";
import { themeList, addCss, removeAllCss, getReadTimeByMinute } from "./book";
import { getBookmark, saveLocation, saveBookShelf, getBookShelf } from "@/utils/localStorage";
import { gotoBookDetail, appendAddToShelf, computedId, removeAddToShelf } from "./store";
import { shelf } from "@/api/store";


export const ebookMixin = {
    computed: {
        ...mapGetters(['fileName',
            'menuVisible',
            'settingVisible',
            'defaultFontSize',
            'defaultFontFamily',
            'fontFamilyVisible',
            'defaultTheme',
            'bookAvailable',
            'progress',
            'section',
            'isPaginating',
            'currentBook',
            'navigation',
            'cover',
            'metadata',
            'paginate',
            'pagelist',
            'offsetY',
            'isBookmark',
            'speakingIconBottom']),
        themeList() {
            return themeList(this);
        },
        getSectionName() {
            return this.section ? this.navigation[this.section].label : ''
        }
    },

    methods: {
        ...mapActions(['setFileName',
            'setMenuVisible',
            'setSettingVisible',
            'setDefaultFontSize',
            'setDefaultFontFamily',
            'setFontFamilyVisible',
            'setDefaultTheme',
            'setBookAvailable',
            'setProgress',
            'setSection',
            'setIsPaginating',
            'setCurrentBook',
            'setNavigation',
            'setCover',
            'setMetadata',
            'setPaginate',
            'setPagelist',
            'setOffsetY',
            'setIsBookmark',]),
        initGlobalStyle() {
            removeAllCss()
            switch (this.defaultTheme) {
                case "Default":
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`);
                    break;
                case "Eye":
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`);
                    break;
                case "Gold":
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`);
                    break;
                case "Night":
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`);
                    break;
            }
        },
        refreshLocation() {//根据视图储存东西
            const currentLocation = this.currentBook.rendition.currentLocation();
            if (currentLocation && currentLocation.start) {
                const startCfi = currentLocation.start.cfi;
                const progress = this.currentBook.locations.percentageFromCfi(startCfi);
                this.setProgress(Math.floor(progress * 100)); //更新进度条
                this.setSection(currentLocation.start.index);//更新章节          
                saveLocation(this.fileName, startCfi); //保存到本地

                let bookmark = getBookmark(this.fileName)
                if (bookmark) {
                    if (bookmark.some(item => item.cfi == startCfi)) {
                        this.setIsBookmark(true)
                    } else {
                        this.setIsBookmark(false)
                    }
                } else {
                    this.setIsBookmark(false)

                }

            }

        },

        display(target, cb) {
            if (target) {
                this.currentBook.rendition.display(target).then(() => {
                    this.refreshLocation();
                    if (cb) cb()
                })
            } else {
                this.currentBook.rendition.display().then(() => {
                    this.refreshLocation();
                    if (cb) cb()
                })
            }
        },
        hideTitleAndMenu() {
            //翻页的时候隐藏菜单栏 点击的时候隐藏
            this.setMenuVisible(false);
            this.setSettingVisible(-1);
            this.setFontFamilyVisible(false);
        },
        getReadTimeText() {
            return this.$t("book.haveRead").replace("$1", getReadTimeByMinute(this.fileName));
        },



    }
}

export const storeHomeMixin = {
    computed: {
        ...mapGetters(['offsetY', 'hotSearchOffsetY', 'flapCardVisible'])
    },
    methods: {
        ...mapActions(['setOffsetY', 'setHotSearchOffsetY', 'setFlapCardVisible']),
        showBookDetail(book) {
            this.$router.push({
                path: '/store/detail',
                query: {
                    fileName: book.fileName,
                    category: book.categoryText,
                }
            })

        }
    },
    showBookDetail(book) {
        gotoBookDetail(this, book)
    }
}

export const storeShelfMixin = {
    computed: {
        ...mapGetters(['isEditMode',
            'shelfList',
            'shelfSelected',
            'shelfTitleVisible',
            'offsetY',
            'shelfCategory',//某一分类
            'currentType'])
    },
    methods: {
        ...mapActions(['setIsEditMode',
            'setShelfList',
            'setShelfSelected',
            'setShelfTitleVisible',
            'setOffsetY',
            'setShelfCategory',//分类列表数据
            'setCurrentType'
        ]),

        getCategoryList(title) {//根据title获取分类列表

            this.getShelfList().then(() => {
                const categoryList = this.shelfList.filter(book => book.type === 2 && book.title == title)[0];
                this.setShelfCategory(categoryList)
            })

        },
        showBookDetail(book) {
            gotoBookDetail(this, book)
        },
        getShelfList() {
            //加载书架
            let shelfList = getBookShelf();//从本地加载缓存
            if (!shelfList) {
                //如果没有缓存 就加载资源
                return shelf().then((response) => {
                    if (response && response.data && response.data.bookList) {
                        shelfList = appendAddToShelf(response.data.bookList);
                        saveBookShelf(shelfList); //保存到本地
                        this.setShelfList(shelfList); //保存到vuex
                    }
                });
            } else {
                return this.setShelfList(shelfList);//获取缓存保存到vuex
            }
        },
        moveOutOfGroup(cb) {
            this.setShelfList(
                this.shelfList.map((book) => {
                    if (book.type === 2 && book.itemList) {
                        book.itemList = book.itemList.filter(
                            (subBook) => !subBook.selected
                        );
                    }
                    return book;
                })
            ).then(() => {
                let list = removeAddToShelf(this.shelfList);
                list = [].concat(list, ...this.shelfSelected);
                list = appendAddToShelf(list);
                list = computedId(list); //将书籍重新排序
                this.setShelfList(list).then(() => {
                    this.simpleToast(this.$t("shelf.moveBookOutSuccess"));
                    if (cb) cb();

                });
            });
        }
    }
}

