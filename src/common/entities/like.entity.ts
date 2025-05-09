import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';
import { Posts } from './post.entity';
import { plainToClass } from 'class-transformer';

@Entity()
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes,{ nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Posts, (post) => post.likes,{ nullable: true })
  @JoinColumn({ name: 'post_id' })
  post: Posts;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  constructor(partial?, user?) {
        if (partial) {
            const data = plainToClass(Likes, partial);
            Object.assign(this, data);
        }
      }
}
