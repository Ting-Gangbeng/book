
import axios from 'axios'
import { setLocalForage } from '../utils/localForage'

// 听书中用到的接口
// export function flatList() {
//   return axios({
//     method: 'get',
//     url: `${process.env.VUE_APP_BOOK_URL}/book/flat-list`
//   })
// }

export function download(book, onSuccess, onError, onProgress) {
    if (!onProgress) {
        onProgress = onError
        onError = null
    }
    // axios.create是创建一个axios实例，之后就可以用get请求获取数据，返回promise对象
    return axios.create({
        // 基本配置
        baseURL: process.env.VUE_APP_EPUB_URL,
        methode: 'get',
        responseType: 'blob',
        timeout: 180 * 1000,
        // 监听下载进度的变化
        onDownloadProgress: progressEvent => {
            if (onProgress) onProgress(progressEvent)
        }
    }).get(`${book.categoryText}/${book.fileName}.epub`)
        .then(res => {
            // console.log(res)
            const blob = new Blob([res.data])
            // 保存在indexDB中
            setLocalForage(book.fileName, blob, () => {
                if (onSuccess) onSuccess(book)
            }, err => {
                if (onError) onError(err)
            })
        }).catch(err => {
            if (onError) onError(err)
        })
}
// 发布异步网络请求 获取接口数据
export function shelf() {
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BASE_URL}/book/shelf`
    })
}

export function home() {
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BASE_URL}/book/home`
    })
}

export function detail(book) {
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BOOK_URL}/book/detail`,
        params: {
            fileName: book.fileName
        }
    })
}

// 获取首页有搜索以及分类列表的数据
export function list() {
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BASE_URL}/book/list`
    })
}