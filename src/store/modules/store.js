const store = {
    state: {
        hotSearchOffsetY: 0,
        flapCardVisible: false,
        isEditMode: false,//是否进入编辑模式
        shelfList: [],//书架图书列表
        shelfSelected: [],//暑假图书选中的列表
        shelfTitleVisible: [],
        currentType: 1, // 1:书架页面, 2:分组页面,
        shelfCategory: []//暑假分类列表数据
    },
    mutations: {
        SET_HOTSEARCH_OFFSETY(state, offsetY) {
            state.hotSearchOffsetY = offsetY
        },
        SET_FLAP_CARD_VISIBLE(state, visible) {
            state.flapCardVisible = visible
        },
        SET_IS_EDIT_MODE(state, isEditMode) {
            state.isEditMode = isEditMode
        },
        SET_SHELF_LIST(state, list) {
            state.shelfList = list
        },
        SET_SHELF_SELECTED(state, selected) {
            state.shelfSelected = selected
        },
        SET_SHELF_TITLE_VISIBLE(state, visible) {
            state.shelfTitleVisible = visible
        },
        SET_SHELF_CATEGORY(state, category) {
            state.shelfCategory = category
        },
        SET_CURRENT_TYPE(state, currentType) {
            state.currentType = currentType
        }



    },

}

export default store