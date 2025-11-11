import { ReginLibyana } from "./site";

export interface ICity {
  id: number;
  name: string;
}

export interface IAddress {
  id: number;
  description: string;
  street: string;
  city: ICity;
}

export interface ISchool {
  id: number;
  name: string;
  phone_no: string;
  address: IAddress;
}

export interface IUser {
  id: number;
  displayName: string;
  email: string;
  userName:string;
  KnownAs: string;
  token: string;
  photoUrl:string;
  gender:string ;
  roles: string[];

  name: string;
  birth_date: Date;
  phone_no: string;
  grade: IGrade;

  last_login?: Date;
  cover_img_url?: string;
  avatar_img_url: string;
  address: IAddress;
  school: ISchool;
  photos:IPhoto[];
}


export interface IMember {
       id: number;
        name: string;
        birth_date: Date;
        school_id: number;
        school_name: string;
        grade_id: number;
        grade_name: string;
        gender: number;
        last_login?: Date;
        cover_img_url?: string;
        avatar_img_url: string;
        is_blocked: number;
        is_friend: number;
        is_friend_request: number;
}
export interface IPhoto {
  id: number;
  user_id: number;
  image_path: string;
  image_name: string;
  image_ext: string;
  is_avatar: number;
  is_cover: number;
}

export interface IFriend {
  id: number;
  name: string;
  birth_date?: any;
  school_id: number;
  school_name: string;
  grade_id: number;
  grade_name: string;
  gender: number;
  last_login?: any;
  cover_img_url?: any;
  avatar_img_url: string;
  is_friend: number;
  is_friend_request_by_me: number;
  is_friend_request_to_me: number;
}

export interface IGrade {
  id: number;
  name: string;
  stage_name: string;
  curriculum_name: string;
}

export interface IUserDto {
  id: string;
  name: string;
  age: number;
  appName:string;
  roles: string[];
  gender: string;
  email: string;
  last_login?: Date;
  addressCity: string;

}




export interface IUserNew {
  id: string
  appName:string;
  displayName: string;
  userName:string;
  KnownAs: string;
  token: string;
  roles: string[];
  regins:any[];
  address: Address
  photoUrl: string
   email: string
  age: number
  knownAs: string
  created: string
  lastActive: string
  gender: string
  introduction: string
  lookingFor: string
  interests: string
  city: string
  codeUser: string
  phoneNumber:string
 
}
export interface IUsertDto{
  id: string
  displayName: string;
  userName:string;
  KnownAs: string;
  token: string;
  roles: string[];
  address: Address
  photoUrlFile: File
  appName:string;
  email: string
  age: number
  knownAs: string
  created: string
  lastActive: string
  gender: string
  introduction: string
  lookingFor: string
  interests: string
  city: string
  codeUser: string

}
export interface IUser {
  id: number;
  name: string;
  birth_date: Date;
  phone_no: string;
  grade: IGrade;
  roles: string[];
  email: string;
  last_login?: Date;
  cover_img_url?: string;
  avatar_img_url: string;
  address: IAddress;
  school: ISchool;
  isFriend: boolean;
  isBlocked: boolean;
  isFriendsRequiat: boolean;
  friends:IFriend[];
  images:IPhoto[];
}

export interface IMember {
    id: number;
        name: string;
        birth_date: Date;
        school_id: number;
        school_name: string;
        grade_id: number;
        grade_name: string;
        gender: number;
        last_login?: Date;
        cover_img_url?: string;
        avatar_img_url: string;
        is_blocked: number;
        is_friend: number;
        is_friend_request_by_me: number;
        is_friend_request_to_me: number;

}

export interface imgToAdd {
  image_base64: string;
}
export interface imgToEdith {
  image_id: number;
  image_type: string;
}


export interface ISubject {
  id: number;
  name: string;
  avatar?: any;
  grade_name: string;
  publish_date: string;
  question_count: string;
}


export interface ILesson {
  id: number;
  name: string;
  page_no: number;
}

export interface ISubjectIndex {
  subject_id: number;
  subject_name: string;
  subject_avatar?: any;
  id: number;
  index_name: string;
  index_title: string;
  lessons: ILesson[];
}





  export interface IElement {
      id: number;
      element_name: string;
      width: string;
      height: string;
      direction: string;
      class: string;
      content: string;
      is_bold: number;
      is_header: number;
  }

  export interface ICol {
      id: number;
      element_name: string;
      width?: any;
      height?: any;
      direction: string;
      class: string;
      elements: IElement[];
  }

  export interface ISection {
      id: number;
      element_name: string;
      cols: ICol[];
  }

  export interface Page {
      id: number;
      page_no: number;
      page_order_no: number;
      sections: ISection[];
  }

  export interface ISubjectContent {
    subject_name: string;
    index_name: string;
    index_title: string;
    lesson_name: string;
      pages: Page[];
  }
  export interface updateLine{
    id: number;
    is_header: boolean;
    is_bold: boolean;
    content: string;


    }

export interface Questions {
  start_line :number;
  end_line:number;
  start_char:number;
  end_char:number;
  content:string;
  //end boday

  //qusetion
  question_MSQ:{
    boday:string;
   MSQ_opt: [{value:true,text:string }]
   answer:string;
  };
  question_Complate:{
    boday:string;
     complate_opt: [{value:true, start_char:number,end_char:number;}]
  };
  question_TAF:boolean ;
  question_MatchList: boolean;
}



export interface questionInfoLevel {
  id: number;
  name: string;
  arabic_name: string;
  hint: string;
}


export interface questionViewTypes {
  id: number;
  name: string;
  arabic_name: string;
}











export interface Address {
  firstName: string
  lastName: string
  street: string
  city: string
  state: string
  zipCode: string
}

export interface Photo {
  id: number
  url: string
  isMain: boolean,
  is_cover:boolean,
}
