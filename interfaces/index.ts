
export type Event = {
    id: number
    title : string
    cover_image_link : string
    description: string
    event_link : string 
    organizer : string 
    start_date_time : string
    start_day_week : string 
    start_time : string 
    end_time : string
    end_date_time : string 
    end_day_week : string
    display_sequence : number
    tags : Array<Tag>
  }
  
  export type Tag = {
    id : string 
    tag_name : string 
  }
   