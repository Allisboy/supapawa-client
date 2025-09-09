import { $state, runEffect, useInsert, pawaComponent,render } from "pawajs"
import { plugin } from "./plugin.js"
import { diffHtml } from "./serverHtml.js"
import axios from 'axios'

/**
 * @type {Array<{current:boolean,url:string,html:Response,redirect:boolean,redirectTo:string}>}
 */
let cache=[]
let pageApp=null

plugin()
export const getPage=()=>pageApp
function enhanceHistoryAPI() {
    if (window.__pawaHistoryEnhanced) return;
    window.__pawaHistoryEnhanced = true;
  
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
  
    const event = new Event('pushchange');
    const dispatchPushEvent = () => {
      window.dispatchEvent(event);
    };
  
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      dispatchPushEvent();
    };
  
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      dispatchPushEvent();
    };
    window.addEventListener('popstate', (e)=>{
      e.preventDefault?.();
      dispatchPushEvent()
    })
  }


/**
 * @type {{value:string,id:string}}
 */
const route=$state(window.location.href)
/**
 * @type {{value:{loading:boolean,success:boolean,error:boolean}}}
 */
const fetcher=$state({
    loading:false,success:false,error:false
})
 export const pageFetch=(config={})=>{
    return {
        post:async({url,formData})=>{
            try {
                const fetchers=await axios.post(url,{
                    ...formData
                },{
                    headers:{
                        'X-From-Page':window.location.pathname
                    },
            }
        )
            const current=window.location.href === url
           if (typeof fetchers.data === 'string') {
            await diffHtml(fetchers.data,current)
           } else {
            const redirect=fetchers.headers['x-redirect-page']
                if (redirect) {
                    window.history.pushState({}, '', redirect);
                    route.value=redirect;
                } 
           }
            } catch (error) {
                console.log(error.message,error.stack)
            }
        },
        get:async({url})=>{
             try {
                fetcher.value.loading=true
                const fetchers=await axios.get(url,{
                    headers:{
                        'X-From-Page':window.location.pathname
                    },
                ...config
            })
            const current=window.location.href === url
            if (typeof fetchers.data === 'string') {
               await diffHtml(fetchers.data)
            } else {
                const redirect=fetchers.headers['x-redirect-page']
                if (redirect) {
                    window.history.pushState({}, '', redirect);
                    route.value=redirect;
                } 
            }
            const time=setTimeout(()=>{
                fetcher.value.loading=false
                clearTimeout(time)
            },100)
            } catch (error) {
                console.log(error.message,error.stack)
                fetcher.value.error=true
                fetcher.value.loading=false
            }

        },
        refresh:async()=>{
             try {
                fetcher.value.loading=true
                const fetchers=await axios.get(url,{
                    headers:{
                        'X-From-Page':window.location.pathname
                    },
                ...config
            })
            const current=true
            diffHtml(fetchers.data,current)
            const time=setTimeout(()=>{
                fetcher.value.loading=false
                clearTimeout(time)
            },100)
            } catch (error) {
                console.log(error.message,error.stack)
                fetcher.value.error=true
                fetcher.value.loading=false
            }
        },
        prefetch:async({url})=>{
             try {
                const fetchers=await axios.get(url,{
                    headers:{
                        'X-From-Page':window.location.pathname
                    },
                ...config
            })
            
            const current=window.location.href === url
            if (typeof fetchers.data === 'string') {
                cache.push({
                    current:current,
                    url:url,
                    html:fetchers
                })
            } else {
                const redirect=fetchers.headers['x-redirect-page']
                if (redirect) {
                    cache.push({
                        redirect:true,
                        url:current,
                        redirectTo:redirect
                    })
                } 
            }
            } catch (error) {
                console.log(error.message,error.stack)
            }
        }
    }
}


const pageData=()=>{}


export const supaPawa=()=>{
    const refreshPage=pageFetch().refresh
    runEffect(()=>{
        enhanceHistoryAPI()
        window.addEventListener('pushchange',()=>{
            const url=window.location.href
            // console.log(url)
            const main=cache.filter(route=>route.url===url)
            if (main.length > 0) {
                cache=[]
                const currentRoute=main[0]
                if (currentRoute.redirect) {
                    history.pushState({},'',currentRoute.redirect)
                }else{
                    diffHtml(currentRoute.html.data,currentRoute.current)
                }
            } else {
                pageFetch().get({url:window.location.href}) 
            }
        })
    })
    useInsert({refreshPage,fetcher})
}

export const startApp=(callback)=>{
    pawaComponent('@pawa-app',()=>{
        supaPawa()
        callback()
    })
    const app=document.getElementById('app')
    pageApp=app
    render(app)
}