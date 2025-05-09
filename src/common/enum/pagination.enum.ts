export enum GetAll {
    YES = 'YES',
    NO = 'NO',
}
export enum Order {
    ASC = 'ASC',
    DESC = 'DESC'
}

export enum UserEnum{
    id = "id",
    username="username",
    email = "email",
    created_at = "created_at",
    updated_at = "updated_at",   
}

export enum UploadsEnum {
    upload_id = "upload_id",
    fieldname = "fieldname",
    originalname = "originalname",
    mimetype = "mimetype",
    size = "size",
    filename = "filename",
    path = "path",
    created_at = "created_at",
    updated_at = "updated_at", 
}

export enum PostEnum{
    id = "id",
    caption="caption",
    likesEnabled = "likesEnabled",
    user = "user",
    upload = "upload",
    created_at = "created_at",
    updated_at = "updated_at", 
}

export enum CommentEnum{
    id = "id",
    comment="comment",
    user = "user",
    post = "post",
    created_at = "created_at",
    updated_at = "updated_at", 
}

export enum likeEnum{
    id = "id",
    user = "user",
    post = "post",
    created_at = "created_at",
    updated_at = "updated_at", 
}