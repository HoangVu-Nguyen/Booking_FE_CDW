export interface UserHeaderResponse {
    id:string;
    username:string;
    photoUrl:string;
    email:string;
    phoneNumber:string;
    createdAt:Date;
    roles:string[];
    address?: string;

}