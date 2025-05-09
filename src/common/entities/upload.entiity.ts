import { plainToClass } from "class-transformer";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { Posts } from "./post.entity";
import { generateFileUrl } from "../function/common-response.util";


@Entity('uploads')
export class Uploads {
    @PrimaryGeneratedColumn()
    upload_id: number;

    @Column({ type: 'text' })
    fieldname: string;

    @Column({ type: 'text' })
    originalname: string;

    @Column()
    mimetype: string;

    @Column()
    size: number;

    @Column({ type: 'text' })
    filename: string;

    @Column({ type: 'text' })
    path: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: string;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: string;

    url?: string;
    
    @OneToMany(() => Posts, (post) => post.upload)
    posts: Posts[];
    

    constructor(partial?, user?) {
        if (partial) {
            const data = plainToClass(Uploads, partial);
            Object.assign(this, data);
            this.url = partial.filename && generateFileUrl(partial.filename);
            
        }
    }

}
