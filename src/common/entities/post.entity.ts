import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Likes } from './like.entity';
import { Comments } from './comment.entity';
import { Uploads } from './upload.entiity';
import { plainToClass } from 'class-transformer';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  caption: string;

  @ManyToOne(() => Uploads, (upload) => upload.posts, { nullable: true })
  @JoinColumn({ name: 'upload_id' })
  upload: Uploads;

  @ManyToOne(() => User, (user) => user.posts )
  @JoinColumn({ name: 'user_id' })
  user: User;
  
  @Column({ default: true })
  likesEnabled: boolean;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @OneToMany(() => Likes, (like) => like.post)
  likes: Likes[];

  @OneToMany(() => Comments, (comment) => comment.post)
  comments: Comments[];

   constructor(partial?, user?) {
      if (partial) {
          const data = plainToClass(Posts, partial);
          Object.assign(this, data);
      }
    }
}
