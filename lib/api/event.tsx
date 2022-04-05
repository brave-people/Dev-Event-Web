import axios from "axios";

const EventAPI : any= {
    fetchEvents : async (url:string, param:any) =>{
        try {
            const response = await axios.get(`${process.env.BASE_SERVER_URL}${url}`,{params : param});
            return response;
          } catch (error:any) {
            return error.response;
          }
    }
}
export {EventAPI} ;