import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Posts } from './post.entity';
import { plainToClass } from 'class-transformer';

@Entity()
export class Comments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @ManyToOne(() => User, (user) => user.comments,{ nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Posts, (post) => post.comments,{ nullable: true })
  @JoinColumn({ name: 'post_id' })
  post: Posts;

  constructor(partial?, user?) {
        if (partial) {
            const data = plainToClass(Comments, partial);
            Object.assign(this, data);
        }
      }
}
