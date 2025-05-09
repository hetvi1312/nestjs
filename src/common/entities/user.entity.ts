import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Posts } from './post.entity';
import { Likes } from './like.entity';
import { Comments } from './comment.entity';
import { Exclude, plainToClass } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @OneToMany(() => Posts, (post) => post.user)
  posts: Posts[];

  @OneToMany(() => Likes, (like) => like.user)
  likes: Likes[];

  @OneToMany(() => Comments, (comment) => comment.user)
  comments: Comments[];

  constructor(partial?, user?) {
    if (partial) {
        const data = plainToClass(User, partial);
        Object.assign(this, data);
    }
  }
}
