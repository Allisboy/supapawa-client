import { PluginSystem,$state, components } from "pawajs";
import { form } from "../../upgrade.js";
import { pageFetch } from "./index.js";
import {getPageController} from './hooks.js'
import { enter, exit } from "./animation.js";
import {registerPlugin} from 'pawajs-dom-rerender';
const pageCleanUpMap=new Map();
export const plugin=()=>{
    PluginSystem(()=>({
        attribute:{
            register:[
                {
                    escape:true,
                    fullName:'page-hydrate',
                    plugin:(el,attr)=>{
                        if (el._running) {
                            return
                        }
                        const pageController=getPageController()
                        const json=JSON.parse(attr.value)
                        const clientState={}
                        const params={}
                            for (const element in json) {
                                if (json[element]) {
                                    const obj=json[element]
                                    if (obj?.value || obj.value === '' || obj.value === false) {
                                        clientState[element]=$state(obj.value)
                                    }
                                    if (obj?.param) {
                                        Object.assign(params,obj.param)
                                    }
                                }
                            }
                            Object.assign(el._context,clientState)
                            Object.assign(pageController.data,clientState)
                            Object.assign(pageController.params,params)
                    }
                },
                {
                    fullName:'supa-action',
                    plugin:(el)=>{
                        if (el._running) {
                            return
                        }
                        const href=el.getAttribute('action') === ''?el._context['$supaPawaUrl']:el.href
                        form(el)
                    }
                },
                {
                    fullName:'page-url',
                    plugin:(el,attr)=>{

                        const isPage=attr.value
                        el._context['$supaPawaUrl']=isPage
                        const pageProcess={
                            url:isPage,
                        }
                        el._context.supaPawaInstance={
                            pageProcess:pageProcess
                        }
                        pageCleanUpMap.set(pageProcess,[])
                        el._setUnMount(()=>{
                            const getClearPageCompo=pageCleanUpMap.get(pageProcess)
                            getClearPageCompo.forEach((value, index) => {
                                if(components.has(value)){
                                    // components.delete(value)
                                }
                            })
                    
                            // pageCleanUpMap.delete(pageProcess)
                        })
                    }
                },
                {
                    fullName:'page-link',
                    plugin:(el,attr)=>{
                        if (el._running) {
                            return
                        }
                       el.addEventListener('click',(e)=>{
                        e.preventDefault();
                        history.pushState(null,"supa-pawa",el.href)
                       })
                       el.removeAttribute(attr.name)
                    }
                },
                {
                    fullName:'page-back',
                    plugin:(el)=>{
                        if(el._runing){
                            return
                        }
                        if(el.tagName !== 'A')return
                        el.addEventListener('click',(e)=>{
                            e.preventDefault()
                            history.back()
                        })
                    }
                },
                {
                    fullName:'page-prefetch',
                    plugin:(el)=>{
                        if (el._running) {
                            return
                        }
                        pageFetch().prefetch({url:el.href})
                    }
                },
                {
                    fullName:'pawa-in',
                    plugin:(el,attr)=>{
                        if (el._running) {
                            return
                        }
                        enter(el,attr)
                    }
                },
                {
                    fullName:'pawa-out',
                    plugin:(el,attr)=>{
                        if (el._running) {
                            return
                        }
                        exit(el,attr)
                    }
                },
                {
                    fullName:'page-layout',
                    plugin:()=>{}
                }
            ]
        }
    }))
    registerPlugin({
        afterMatch:{
            name:'pag-hydrate',
            plugin:(app,app1)=>{
                const hydrate =app1.getAttribute('page-hydrate')
                const url=app1.getAttribute('page-url')
                const context=app._context
                if (hydrate && url) {
                    const pageController=getPageController()
                        const json=JSON.parse(hydrate)
                        const params={}
                            for (const element in json) {
                                if (json[element]) {
                                    const obj=json[element]
                                    if (obj?.value || obj.value === '') {
                                        
                                        context[element].value=obj.value
                                    }
                                    if (obj?.param) {
                                        Object.assign(params,obj.param)
                                    }
                                }
                            }
                            Object.assign(pageController.params,params)
                }
            }
        }
     })
}