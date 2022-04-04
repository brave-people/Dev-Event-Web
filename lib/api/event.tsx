import axios from "axios";

const EventAPI : any= {
    fetchEvents : async (url:string) =>{
        try {
            const response = await axios.get(url);
            return response;
          } catch (error:any) {
            return error.response;
          }
    }
}
export {EventAPI} ;