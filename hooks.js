import axios from "axios"
import { $state } from "pawajs"

let pageController={
    params:{},
    data:{}
}

export const getPageController=()=>pageController
const fetchPageApi=()=>{
    return {
        get:(url,config={})=>{
            
            const data=$state(()=>axios.get(url,{
                headers:{
                    'X-Api-Page':true,
                    'X-From-Page':window.location.pathname
                },
                ...config
            }).then(res => res.data))
            // console.log(data,'first')
            return data
        }
    }
}

export const usePage=()=>{
    return {
        navigate:{
            back:()=>{
                history.back()
            },
            forward:()=>{
                history.forward()
            },
            to:(url)=>{
                history.pushState({},'',url)
            }
        },
        fetchPageApi:fetchPageApi,
        ...pageController
    }
}
