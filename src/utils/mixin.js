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
        refreshLocation() {//????????????????????????
            const currentLocation = this.currentBook.rendition.currentLocation();
            if (currentLocation && currentLocation.start) {
                const startCfi = currentLocation.start.cfi;
                const progress = this.currentBook.locations.percentageFromCfi(startCfi);
                this.setProgress(Math.floor(progress * 100)); //???????????????
                this.setSection(currentLocation.start.index);//????????????          
                saveLocation(this.fileName, startCfi); //???????????????

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
            //?????????????????????????????? ?????????????????????
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
            'shelfCategory',//????????????
            'currentType'])
    },
    methods: {
        ...mapActions(['setIsEditMode',
            'setShelfList',
            'setShelfSelected',
            'setShelfTitleVisible',
            'setOffsetY',
            'setShelfCategory',//??????????????????
            'setCurrentType'
        ]),

        getCategoryList(title) {//??????title??????????????????

            this.getShelfList().then(() => {
                const categoryList = this.shelfList.filter(book => book.type === 2 && book.title == title)[0];
                this.setShelfCategory(categoryList)
            })

        },
        showBookDetail(book) {
            gotoBookDetail(this, book)
        },
        getShelfList() {
            //????????????
            let shelfList = getBookShelf();//?????????????????????
            if (!shelfList) {
                //?????????????????? ???????????????
                return shelf().then((response) => {
                    if (response && response.data && response.data.bookList) {
                        shelfList = appendAddToShelf(response.data.bookList);
                        saveBookShelf(shelfList); //???????????????
                        this.setShelfList(shelfList); //?????????vuex
                    }
                });
            } else {
                return this.setShelfList(shelfList);//?????????????????????vuex
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
                list = computedId(list); //?????????????????????
                this.setShelfList(list).then(() => {
                    this.simpleToast(this.$t("shelf.moveBookOutSuccess"));
                    if (cb) cb();

                });
            });
        }
    }
}

