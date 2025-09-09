import { pawaRender } from "pawajs-dom-rerender"
import { getPage } from "./index.js"

const oldScript=[]
const clearPageStyle=()=>{
    document.querySelectorAll('[page]').forEach(old=>{
        old.remove()
    })
}
const supaPawaTools=(newApp)=>{
    const getCurrentDD=document.querySelector('[supa-dd]')
    if (getCurrentDD) {
        getCurrentDD.remove()
    }
    const newDD=newApp.querySelector('[supa-dd]')
    if (newDD) {
        document.head.appendChild(newDD)
    }
}
export const diffHtml=async(href,current)=>{
    if(!current){
        oldScript.forEach((value,index) => {
            if(typeof value === 'function'){
                value()
            }
            oldScript.splice(index,1)
        })
        clearPageStyle()
    }
    const pageApp=getPage()
        const parser = new DOMParser()
            const app = parser.parseFromString(href, 'text/html')
            const head=app.querySelectorAll('[page]')
            const mainScript=app.querySelectorAll('[page-script]')
            supaPawaTools(app)
            if(!current){
                head.forEach((value)=>{
                    if (value.tagName === 'STYLE' || value.tagName === 'LINK') {
                        if (!value.src) {
                            document.head.appendChild(value)
                            oldScript.push(()=>{
                                value.remove()
                            })
                        }else{
                            // const style=document.createElement('style')
                            document.head.appendChild(value)
                        }
    
                    }
                })
            }
            const newApp=app.body.querySelector('#'+pageApp.getAttribute('id'))
            document.title=app.title
            
            if (!current) {
                if (mainScript.length > 0) {
                    const fetchScriptLength=app.querySelectorAll('[page-script]').length - 1
                    for (const [index, script] of Array.from(mainScript).entries()) {
                        
                            const newScript=document.createElement('script')
                            const newFile=script.getAttribute('src')
                            newScript.setAttribute('src',newFile)
                            newScript.setAttribute('page-script-src',newFile)
                            newScript.type='module'
                            newScript.async=true
                            
                             await new Promise((resolve, reject) => {
                                newScript.onload = resolve;
                            //     newScript.onerror = ()=>{
                            //           oldScript.push(()=>{
                            //     newScript.remove()
                            // })
                            // reject()
                            //     };
                                document.body.appendChild(newScript);
                                oldScript.push(()=>{
                                newScript.remove()
                            })
                            });

                             if (fetchScriptLength === index) {
                                 pawaRender(pageApp,newApp)
                             }
                            }
                    }else{
                        pawaRender(pageApp,newApp)
                    }
                    } else {
                      oldScript.length = 0
                        pawaRender(pageApp,newApp)

                    }
                
                
            }