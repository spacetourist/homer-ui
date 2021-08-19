export interface User {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    partid: number;
    usergroup: string;
    department: string;
    id?: number;
    guid?: string;
    scope?: string;
    token?: string;
    user?: {
        admin: boolean;
        username: string;
    }
}
