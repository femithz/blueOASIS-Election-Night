import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { ConstituencyEntity } from './constituency.entity';

@Entity('party_results')
@Unique(['constituencyId', 'partyCode'])
export class PartyResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'constituency_id', type: 'uuid' })
  constituencyId!: string;

  @ManyToOne(() => ConstituencyEntity, (c) => c.partyResults, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'constituency_id' })
  constituency!: ConstituencyEntity;

  @Column({ name: 'party_code', type: 'varchar', length: 20 })
  partyCode!: string;

  @Column({ type: 'int' })
  votes!: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
