import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import book from './modules/book'
import store from './modules/store'
import getters from './getters'
import actions from './actions'

export default new Vuex.Store({
  modules: {
    book,
    store
  },
  getters,
  actions
})
