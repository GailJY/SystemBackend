interface UserInfo{
    id: number;

    username: string;

    nickName: string;

    email: string;

    headPic: string;

    phoneNumber: string;

    createTime: number;

    isFrozen: boolean;

    isAdmin: boolean;
    
    roles: string[];

    permissions: string[];
}

export class LoginUserVo{
    userInfo: UserInfo;

    accessToken: string;

    refreshToken: string;
}